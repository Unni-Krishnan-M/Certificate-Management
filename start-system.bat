@echo off
echo Starting Certificate Management System...
echo.

echo Checking if ports are available...
netstat -an | findstr :8080 >nul
if %errorlevel% == 0 (
    echo WARNING: Port 8080 is already in use!
    echo Please stop the existing service or use a different port.
    pause
    exit /b 1
)

netstat -an | findstr :3000 >nul
if %errorlevel% == 0 (
    echo WARNING: Port 3000 is already in use!
    echo Please stop the existing service or use a different port.
    pause
    exit /b 1
)

echo Ports are available. Starting services...
echo.

echo Starting Backend (Spring Boot)...
start "Backend Server" cmd /k "cd backend && mvnw spring-boot:run"

echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo Starting Frontend (React)...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Certificate Management System Started!
echo ========================================
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo API Test: http://localhost:3000/test-api.html
echo.
echo Test Credentials:
echo Student: student1 / password123
echo Staff: staff1 / password123
echo.
echo Press any key to close this window...
pause >nul