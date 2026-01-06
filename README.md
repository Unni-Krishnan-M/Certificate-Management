# Certificate Management System

A comprehensive web-based certificate management system built with React frontend and Spring Boot backend.

## Features

### 🎓 Student Features
- **Secure Login**: JWT-based authentication
- **Certificate Upload**: Upload certificates with metadata (PDF, JPG, PNG)
- **Real-time Preview**: View uploaded certificates instantly
- **Dashboard Analytics**: Track upload statistics and status
- **Certificate Management**: View, download, and manage certificates

### 👨‍💼 Staff Features
- **Certificate Review**: Verify or reject student certificates
- **Advanced Analytics**: Comprehensive reports and statistics
- **Bulk Operations**: Manage multiple certificates efficiently
- **Real-time Dashboard**: Live data updates and insights

### 🔧 Technical Features
- **JWT Authentication**: Secure token-based authentication
- **File Storage**: GridFS (MongoDB) for efficient file management
- **Real-time Analytics**: Live data from database (no fake data)
- **Responsive Design**: Works on desktop and mobile devices
- **RESTful API**: Clean and well-documented API endpoints

## Technology Stack

### Backend
- **Java 17+** with Spring Boot 3.2
- **Spring Security** for authentication
- **MongoDB** for data storage
- **GridFS** for file storage
- **JWT** for token management
- **Maven** for dependency management

### Frontend
- **React 18** with modern hooks
- **React Router** for navigation
- **Axios** for API communication
- **CSS3** with modern styling
- **Responsive Design**

## Quick Start

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MongoDB 4.4 or higher

### Backend Setup
```bash
cd backend
.\run.bat
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Default Accounts
- **Student**: `student1` / `password123`
- **Student**: `unni` / `password123`
- **Staff**: `staff1` / `password123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Student Endpoints
- `GET /api/student/certificates` - Get all certificates
- `POST /api/student/certificates/upload` - Upload certificate
- `GET /api/student/certificates/{id}/view` - View certificate
- `GET /api/analytics/student/dashboard` - Student analytics

### Staff Endpoints
- `GET /api/staff/certificates` - Get all certificates
- `PUT /api/staff/certificates/{id}/verify` - Verify certificate
- `PUT /api/staff/certificates/{id}/reject` - Reject certificate
- `GET /api/analytics/staff/dashboard` - Staff analytics

## Project Structure

```
├── backend/                 # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/certify/
│   │       ├── controller/  # REST controllers
│   │       ├── service/     # Business logic
│   │       ├── model/       # Data models
│   │       ├── repository/  # Data access
│   │       ├── security/    # Security configuration
│   │       └── config/      # Application configuration
│   └── pom.xml             # Maven dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS styles
│   └── package.json        # NPM dependencies
└── README.md              # This file
```

## Features Implemented

✅ **Authentication System**
- JWT-based secure authentication
- Role-based access control (Student/Staff)
- Session management

✅ **Certificate Management**
- File upload with validation
- Multiple file format support (PDF, JPG, PNG)
- Certificate metadata storage
- File preview and download

✅ **Real-time Analytics**
- Live dashboard statistics
- Certificate status tracking
- Recent activity monitoring
- Verification rate calculations

✅ **User Interface**
- Modern, responsive design
- Intuitive navigation
- Real-time updates
- Error handling and validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
