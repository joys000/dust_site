@echo off
chcp 65001 >nul
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
  where py >nul 2>nul
  if errorlevel 1 (
    echo.
    echo [!] Python 3 is not installed.
    echo     Download: https://www.python.org/downloads/
    echo     Check ^"Add Python to PATH^" during setup.
    echo.
    pause
    exit /b 1
  ) else (
    py add-donor.py %*
  )
) else (
  python add-donor.py %*
)

pause
