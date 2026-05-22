@echo off
title WeldSim
cd /d "%~dp0"
echo.
echo  ================================
echo   WeldSim -- Welding Simulator
echo  ================================
echo.
echo  Starting server... browser will open automatically.
echo  Close this window to stop the game.
echo.
start "" http://localhost:3000
npx serve -p 3000 .
pause
