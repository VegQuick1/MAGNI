@echo off
title PlastiControl ERP
echo ==============================================
echo  Iniciando PlastiControl ERP (Magni Plastic)
echo ==============================================

echo [1/2] Iniciando Servidor Backend (Puerto 3001)...
start "Backend ERP (Puerto 3001)" cmd /k "cd /d "%~dp0backend-erp" && npm start"

echo Esperando inicializacion de la base de datos y API...
timeout /t 3 /nobreak >nul

echo [2/2] Iniciando Frontend Vite...
start "Frontend ERP (Vite)" cmd /k "cd /d "%~dp0MagniPlastic-main" && npm run dev"

echo Abriendo navegador...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Todo listo. Si el navegador no abre automaticamente, ingresa a:
echo http://localhost:5173
echo ==============================================
pause

