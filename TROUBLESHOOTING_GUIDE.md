# Certificate System Troubleshooting Guide

## Common Issues and Solutions

### 1. Web Page Not Showing All Options

**Symptoms:**
- Missing navigation options
- Components not rendering
- Blank or incomplete dashboard

**Possible Causes & Solutions:**

#### A. Authentication Issues
1. **Check if user is logged in:**
   - Open browser developer tools (F12)
   - Check localStorage for 'token' and 'user' items
   - If missing, log in again

2. **Token expired:**
   - Clear localStorage: `localStorage.clear()`
   - Log in again

#### B. API Connection Issues
1. **Backend not running:**
   ```bash
   # Check if backend is running on port 8080
   netstat -an | findstr :8080
   
   # If not running, start backend:
   cd backend
   ./mvnw spring-boot:run
   # or
   java -jar target/certificate-system-1.0.0.jar
   ```

2. **Frontend not running:**
   ```bash
   # Check if frontend is running on port 3000
   netstat -an | findstr :3000
   
   # If not running, start frontend:
   cd frontend
   npm start
   ```

3. **CORS Issues:**
   - Check browser console for CORS errors
   - Ensure backend CORS is configured for http://localhost:3000

#### C. Component Loading Issues
1. **Missing imports:**
   - Check browser console for import errors
   - Verify all component files exist in frontend/src/components/

2. **CSS not loading:**
   - Check if enterprise.css is loading
   - Verify CSS file paths in App.js

### 2. Specific Component Issues

#### A. Sidebar Not Showing Options
**Check:**
1. User role is correctly set
2. Sidebar component is imported and rendered
3. activeSection state is working

**Debug:**
```javascript
// Add to Sidebar component
console.log('User role:', user?.role);
console.log('Menu items:', menuItems);
console.log('Active section:', activeSection);
```

#### B. Dashboard Cards Not Showing
**Check:**
1. Analytics API is returning data
2. KPICard component is properly imported
3. CSS classes are applied

**Debug:**
```javascript
// Add to EnhancedStudentDashboard
console.log('Analytics data:', analytics);
console.log('Certificates:', certificates);
```

#### C. Certificate Grid Empty
**Check:**
1. API endpoint `/api/student/certificates` is working
2. User has uploaded certificates
3. Authentication token is valid

### 3. API Testing

Use the included `test-api.html` file to test:
1. Backend connection
2. Authentication
3. API endpoints
4. Frontend status

Open `test-api.html` in your browser and run the tests.

### 4. Browser Console Debugging

1. **Open Developer Tools (F12)**
2. **Check Console tab for errors:**
   - Red errors indicate problems
   - Look for network errors (failed API calls)
   - Look for JavaScript errors

3. **Check Network tab:**
   - See if API calls are being made
   - Check response status codes
   - Verify request headers include Authorization

### 5. Common Error Messages

#### "Failed to fetch data"
- Backend is not running
- API endpoint doesn't exist
- Authentication token is invalid

#### "Network Error"
- CORS issue
- Backend not accessible
- Wrong API URL

#### "401 Unauthorized"
- Token expired
- User not authenticated
- Wrong role for endpoint

#### "404 Not Found"
- API endpoint doesn't exist
- Wrong URL path
- Backend route not configured

### 6. Step-by-Step Debugging

1. **Verify Services Running:**
   ```bash
   # Backend (should show port 8080)
   netstat -an | findstr :8080
   
   # Frontend (should show port 3000)
   netstat -an | findstr :3000
   ```

2. **Test Backend Health:**
   - Open: http://localhost:8080/api/health
   - Should return: {"status":"UP",...}

3. **Test Frontend:**
   - Open: http://localhost:3000
   - Should show login page

4. **Test Authentication:**
   - Login with test credentials
   - Check browser localStorage for token

5. **Test API Endpoints:**
   - Use browser developer tools Network tab
   - Or use the test-api.html file

### 7. Reset Everything

If all else fails:

1. **Clear Browser Data:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   // Refresh page
   ```

2. **Restart Services:**
   ```bash
   # Stop both services (Ctrl+C)
   # Then restart:
   
   # Backend
   cd backend
   ./mvnw spring-boot:run
   
   # Frontend (in new terminal)
   cd frontend
   npm start
   ```

3. **Check Database:**
   - Ensure MongoDB is running
   - Check if test users exist

### 8. Getting Help

If issues persist:

1. **Check browser console** for specific error messages
2. **Check backend logs** for server errors
3. **Use the diagnostic component** added to the app
4. **Test with the API test page** (test-api.html)

### 9. Test Users

Default test users (if seeded):
- **Student:** username: `student1`, password: `password123`
- **Staff:** username: `staff1`, password: `password123`

### 10. Environment Check

Ensure you have:
- Node.js (v16+)
- Java 17+
- MongoDB running
- Ports 3000 and 8080 available