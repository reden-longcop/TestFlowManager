@echo off
setlocal

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install it from https://nodejs.org/
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo npm is not installed. Please install it from https://www.npmjs.com/get-npm
    exit /b 1
)
start cmd /k "node server.mjs"

timeout /t 5 /nobreak > nul

start cmd /k "npm run dev --force"

timeout /t 5 /nobreak > nul

start http://localhost:5173/