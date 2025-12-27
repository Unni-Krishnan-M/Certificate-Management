import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import EnhancedStudentDashboard from './components/EnhancedStudentDashboard';
import StaffDashboard from './components/StaffDashboard';
import './App.css';
import './styles/enterprise.css';
import './styles/modal.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/student" element={<ProtectedRoute role="STUDENT"><EnhancedStudentDashboard /></ProtectedRoute>} />
            <Route path="/staff" element={<ProtectedRoute role="STAFF"><StaffDashboard /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

export default App;