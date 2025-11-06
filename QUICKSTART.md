# 🚀 Quick Start Guide - DuBuddy CRUD Platform

## ⚡ Get Up and Running in 5 Minutes

### Step 1: Install Dependencies (2 minutes)
```powershell
# From project root
npm install
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### Step 2: Setup Database (1 minute)
```powershell
cd backend
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

### Step 3: Start Application (30 seconds)
```powershell
# From project root - starts both servers
npm run dev
```

✅ **Done!** Open your browser:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 📝 First Time User Flow

### 1. Register (30 seconds)
- Go to http://localhost:3000
- Click "Register"
- Use these credentials:
  - **Email**: admin@test.com
  - **Password**: password123
  - **Name**: Admin User
  - **Role**: Admin

### 2. Explore Pre-loaded Models (1 minute)
After login, you'll see 3 sample models:
- **Employee** - HR management
- **Product** - Inventory tracking
- **Student** - Education records

Click "View Data" on any model to see the data management interface.

### 3. Create Your First Model (2 minutes)
1. Click "Create Model"
2. Enter model name: "Task"
3. Add fields:
   - title (string, required)
   - description (string)
   - status (string, required)
   - dueDate (date)
   - completed (boolean, default: false)
4. Configure RBAC (already set with defaults)
5. Click "Publish Model"

### 4. Add Data (1 minute)
1. From dashboard, click "View Data" on your Task model
2. Click "Add Record"
3. Fill in the form
4. Click "Create"

🎉 **You've successfully created a complete CRUD system in under 5 minutes!**

---

## 🔍 What Just Happened?

When you published the "Task" model:

1. ✅ A file was created: `backend/models/Task.json`
2. ✅ 5 REST APIs were automatically generated:
   - POST /api/task
   - GET /api/task
   - GET /api/task/:id
   - PUT /api/task/:id
   - DELETE /api/task/:id
3. ✅ RBAC was automatically applied
4. ✅ Admin UI was generated with forms and tables

---

## 🧪 Test the API Directly

### Get Auth Token
```powershell
# Login
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@test.com","password":"password123"}'

$token = $response.token
Write-Host "Token: $token"
```

### Test Model API
```powershell
# Create a product
Invoke-RestMethod -Uri "http://localhost:5000/api/product" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"sku":"LAP-001","name":"MacBook Pro","price":2499.99,"category":"Electronics","stockQuantity":50}'

# Get all products
Invoke-RestMethod -Uri "http://localhost:5000/api/product" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $token"}
```

---

## 📂 Understanding the File Structure

```
backend/models/
├── Employee.json     ← Model definition
├── Product.json      ← Model definition
└── Task.json         ← Your new model (after creation)
```

Open any JSON file to see the model structure. You can even edit these files directly and restart the server - changes will be reflected!

---

## 🎯 Try These Next

### Experiment with RBAC
1. Create a new user with role "Viewer"
2. Login as Viewer
3. Try to create a record (will be denied)
4. You can only view data

### Add Complex Fields
Try creating a model with:
- Email validation: `type: "email"`
- JSON data: `type: "json"` for storing objects/arrays
- Dates: `type: "date"` for timestamps

### Test Ownership
1. Add `ownerField: "userId"` to a model
2. Create records as different users
3. Users can only edit their own records (unless Admin)

---

## 🆘 Troubleshooting

### Port Already in Use
If ports 3000 or 5000 are busy:
1. Backend: Edit `backend/.env` → change PORT
2. Frontend: Edit `frontend/vite.config.ts` → change server.port

### Database Locked
```powershell
cd backend
rm dev.db
npx prisma migrate dev --name init
```

### Module Not Found
```powershell
# Clean install
rm -r node_modules
rm -r backend/node_modules
rm -r frontend/node_modules
npm run install-all
```

---

## 📚 Learn More

- **Full API Docs**: See README.md → API Documentation section
- **Architecture**: See README.md → Architecture section
- **Sample Models**: Check `backend/models/` folder

---

**Happy Building! 🎉**

Need help? The code is well-commented and structured for easy understanding.
