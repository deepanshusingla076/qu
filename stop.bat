@echo off
color 0C
title QWIZZ Application Shutdown

echo.
echo =========================================
echo         🛑 QWIZZ SHUTDOWN SCRIPT 🛑
echo =========================================
echo.
echo Stopping all QWIZZ services gracefully...
echo.

:: Stop all QWIZZ related processes
echo 🔍 Finding and stopping QWIZZ services...

:: Stop QWIZZ service windows by title
for %%T in ("🌟 QWIZZ - Eureka Server","🚪 QWIZZ - API Gateway","👤 QWIZZ - User Service","❓ QWIZZ - Question Bank Service","📊 QWIZZ - Result Service","📈 QWIZZ - Analytics Service","💻 QWIZZ - Frontend") do (
    taskkill /FI "WINDOWTITLE eq %%T*" /T /F >nul 2>&1
    if not errorlevel 1 echo ✅ Stopped %%T
)

:: Also stop by process names (backup method)
echo.
echo 🔍 Cleaning up any remaining processes...

:: Stop Spring Boot applications running on specific ports
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8761') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8081') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8082') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8083') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8084') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /PID %%a /F >nul 2>&1

echo ✅ Cleaned up processes using QWIZZ ports

:: Stop any remaining Java and Node processes that might be QWIZZ related
wmic process where "commandline like '%%spring-boot:run%%' and commandline like '%%quiz-apc%%'" delete >nul 2>&1
wmic process where "commandline like '%%npm start%%' and commandline like '%%quiz-apc%%'" delete >nul 2>&1

echo.
echo =========================================
echo      ✅ QWIZZ APPLICATION STOPPED ✅
echo =========================================
echo.
echo All QWIZZ services have been stopped.
echo You can now safely close this window.
echo.
echo To restart: Run start.bat
echo.
timeout /t 5 /nobreak > nul
