@echo off
echo Certificate Management System Status Check
echo ==========================================
echo.

echo Checking Backend (Port 8080)...
netstat -an | findstr :8080 >nul
if %errorlevel% == 0 (
    echo ✅ Backend is running on port 8080
) else (
    echo ❌ Backend is NOT running on port 8080
    echo    To start: cd backend && mvnw spring-boot:run
)

echo.
echo Checking Frontend (Port 3000)...
netstat -an | findstr :3000 >nul
if %errorlevel% == 0 (
    echo ✅ Frontend is running on port 3000
) else (
    echo ❌ Frontend is NOT running on port 3000
    echo    To start: cd frontend && npm start
)

echo.
echo Testing Backend Health...
curl -s http://localhost:8080/api/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Backend health check passed
) else (
    echo ❌ Backend health check failed
    echo    Backend may not be fully started or accessible
)

echo.
echo Quick Access Links:
echo - Frontend: http://localhost:3000
echo - API Test: http://localhost:3000/test-api.html
echo - Backend Health: http://localhost:8080/api/health
echo.
echo Test Credentials:
echo - Student: student1 / password123
echo - Staff: staff1 / password123
echo.
pause