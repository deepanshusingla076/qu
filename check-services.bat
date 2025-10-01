@echo off
title QWIZZ Service Status Check
color 0B

echo.
echo ==========================================
echo  QWIZZ SERVICE STATUS CHECK
echo ==========================================
echo.

:: Check MySQL
echo [1/8] Checking MySQL Database...
powershell -Command "try { Get-Service -Name MySQL* | Where-Object {$_.Status -eq 'Running'} | Select-Object Name, Status | Format-Table -HideTableHeaders } catch { Write-Host 'MySQL not found or not running' -ForegroundColor Red }"

:: Check services via HTTP
echo [2/8] Checking Eureka Server (8761)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8761/actuator/health' -TimeoutSec 5; if($response.StatusCode -eq 200) { Write-Host 'Eureka Server: RUNNING' -ForegroundColor Green } } catch { Write-Host 'Eureka Server: NOT RESPONDING' -ForegroundColor Red }"

echo [3/8] Checking API Gateway (8080)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8080/actuator/health' -TimeoutSec 5; if($response.StatusCode -eq 200) { Write-Host 'API Gateway: RUNNING' -ForegroundColor Green } } catch { Write-Host 'API Gateway: NOT RESPONDING' -ForegroundColor Red }"

echo [4/8] Checking User Service (8081)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8081/actuator/health' -TimeoutSec 5; if($response.StatusCode -eq 200) { Write-Host 'User Service: RUNNING' -ForegroundColor Green } } catch { Write-Host 'User Service: NOT RESPONDING' -ForegroundColor Red }"

echo [5/8] Checking Question Bank Service (8082)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8082/actuator/health' -TimeoutSec 5; if($response.StatusCode -eq 200) { Write-Host 'Question Bank Service: RUNNING' -ForegroundColor Green } else { Write-Host 'Question Bank Service: ERROR' -ForegroundColor Red } } catch { Write-Host 'Question Bank Service: NOT RESPONDING' -ForegroundColor Red }"

echo [6/8] Checking Result Service (8083)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8083/actuator/health' -TimeoutSec 5; if($response.StatusCode -eq 200) { Write-Host 'Result Service: RUNNING' -ForegroundColor Green } } catch { Write-Host 'Result Service: NOT RESPONDING' -ForegroundColor Red }"

echo [7/8] Checking Analytics Service (8084)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8084/actuator/health' -TimeoutSec 5; if($response.StatusCode -eq 200) { Write-Host 'Analytics Service: RUNNING' -ForegroundColor Green } } catch { Write-Host 'Analytics Service: NOT RESPONDING' -ForegroundColor Red }"

echo [8/8] Checking Frontend (3000)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 5; if($response.StatusCode -eq 200) { Write-Host 'Frontend: RUNNING' -ForegroundColor Green } } catch { Write-Host 'Frontend: NOT RESPONDING' -ForegroundColor Red }"

echo.
echo ==========================================
echo  EUREKA REGISTERED SERVICES
echo ==========================================
echo.
powershell -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:8761/eureka/apps' -Headers @{'Accept'='application/json'} -TimeoutSec 10; if($response.applications.application) { $response.applications.application | ForEach-Object { Write-Host ('Service: ' + $_.name + ' - Instances: ' + $_.instance.Count) -ForegroundColor Cyan } } else { Write-Host 'No services registered with Eureka' -ForegroundColor Yellow } } catch { Write-Host 'Cannot connect to Eureka Server' -ForegroundColor Red }"

echo.
echo ==========================================
echo Press any key to continue...
pause >nul