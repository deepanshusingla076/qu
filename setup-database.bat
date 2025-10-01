@echo off
title QWIZZ - Database Setup
color 0B
echo.
echo ========================================
echo        🗄️  QWIZZ DATABASE SETUP 🗄️
echo ========================================
echo.

echo 🔍 Testing MySQL connection...

:: Test MySQL connection
echo Testing connection to MySQL server...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL client not found!
    echo Please install MySQL and ensure it's in your PATH.
    echo Download from: https://dev.mysql.com/downloads/mysql/
    pause
    exit /b 1
)

echo ✅ MySQL client found

:: Test connection and create database
echo.
echo 📝 Creating quiz_apc database...
echo Enter your MySQL root password when prompted:

mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS quiz_apc; USE quiz_apc; SHOW TABLES; SELECT 'Database quiz_apc is ready!' as Status;"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database setup complete!
    echo.
    echo 🎯 Next steps:
    echo 1. Ensure .env file has correct DB_PASSWORD
    echo 2. Run ./start.bat to start the application
) else (
    echo.
    echo ❌ Database setup failed!
    echo.
    echo 🔧 Troubleshooting:
    echo 1. Ensure MySQL server is running
    echo 2. Check your root password
    echo 3. Verify MySQL service is started
)

echo.
pause