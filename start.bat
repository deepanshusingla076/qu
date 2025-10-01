@echo off
title QWIZZ Startup

:: Start Eureka Server
start cmd /c "cd backend\eureka-server && mvn spring-boot:run"

:: Start API Gateway
start cmd /c "cd backend\api-gateway && mvn spring-boot:run"

:: Start User Service
start cmd /c "cd backend\user-service && mvn spring-boot:run"

:: Start Question Bank Service
start cmd /c "cd backend\question-bank-service && mvn spring-boot:run"

:: Start Result Service
start cmd /c "cd backend\result-service && mvn spring-boot:run"

:: Start Analytics Service
start cmd /c "cd backend\analytics-service && mvn spring-boot:run"

:: Start Frontend
start cmd /c "cd frontend && npm start"
