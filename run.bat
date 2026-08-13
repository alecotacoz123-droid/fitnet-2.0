@echo off
title FitNet Project Runner
echo ========================================================
echo 🔥 Levantando Proyecto FitNet - Red Social Fitness con IA 🔥
echo ========================================================

echo.
echo [1/3] Iniciando Microservicio de IA (Python en Puerto 5000)...
start "FitNet - Servicio de IA (Puerto 5000)" cmd /k "cd backend\ai && python run_ai.py"

echo.
echo [2/3] Iniciando Servidor API Backend (Node.js/Express en Puerto 4000)...
start "FitNet - API Backend (Puerto 4000)" cmd /k "cd backend && npm start"

echo.
echo [3/3] Iniciando Servidor de Desarrollo Frontend (Vite/React en Puerto 5173)...
start "FitNet - Frontend React" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo 🎉 ¡Prototipo de FitNet en ejecución! 🎉
echo.
echo 💻 Interfaz Web: http://localhost:5173
echo 💻 API Backend: http://localhost:4000/api
echo 💻 Microservicio IA: http://localhost:5000/health
echo.
echo Revisa las terminales independientes que se han abierto.
echo Presiona Ctrl+C en cada terminal para apagar los servicios.
echo ========================================================
pause
