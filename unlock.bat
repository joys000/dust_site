@echo off
cd /d "%~dp0"

echo ============================================
echo  Git Lock Cleaner
echo ============================================
echo.

if exist ".git\index.lock" (
    del /f /q ".git\index.lock"
    echo - index.lock deleted
) else (
    echo - index.lock not found
)

if exist ".git\HEAD.lock" (
    del /f /q ".git\HEAD.lock"
    echo - HEAD.lock deleted
)

if exist ".git\config.lock" (
    del /f /q ".git\config.lock"
    echo - config.lock deleted
)

if exist ".git\refs\heads\main.lock" (
    del /f /q ".git\refs\heads\main.lock"
    echo - main.lock deleted
)

echo.
echo ============================================
echo  Done! Now run upload.bat
echo ============================================
echo.
pause
