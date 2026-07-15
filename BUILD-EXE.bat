@echo off
title AnimeBill — Build EXE Installer
color 0F
echo.
echo  =========================================
echo     AnimeBill - EXE Installer Builder
echo     by iprsnmsra  github.com/iprsnmsra
echo  =========================================
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js is not installed!
    echo  Please download it from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo  [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo  [ERROR] npm install failed!
    pause
    exit /b 1
)

echo.
echo  [2/3] Building Windows installer...
call npm run build
if errorlevel 1 (
    echo  [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo  [3/3] Done!
echo.
echo  =========================================
echo   Your installer is ready in: dist\
echo   File: AnimeBill-Setup-1.0.0.exe
echo  =========================================
echo.
echo  Share this EXE with your users!
echo  They just double-click and install.
echo.
start "" "dist"
pause
