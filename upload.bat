@echo off
cd /d "%~dp0"

echo ============================================
echo  GitHub Auto Upload
echo ============================================
echo.

echo [1/5] Cleaning lock files...
if exist ".git\index.lock" del /f /q ".git\index.lock"
if exist ".git\HEAD.lock" del /f /q ".git\HEAD.lock"

echo [2/5] Updating gitignore cache...
git rm -r --cached "repleace photo" 2>nul
git rm -r --cached "repleace videos" 2>nul
git rm -r --cached "app_screens_backup" 2>nul

echo [3/5] Adding files...
git add -A

echo [4/5] Committing...
git commit -m "Site update: new screenshots, demo videos, legal docs"

echo [5/5] Pushing to GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo  SUCCESS! Uploaded to GitHub
    echo  https://github.com/joys000/dust_site
    echo ============================================
) else (
    echo.
    echo ============================================
    echo  Push failed - GitHub login may be required
    echo ============================================
)

echo.
pause
