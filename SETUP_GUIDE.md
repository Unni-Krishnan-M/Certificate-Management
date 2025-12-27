# Certificate Management System - Setup & Usage Guide

## 🚀 System Status

✅ **Backend**: Running on http://localhost:8080  
✅ **Frontend**: Running on http://localhost:3000  
✅ **MongoDB**: Connected to mongodb://localhost:27017  
✅ **API**: All endpoints functional  

## 📋 Quick Start

### 1. Access the Application
Open your browser and go to: **http://localhost:3000**

### 2. Create Accounts

#### Register as Student:
- Username: `student1`
- Password: `password123`
- Full Name: `John Doe`
- Email: `john@example.com`
- Role: `Student`

#### Register as Staff:
- Username: `staff1`
- Password: `password123`
- Full Name: `Jane Smith`
- Email: `jane@example.com`
- Role: `Staff`

### 3. Test the System

#### As Student:
1. Login with student credentials
2. Upload a certificate (PDF, JPG, or PNG)
3. View your certificates and their status
4. **View certificates** directly in the browser (PDF preview or image display)
5. Download certificates anytime

#### As Staff:
1. Login with staff credentials
2. View all student certificates
3. **Preview certificates** directly in the browser before reviewing
4. Search certificates by student name
5. Filter by status (Pending/Verified/Rejected)
6. Verify or reject certificates with remarks

## 🔧 System Architecture

### Backend (Spring Boot)
- **Port**: 8080
- **Database**: MongoDB (localhost:27017)
- **File Storage**: GridFS
- **Authentication**: JWT tokens
- **Security**: Role-based access control

### Frontend (React)
- **Port**: 3000
- **Proxy**: Configured to backend (8080)
- **State Management**: Context API
- **Routing**: React Router
- **HTTP Client**: Axios

## 📁 Project Structure

```
certificate-system/
├── backend/                    # Spring Boot Application
│   ├── src/main/java/com/certify/
│   │   ├── config/            # Security & MongoDB config
│   │   ├── controller/        # REST API endpoints
│   │   ├── model/             # User & Certificate entities
│   │   ├── repository/        # MongoDB repositories
│   │   ├── service/           # Business logic
│   │   ├── security/          # JWT authentication
│   │   └── exception/         # Error handling
│   ├── pom.xml               # Maven dependencies
│   └── run.bat               # Startup script
├── frontend/                  # React Application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── context/          # Authentication context
│   │   ├── App.js           # Main app component
│   │   └── App.css          # Styling
│   └── package.json         # NPM dependencies
└── test-api.html            # API testing page
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Student Operations
- `GET /api/student/certificates` - Get my certificates
- `POST /api/student/certificates/upload` - Upload certificate
- `GET /api/student/certificates/{id}/view` - **View certificate in browser**
- `GET /api/student/certificates/{id}/download` - Download certificate
- `DELETE /api/student/certificates/{id}` - Delete certificate

### Staff Operations
- `GET /api/staff/certificates` - Get all certificates
- `GET /api/staff/certificates/search?studentName={name}` - Search certificates
- `GET /api/staff/certificates/status/{status}` - Filter by status
- `GET /api/staff/certificates/{id}/view` - **View certificate in browser**
- `PUT /api/staff/certificates/{id}/verify` - Verify certificate
- `PUT /api/staff/certificates/{id}/reject` - Reject certificate

## 🧪 Testing

### API Testing
Open `test-api.html` in your browser to test the backend APIs directly.

### Manual Testing Workflow
1. Register both student and staff accounts
2. Login as student and upload certificates
3. Login as staff and verify/reject certificates
4. Test file download functionality
5. Test search and filter features

## 🛠️ Development Commands

### Backend
```bash
cd backend
.\run.bat                    # Start backend server
```

### Frontend
```bash
cd frontend
npm install                  # Install dependencies
npm start                   # Start development server
```

### MongoDB
```bash
mongod                      # Start MongoDB server
```

## 🔒 Security Features

- **JWT Authentication**: Stateless token-based auth
- **Role-based Authorization**: Student/Staff access control
- **Password Encryption**: BCrypt hashing
- **File Validation**: Restricted file types (PDF, JPG, PNG)
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Server-side validation

## 📊 Database Schema

### Users Collection
```javascript
{
  "_id": ObjectId,
  "username": String (unique),
  "password": String (hashed),
  "fullName": String,
  "email": String,
  "role": "STUDENT" | "STAFF"
}
```

### Certificates Collection
```javascript
{
  "_id": ObjectId,
  "studentId": String,
  "studentName": String,
  "certificateName": String,
  "fileId": String (GridFS),
  "fileName": String,
  "fileType": String,
  "uploadDate": ISODate,
  "status": "PENDING" | "VERIFIED" | "REJECTED",
  "staffRemarks": String,
  "verifiedBy": String,
  "verifiedDate": ISODate
}
```

## 🎯 Key Features Implemented

✅ **User Management**
- Registration and login for students and staff
- JWT-based authentication
- Role-based access control

✅ **Certificate Upload**
- File upload with validation (PDF, JPG, PNG)
- GridFS storage for efficient file handling
- Automatic status tracking

✅ **Certificate Verification**
- Staff can review all certificates
- Verify or reject with remarks
- Status tracking (Pending/Verified/Rejected)

✅ **Search & Filter**
- Search by student name or certificate name
- Filter by verification status
- Real-time filtering

✅ **File Management**
- **Certificate preview** - View PDFs and images directly in browser
- Secure file download
- Delete rejected certificates
- Re-upload functionality

✅ **Responsive UI**
- Clean, modern interface
- Role-based dashboards
- Status badges and indicators

## 🚨 Troubleshooting

### Backend Issues
- Ensure MongoDB is running on port 27017
- Check Java version (requires Java 17+)
- Verify JAVA_HOME is set correctly

### Frontend Issues
- Ensure Node.js is installed (v16+)
- Check if port 3000 is available
- Verify proxy configuration in package.json

### Database Issues
- Start MongoDB: `mongod`
- Check connection: `mongo mongodb://localhost:27017`
- Verify database permissions

## 🎉 Success!

Your Certificate Management System is now fully operational! 

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Test Page**: Open `test-api.html` in browser

The system provides a complete certificate upload and verification workflow with secure authentication, file management, and role-based access control.