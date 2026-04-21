@echo off
title ForgeFit Dev Server
echo.
echo  ========================================
echo   FORGEFIT - Starting Development Server
echo  ========================================
echo.
echo  Checking for available server...
echo.

:: Try npx serve first
where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo  [OK] Node.js found! Starting server with 'serve'...
    echo.
    echo  Open your browser to: http://localhost:3000
    echo  Press Ctrl+C to stop the server.
    echo.
    npx -y serve . -l 3000 --no-clipboard
    goto :end
)

:: Try Python 3
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo  [OK] Python found! Starting server...
    echo.
    echo  Open your browser to: http://localhost:3000
    echo  Press Ctrl+C to stop the server.
    echo.
    python -m http.server 3000
    goto :end
)

:: Try Python (py launcher)
where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo  [OK] Python found! Starting server...
    echo.
    echo  Open your browser to: http://localhost:3000
    echo  Press Ctrl+C to stop the server.
    echo.
    py -m http.server 3000
    goto :end
)

echo  [ERROR] Neither Node.js nor Python found!
echo.
echo  Please install one of:
echo    - Node.js: https://nodejs.org
echo    - Python:  https://python.org
echo.
pause

:end
