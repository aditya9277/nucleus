import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Authentication API', () => {
  let authToken: string;
  const testUser = {
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User',
    role: 'Admin'
  };

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
    await prisma.$disconnect();
  });

  test('POST /api/auth/register - should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe(testUser.email);
    expect(response.body.user.role).toBe(testUser.role);
  });

  test('POST /api/auth/register - should reject duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(400);
  });

  test('POST /api/auth/login - should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe(testUser.email);
    
    authToken = response.body.token;
  });

  test('POST /api/auth/login - should reject invalid credentials', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      })
      .expect(401);
  });

  test('GET /api/auth/me - should get current user with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.email).toBe(testUser.email);
  });

  test('GET /api/auth/me - should reject without token', async () => {
    await request(app)
      .get('/api/auth/me')
      .expect(401);
  });
});

describe('Model Management API', () => {
  let authToken: string;
  const testModel = {
    name: 'TestModel',
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'count', type: 'number' }
    ],
    rbac: {
      Admin: ['all'],
      Manager: ['read', 'create'],
      Viewer: ['read']
    }
  };

  beforeAll(async () => {
    // Create admin user and get token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'modeladmin@example.com',
        password: 'admin123',
        name: 'Model Admin',
        role: 'Admin'
      });
    
    authToken = userResponse.body.token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: { email: 'modeladmin@example.com' }
    });
    await prisma.$disconnect();
  });

  test('POST /api/models - Admin should create model', async () => {
    const response = await request(app)
      .post('/api/models')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testModel)
      .expect(201);

    expect(response.body.message).toContain('published successfully');
  });

  test('GET /api/models - should list all models', async () => {
    const response = await request(app)
      .get('/api/models')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('models');
    expect(Array.isArray(response.body.models)).toBe(true);
  });

  test('GET /api/models/:name - should get specific model', async () => {
    const response = await request(app)
      .get(`/api/models/${testModel.name}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.name).toBe(testModel.name);
    expect(response.body.fields).toHaveLength(2);
  });

  test('DELETE /api/models/:name - should delete model', async () => {
    await request(app)
      .delete(`/api/models/${testModel.name}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});

describe('Dynamic CRUD API', () => {
  let adminToken: string;
  let managerToken: string;
  let viewerToken: string;
  let recordId: string;

  const testModel = {
    name: 'Task',
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'completed', type: 'boolean', default: false }
    ],
    rbac: {
      Admin: ['all'],
      Manager: ['create', 'read', 'update'],
      Viewer: ['read']
    }
  };

  beforeAll(async () => {
    // Create users with different roles
    const admin = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'crudadmin@example.com',
        password: 'admin123',
        name: 'CRUD Admin',
        role: 'Admin'
      });
    adminToken = admin.body.token;

    const manager = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'crudmanager@example.com',
        password: 'manager123',
        name: 'CRUD Manager',
        role: 'Manager'
      });
    managerToken = manager.body.token;

    const viewer = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'crudviewer@example.com',
        password: 'viewer123',
        name: 'CRUD Viewer',
        role: 'Viewer'
      });
    viewerToken = viewer.body.token;

    // Create test model
    await request(app)
      .post('/api/models')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(testModel);
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['crudadmin@example.com', 'crudmanager@example.com', 'crudviewer@example.com']
        }
      }
    });
    await prisma.dynamicRecord.deleteMany({
      where: { modelName: testModel.name.toLowerCase() }
    });
    await prisma.$disconnect();
  });

  test('POST /api/:modelName - Manager can create record', async () => {
    const response = await request(app)
      .post(`/api/${testModel.name}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ title: 'Test Task', completed: false })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Task');
    recordId = response.body.id;
  });

  test('POST /api/:modelName - Viewer cannot create', async () => {
    await request(app)
      .post(`/api/${testModel.name}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ title: 'Another Task' })
      .expect(403);
  });

  test('GET /api/:modelName - All roles can read', async () => {
    const response = await request(app)
      .get(`/api/${testModel.name}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('GET /api/:modelName/:id - Get specific record', async () => {
    const response = await request(app)
      .get(`/api/${testModel.name}/${recordId}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(200);

    expect(response.body.id).toBe(recordId);
  });

  test('PUT /api/:modelName/:id - Manager can update', async () => {
    const response = await request(app)
      .put(`/api/${testModel.name}/${recordId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ completed: true })
      .expect(200);

    expect(response.body.completed).toBe(true);
  });

  test('PUT /api/:modelName/:id - Viewer cannot update', async () => {
    await request(app)
      .put(`/api/${testModel.name}/${recordId}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ completed: false })
      .expect(403);
  });

  test('DELETE /api/:modelName/:id - Viewer cannot delete', async () => {
    await request(app)
      .delete(`/api/${testModel.name}/${recordId}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(403);
  });

  test('DELETE /api/:modelName/:id - Admin can delete', async () => {
    await request(app)
      .delete(`/api/${testModel.name}/${recordId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});

describe('RBAC Enforcement', () => {
  let adminToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    const admin = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'rbacadmin@example.com',
        password: 'admin123',
        name: 'RBAC Admin',
        role: 'Admin'
      });
    adminToken = admin.body.token;

    const viewer = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'rbacviewer@example.com',
        password: 'viewer123',
        name: 'RBAC Viewer',
        role: 'Viewer'
      });
    viewerToken = viewer.body.token;
  });

  test('Only Admin can create models', async () => {
    const model = {
      name: 'RestrictedModel',
      fields: [{ name: 'data', type: 'string' }],
      rbac: { Admin: ['all'] }
    };

    await request(app)
      .post('/api/models')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send(model)
      .expect(403);

    await request(app)
      .post('/api/models')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(model)
      .expect(201);
  });

  test('Only Admin can delete models', async () => {
    await request(app)
      .delete('/api/models/RestrictedModel')
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(403);

    await request(app)
      .delete('/api/models/RestrictedModel')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: ['rbacadmin@example.com', 'rbacviewer@example.com'] }
      }
    });
    await prisma.$disconnect();
  });
});
