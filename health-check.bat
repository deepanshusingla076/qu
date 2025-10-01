@echo off
color 0B
title QWIZZ Health Check

echo.
echo ========================================
echo      🏥 QWIZZ HEALTH CHECK 🏥
echo ========================================
echo.

echo [1/6] Checking Eureka Server (8761)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8761' -TimeoutSec 5; Write-Host 'Eureka Server: RUNNING' -ForegroundColor Green } catch { Write-Host 'Eureka Server: NOT RESPONDING' -ForegroundColor Red }"

echo.
echo [2/6] Checking API Gateway (8080)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8080/actuator/health' -TimeoutSec 5; Write-Host 'API Gateway: RUNNING' -ForegroundColor Green } catch { Write-Host 'API Gateway: NOT RESPONDING' -ForegroundColor Red }"

echo.
echo [3/6] Checking User Service (8081)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8081/actuator/health' -TimeoutSec 5; Write-Host 'User Service: RUNNING' -ForegroundColor Green } catch { Write-Host 'User Service: NOT RESPONDING (Check database connection)' -ForegroundColor Red }"

echo.
echo [4/6] Checking Question Bank Service (8082)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8082/actuator/health' -TimeoutSec 5; Write-Host 'Question Bank Service: RUNNING' -ForegroundColor Green } catch { Write-Host 'Question Bank Service: NOT RESPONDING' -ForegroundColor Red }"

echo.
echo [5/6] Checking Result Service (8083)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8083/actuator/health' -TimeoutSec 5; Write-Host 'Result Service: RUNNING' -ForegroundColor Green } catch { Write-Host 'Result Service: NOT RESPONDING' -ForegroundColor Red }"

echo.
echo [6/6] Checking Analytics Service (8084)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8084/actuator/health' -TimeoutSec 5; Write-Host 'Analytics Service: RUNNING' -ForegroundColor Green } catch { Write-Host 'Analytics Service: NOT RESPONDING' -ForegroundColor Red }"

echo.
echo [7/7] Checking MySQL Database...
powershell -Command "try { $service = Get-Service -Name 'MySQL80' -ErrorAction Stop; if ($service.Status -eq 'Running') { Write-Host 'MySQL Database: RUNNING' -ForegroundColor Green } else { Write-Host 'MySQL Database: NOT RUNNING' -ForegroundColor Red } } catch { Write-Host 'MySQL Database: NOT FOUND' -ForegroundColor Red }"

echo.
echo [8/8] Testing API Gateway Auth Route...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8080/api/auth/test' -Method GET -TimeoutSec 10; Write-Host 'Auth Route: ACCESSIBLE' -ForegroundColor Green } catch { Write-Host 'Auth Route: NOT ACCESSIBLE - Services may still be registering with Eureka' -ForegroundColor Yellow }"

echo.
echo ========================================
echo ✅ Health check complete!
echo ========================================
echo.
echo 🌐 If all services are running, access:
echo    Frontend:  http://localhost:3000
echo    API:       http://localhost:8080  
echo    Eureka:    http://localhost:8761
echo.
choice /c YN /m "Open application in browser? (Y/N)"
if not errorlevel 2 start http://localhost:3000
echo.