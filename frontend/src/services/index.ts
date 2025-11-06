import api from './api';

export interface ModelField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'json';
  required?: boolean;
  unique?: boolean;
  default?: any;
  relation?: {
    model: string;
    field: string;
  };
}

export interface ModelRBAC {
  [role: string]: Array<'create' | 'read' | 'update' | 'delete' | 'all'>;
}

export interface ModelDefinition {
  name: string;
  tableName?: string;
  fields: ModelField[];
  ownerField?: string;
  rbac: ModelRBAC;
  timestamps?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, name: string, role?: string) => {
    const response = await api.post('/auth/register', { email, password, name, role });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const modelService = {
  getAll: async () => {
    const response = await api.get('/models');
    return response.data;
  },

  getOne: async (name: string) => {
    const response = await api.get(`/models/${name}`);
    return response.data;
  },

  create: async (model: ModelDefinition) => {
    const response = await api.post('/models', model);
    return response.data;
  },

  update: async (name: string, model: ModelDefinition) => {
    const response = await api.put(`/models/${name}`, model);
    return response.data;
  },

  delete: async (name: string) => {
    const response = await api.delete(`/models/${name}`);
    return response.data;
  },
};

export const crudService = {
  getAll: async (modelName: string) => {
    const response = await api.get(`/${modelName}`);
    return response.data;
  },

  getOne: async (modelName: string, id: string) => {
    const response = await api.get(`/${modelName}/${id}`);
    return response.data;
  },

  create: async (modelName: string, data: any) => {
    const response = await api.post(`/${modelName}`, data);
    return response.data;
  },

  update: async (modelName: string, id: string, data: any) => {
    const response = await api.put(`/${modelName}/${id}`, data);
    return response.data;
  },

  delete: async (modelName: string, id: string) => {
    const response = await api.delete(`/${modelName}/${id}`);
    return response.data;
  },
};
