@echo off
title Launch Sancharam AI Fullstack Project
echo ========================================================
echo        🚀 SANCHARAM AI - FULLSTACK STARTER
echo ========================================================
echo.
echo [1/2] Starting Flask Python Backend Server (Port 5000)...
start "Sancharam Flask Backend" cmd /k "cd /d %~dp0\backend && python app.py"

echo [2/2] Starting Vite React Frontend Server (Port 5173)...
start "Sancharam React Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================================
echo  All services started! Opening project in your browser...
echo  Single Application Link: http://localhost:5173/
echo ========================================================
echo.
timeout /t 3 /nobreak > nul
start http://localhost:5173/
