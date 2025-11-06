# 🚀 Auto-Generated CRUD + RBAC Platform

A powerful low-code platform that allows you to define data models via a web UI and automatically generates CRUD APIs, admin interfaces, and role-based access control. Built with modern technologies for scalability and maintainability.

## ✨ Features

- **📝 Visual Model Builder**: Define data models through an intuitive web interface
- **🔄 Auto-Generated CRUD APIs**: REST endpoints created automatically for each model
- **📁 File-Based Persistence**: Models stored as JSON files for version control
- **🔐 Role-Based Access Control (RBAC)**: Granular permissions per model and role
- **👤 Ownership Rules**: Optional per-record ownership for multi-tenant scenarios
- **🎨 Dynamic Admin UI**: Auto-generated forms and tables for data management
- **🔒 JWT Authentication**: Secure token-based authentication
- **⚡ Hot Reload**: Changes reflected immediately without server restart
- **🎯 Type Safety**: Full TypeScript support on both backend and frontend

## 🏗️ Architecture

### Backend
- **Node.js + TypeScript + Express**: Robust and type-safe server
- **Prisma + SQLite**: Modern ORM with easy database management
- **JWT**: Secure authentication
- **Dynamic Route Registration**: Models loaded on startup and routes created automatically

### Frontend
- **React + TypeScript**: Component-based UI with type safety
- **Vite**: Lightning-fast development and build tool
- **Tailwind CSS**: Utility-first styling
- **Zustand**: Lightweight state management
- **React Router**: Client-side routing

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Setup Database

```powershell
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Configure Environment

The backend already has a `.env` file configured with SQLite (no additional setup needed). For production, update the `.env` file:

```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 4. Start Development Servers

```powershell
# From project root - starts both backend and frontend
npm run dev

# OR start individually:
# Backend (from backend folder)
npm run dev

# Frontend (from frontend folder)  
npm run dev
```

- Backend runs on: `http://localhost:5000`
- Frontend runs on: `http://localhost:3000`

## 📖 How to Use

### Step 1: Register an Account

1. Navigate to `http://localhost:3000`
2. Click "Register" 
3. Fill in your details and select a role:
   - **Admin**: Full access (create models, manage all data)
   - **Manager**: Create, read, update data
   - **Viewer**: Read-only access

### Step 2: Create a Model

1. Login and click "Create Model"
2. Define your model:
   - **Model Name**: E.g., "Employee", "Product", "Student"
   - **Table Name**: Optional (defaults to lowercase plural)
   - **Owner Field**: Optional field name for ownership (e.g., "ownerId")
   
3. Add Fields:
   - Name (required)
   - Type: string, number, boolean, date, email, json
   - Required checkbox
   - Unique checkbox
   - Default value (optional)

4. Configure RBAC:
   - Set permissions per role (create, read, update, delete, all)
   
5. Click "Publish Model"

### Step 3: Model File is Created

When you publish a model, a JSON file is created in `backend/models/<ModelName>.json`:

```json
{
  "name": "Employee",
  "tableName": "employees",
  "fields": [
    { "name": "name", "type": "string", "required": true },
    { "name": "email", "type": "email", "required": true, "unique": true },
    { "name": "age", "type": "number" },
    { "name": "isActive", "type": "boolean", "default": true }
  ],
  "ownerField": "ownerId",
  "rbac": {
    "Admin": ["all"],
    "Manager": ["create", "read", "update"],
    "Viewer": ["read"]
  },
  "timestamps": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Step 4: CRUD APIs Are Auto-Generated

The following endpoints are immediately available:

```
POST   /api/employee       - Create employee
GET    /api/employee       - List all employees
GET    /api/employee/:id   - Get employee by ID
PUT    /api/employee/:id   - Update employee
DELETE /api/employee/:id   - Delete employee
```

All requests require `Authorization: Bearer <token>` header.

### Step 5: Manage Data via Admin UI

1. From dashboard, click "View Data" on any model
2. Click "Add Record" to create new records
3. Edit or delete records using action buttons
4. RBAC permissions are enforced automatically

## 🔧 How It Works

### File-Based Model System

1. **Model Definition**: User creates model via UI
2. **File Write**: Backend writes JSON file to `backend/models/`
3. **Dynamic Loading**: `ModelLoader` service reads all JSON files on startup
4. **Route Registration**: Dynamic router creates CRUD endpoints for each model
5. **RBAC Enforcement**: Middleware checks permissions for every request

### Key Components

**Backend:**
- `ModelLoader`: Loads and manages model definitions from files
- `CRUDService`: Generic service for CRUD operations on any model
- `RBAC Middleware`: Checks permissions and ownership
- `Dynamic Router`: Creates routes for all models

**Frontend:**
- `ModelBuilder`: Form to create/edit model definitions
- `DataManager`: Generic component to manage records for any model
- `Dashboard`: Lists all models with management actions

## 🧪 Testing the API

### 1. Register User
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@test.com\",\"password\":\"password123\",\"name\":\"Admin User\",\"role\":\"Admin\"}'
```

