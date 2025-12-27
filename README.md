# Certificate Upload & Verification System

A comprehensive web-based certificate management system built with Java Spring Boot and React, featuring MongoDB for data storage and GridFS for file management.

## Features

### 👨‍🎓 Student Features
- Secure registration and login
- Upload certificates (PDF, JPG, PNG)
- View all uploaded certificates
- Download certificates anytime
- Track verification status (Pending/Verified/Rejected)
- Delete rejected certificates and re-upload

### 👩‍🏫 Staff Features
- Secure login with staff role
- View all student certificates
- Search certificates by student name
- Filter certificates by status
- Verify or reject certificates
- Add verification remarks

## Tech Stack

### Backend
- **Java 17** with Spring Boot 3.2
- **Spring Security** with JWT authentication
- **Spring Data MongoDB** for database operations
- **MongoDB GridFS** for file storage
- **Maven** for dependency management

### Frontend
- **React 18** with functional components
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management

### Database
- **MongoDB** for data persistence
- **GridFS** for file storage

## Quick Start

### Prerequisites
- Java 17+
- Node.js 16+
- MongoDB 4.4+
- Maven 3.6+

### Backend Setup

1. **Start MongoDB**
   ```bash
   mongod --dbpath /path/to/your/db
   ```

2. **Navigate to backend directory**
   ```bash
   cd backend
   ```

3. **Update application.properties**
   ```properties
   # Update MongoDB URI if needed
   spring.data.mongodb.uri=mongodb://localhost:27017/certificate_db
   
   # Change JWT secret in production
   jwt.secret=your-secret-key-change-this-in-production-min-256-bits
   ```

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

   Backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

   Frontend will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Student Endpoints
- `GET /api/student/certificates` - Get student's certificates
- `POST /api/student/certificates/upload` - Upload certificate
- `GET /api/student/certificates/{id}/download` - Download certificate
- `DELETE /api/student/certificates/{id}` - Delete certificate

### Staff Endpoints
- `GET /api/staff/certificates` - Get all certificates
- `GET /api/staff/certificates/search?studentName={name}` - Search certificates
- `GET /api/staff/certificates/status/{status}` - Filter by status
- `PUT /api/staff/certificates/{id}/verify` - Verify certificate
- `PUT /api/staff/certificates/{id}/reject` - Reject certificate

## Database Schema

### Users Collection
```javascript
{
  "_id": ObjectId,
  "username": String,
  "password": String, // BCrypt hashed
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
  "fileId": String, // GridFS file ID
  "fileName": String,
  "fileType": String,
  "uploadDate": ISODate,
  "status": "PENDING" | "VERIFIED" | "REJECTED",
  "staffRemarks": String,
  "verifiedBy": String,
  "verifiedDate": ISODate
}
```

## Security Features

- **JWT Authentication** - Stateless authentication
- **Role-based Authorization** - Student/Staff access control
- **Password Encryption** - BCrypt hashing
- **File Validation** - Restricted file types
- **CORS Configuration** - Cross-origin request handling

## Usage Workflow

1. **Registration**: Users register as Student or Staff
2. **Student Upload**: Students upload certificates → Status: PENDING
3. **Staff Review**: Staff members review and verify/reject certificates
4. **Student Access**: Students can download verified certificates anytime

## Development Notes

- Backend runs on port 8080
- Frontend runs on port 3000 with proxy to backend
- MongoDB GridFS handles file storage efficiently
- JWT tokens expire in 24 hours (configurable)
- File upload limit: 10MB per file

## Production Deployment

1. **Update JWT secret** in application.properties
2. **Configure MongoDB** connection string
3. **Build frontend**: `npm run build`
4. **Package backend**: `mvn clean package`
5. **Deploy** JAR file and serve React build files

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is licensed under the MIT License.