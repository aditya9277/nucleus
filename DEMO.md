# 🎬 Demo Script - DuBuddy Platform

This script demonstrates the complete functionality of the platform.

## Prerequisites
- Application must be running (npm run dev)
- Fresh database (or follow along with existing data)

---

## Part 1: Authentication & User Management

### Create Admin User
```powershell
# Register as Admin
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "admin@dubuddy.com",
    "password": "admin123",
    "name": "Super Admin",
    "role": "Admin"
  }'
```

### Create Manager User
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "manager@dubuddy.com",
    "password": "manager123",
    "name": "John Manager",
    "role": "Manager"
  }'
```

### Create Viewer User
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "viewer@dubuddy.com",
    "password": "viewer123",
    "name": "Jane Viewer",
    "role": "Viewer"
  }'
```

### Login as Admin
```powershell
$adminResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@dubuddy.com","password":"admin123"}'

$adminToken = $adminResponse.token
Write-Host "Admin Token: $adminToken"
```

---

## Part 2: Model Creation & Publishing

### View Existing Models
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/models" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $adminToken"}
```

### Create a New Model: "Project"
```powershell
$projectModel = @{
  name = "Project"
  tableName = "projects"
  fields = @(
    @{name="projectId"; type="string"; required=$true; unique=$true},
    @{name="name"; type="string"; required=$true},
    @{name="description"; type="string"},
    @{name="budget"; type="number"; required=$true},
    @{name="startDate"; type="date"; required=$true},
    @{name="endDate"; type="date"},
    @{name="status"; type="string"; default="Planning"},
    @{name="isActive"; type="boolean"; default=$true}
  )
  ownerField = "managerId"
  rbac = @{
    Admin = @("all")
    Manager = @("create","read","update")
    Viewer = @("read")
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:5000/api/models" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $adminToken"} `
  -ContentType "application/json" `
  -Body $projectModel
```

**✅ Model file created at: `backend/models/Project.json`**
**✅ CRUD APIs automatically available at `/api/project`**

---

## Part 3: CRUD Operations

### Create Project Records
```powershell
# Project 1
$project1 = @{
  projectId = "PROJ-001"
  name = "Website Redesign"
  description = "Complete overhaul of company website"
  budget = 50000
  startDate = "2024-02-01"
  status = "In Progress"
  isActive = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/project" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $adminToken"} `
  -ContentType "application/json" `
  -Body $project1

# Project 2
$project2 = @{
  projectId = "PROJ-002"
  name = "Mobile App Development"
  description = "iOS and Android app for customer portal"
  budget = 100000
  startDate = "2024-03-01"
  status = "Planning"
  isActive = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/project" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $adminToken"} `
  -ContentType "application/json" `
  -Body $project2
```

### Read All Projects
```powershell
$projects = Invoke-RestMethod -Uri "http://localhost:5000/api/project" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $adminToken"}

Write-Host "Total Projects: $($projects.count)"
$projects.data | Format-Table
```

### Read Single Project
```powershell
$projectId = $projects.data[0].id

Invoke-RestMethod -Uri "http://localhost:5000/api/project/$projectId" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $adminToken"}
```

### Update Project
```powershell
$updateData = @{
  status = "Completed"
  endDate = "2024-06-30"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/project/$projectId" `
  -Method PUT `
  -Headers @{"Authorization"="Bearer $adminToken"} `
  -ContentType "application/json" `
  -Body $updateData
```

---

## Part 4: RBAC Testing

### Login as Manager
```powershell
$managerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"manager@dubuddy.com","password":"manager123"}'

$managerToken = $managerResponse.token
```

### Manager Can Create
```powershell
$project3 = @{
  projectId = "PROJ-003"
  name = "Database Migration"
  budget = 25000
  startDate = "2024-04-01"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/project" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $managerToken"} `
  -ContentType "application/json" `
  -Body $project3
```

### Manager Can Read
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/project" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $managerToken"}
```

### Manager Can Update
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/project/$projectId" `
  -Method PUT `
  -Headers @{"Authorization"="Bearer $managerToken"} `
  -ContentType "application/json" `
  -Body '{"status":"On Hold"}'
```

### Login as Viewer
```powershell
$viewerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"viewer@dubuddy.com","password":"viewer123"}'

$viewerToken = $viewerResponse.token
```

### Viewer Can Only Read
```powershell
# This works
Invoke-RestMethod -Uri "http://localhost:5000/api/project" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $viewerToken"}

# This will fail with 403 Forbidden
try {
  Invoke-RestMethod -Uri "http://localhost:5000/api/project" `
    -Method POST `
    -Headers @{"Authorization"="Bearer $viewerToken"} `
    -ContentType "application/json" `
    -Body '{"projectId":"PROJ-999","name":"Test","budget":1000,"startDate":"2024-01-01"}'
} catch {
  Write-Host "❌ Access Denied: $_" -ForegroundColor Red
}
```

---

## Part 5: Sample Data for Pre-loaded Models

### Create Employees
```powershell
# Employee 1
$employee1 = @{
  employeeId = "EMP-001"
  firstName = "Alice"
  lastName = "Johnson"
  email = "alice.johnson@dubuddy.com"
  department = "Engineering"
  position = "Senior Developer"
  salary = 95000
  joinDate = "2023-01-15"
  isActive = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/employee" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $adminToken"} `
  -ContentType "application/json" `
  -Body $employee1

# Employee 2
$employee2 = @{
  employeeId = "EMP-002"
  firstName = "Bob"
  lastName = "Smith"
  email = "bob.smith@dubuddy.com"
  department = "Sales"
  position = "Sales Manager"
  salary = 85000
  joinDate = "2023-03-20"
  isActive = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/employee" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $adminToken"} `
  -ContentType "application/json" `
  -Body $employee2
```

### Create Products
```powershell
# Product 1
$product1 = @{
  sku = "TECH-001"
  name = "Wireless Mouse"
  description = "Ergonomic wireless mouse with 6 buttons"
  price = 29.99
  category = "Electronics"
  stockQuantity = 150
  isAvailable = $true
  tags = @("wireless","ergonomic","productivity")
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:5000/api/product" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $adminToken"} `
  -ContentType "application/json" `
  -Body $product1

# Product 2
$product2 = @{
  sku = "TECH-002"
  name = "Mechanical Keyboard"
  description = "RGB backlit mechanical keyboard"
  price = 89.99
  category = "Electronics"
  stockQuantity = 75
  isAvailable = $true
  tags = @("mechanical","rgb","gaming")
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:5000/api/product" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $adminToken"} `
  -ContentType "application/json" `
  -Body $product2
```

### Create Students
```powershell
# Student 1
$student1 = @{
  studentId = "STU-001"
  firstName = "Emma"
  lastName = "Wilson"
  email = "emma.wilson@school.edu"
  dateOfBirth = "2005-06-15"
  grade = "12th"
  gpa = 3.8
  enrollmentDate = "2020-09-01"
  isEnrolled = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/student" `
  -Method POST `
  -Headers @{"Authorization"="Bearer $adminToken"} `
  -ContentType "application/json" `
  -Body $student1
```

---

## Part 6: Verify Everything

### List All Models
```powershell
$allModels = Invoke-RestMethod -Uri "http://localhost:5000/api/models" `
  -Method GET `
  -Headers @{"Authorization"="Bearer $adminToken"}

Write-Host "`n✅ Total Models: $($allModels.count)" -ForegroundColor Green
$allModels.models | Format-Table name, fieldCount, @{Label="Table"; Expression={$_.tableName}}
```

### Count Records in Each Model
```powershell
$modelNames = @("employee", "product", "student", "project")

foreach ($modelName in $modelNames) {
  try {
    $data = Invoke-RestMethod -Uri "http://localhost:5000/api/$modelName" `
      -Method GET `
      -Headers @{"Authorization"="Bearer $adminToken"}
    
    Write-Host "✅ $modelName : $($data.count) records" -ForegroundColor Green
  } catch {
    Write-Host "❌ $modelName : Error fetching" -ForegroundColor Red
  }
}
```

---

## 🎉 Demo Complete!

### What We Demonstrated:

1. ✅ User registration with different roles
2. ✅ JWT authentication
3. ✅ Dynamic model creation via API
4. ✅ File-based model persistence
5. ✅ Auto-generated CRUD endpoints
6. ✅ Full RBAC enforcement
7. ✅ Create, Read, Update operations
8. ✅ Role-based permission testing
9. ✅ Multiple models working simultaneously

### Next Steps:

1. Open http://localhost:3000 in browser
2. Login with any created user
3. Explore the UI version of all these operations
4. Create more models through the visual builder
5. Test the data management interface

---

**Platform is production-ready! 🚀**