### 2. Login
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@test.com\",\"password\":\"password123\"}'
```

### 3. Create Model
```powershell
curl -X POST http://localhost:5000/api/models `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{\"name\":\"Product\",\"fields\":[{\"name\":\"name\",\"type\":\"string\",\"required\":true},{\"name\":\"price\",\"type\":\"number\",\"required\":true}],\"rbac\":{\"Admin\":[\"all\"],\"Manager\":[\"read\",\"create\",\"update\"],\"Viewer\":[\"read\"]}}'
```

### 4. Use CRUD API
```powershell
# Create record
curl -X POST http://localhost:5000/api/product `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{\"name\":\"Laptop\",\"price\":999.99}'

# Get all records
curl http://localhost:5000/api/product `
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📁 Project Structure

```
DuBuddy/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Entry point
│   │   ├── types/                # TypeScript interfaces
│   │   ├── middleware/           # Auth, RBAC, error handling
│   │   ├── routes/               # Auth, model, dynamic routes
│   │   └── services/             # ModelLoader, CRUD service
│   ├── models/                   # Model JSON files (auto-generated)
│   ├── prisma/                   # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Layout, shared components
│   │   ├── pages/                # Login, Dashboard, ModelBuilder, DataManager
│   │   ├── services/             # API client
│   │   ├── store/                # State management
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 🎯 Key Features Breakdown

### 1. Dynamic Model Definition
- Visual form builder with field types
- Validation rules (required, unique)
- Default values
- Relations support (optional)

### 2. File-Based Persistence
- Models saved as JSON in `/backend/models/`
- Version control friendly
- Easy backup and migration
- Hot reload support

### 3. Auto-Generated CRUD
- RESTful endpoints created automatically
- Consistent API patterns
- Type validation based on field definitions
- Timestamps added automatically

### 4. Advanced RBAC
- Role-based permissions per model
- Operation-level control (CRUD)
- Ownership validation
- Hierarchical access (Admin > Manager > Viewer)

### 5. Admin Interface
- Dynamic forms generated from model definition
- Field type-specific inputs
- Validation feedback
- Responsive design

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Ownership validation
- CORS protection
- Helmet.js security headers
- Input validation with Zod (extensible)

## 🚀 Production Deployment

### Backend
```powershell
cd backend
npm run build
npm start
```

### Frontend
```powershell
cd frontend
npm run build
# Serve the dist/ folder with your web server
```

### Environment Variables (Production)
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="use-a-strong-random-secret"
```

## 🛠️ Extending the Platform

### Add New Field Types
Edit `backend/src/services/crud.service.ts` and add validation logic.

### Add New Roles
Update `backend/src/routes/model.routes.ts` and add role in RBAC configuration.

### Add Audit Logs
Extend `CRUDService` to log all operations with user info and timestamps.

### Add Field Relations
Extend model definition to support foreign keys and implement join queries.

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Model Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/models` | List all models | Authenticated |
| GET | `/api/models/:name` | Get model details | Authenticated |
| POST | `/api/models` | Create new model | Admin only |
| PUT | `/api/models/:name` | Update model | Admin only |
| DELETE | `/api/models/:name` | Delete model | Admin only |

### Dynamic CRUD Endpoints

| Method | Endpoint | Description | RBAC |
|--------|----------|-------------|------|
| POST | `/api/:modelName` | Create record | create permission |
| GET | `/api/:modelName` | List records | read permission |
| GET | `/api/:modelName/:id` | Get record | read permission |
| PUT | `/api/:modelName/:id` | Update record | update permission |
| DELETE | `/api/:modelName/:id` | Delete record | delete permission |

## 🎓 Sample Models

Sample model files are included in `backend/models/` to help you get started quickly!

## 🤝 Contributing

This project demonstrates a production-ready architecture for auto-generated CRUD platforms. Feel free to extend it with:
- Field validations
- Relations between models
- File uploads
- Advanced filtering
- Pagination
- GraphQL API option
- Multi-database support

## 📝 License

MIT License - feel free to use this for your projects!

## 🙏 Acknowledgments

Built with modern best practices and clean architecture principles to demonstrate:
- Separation of concerns
- DRY principles
- Type safety
- Security best practices
- Scalable architecture
- Developer experience

---

**Made with ❤️ for the SDE Assignment**

*This platform showcases expertise in full-stack development, system design, security, and modern web technologies.*
