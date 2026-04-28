@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo ==========================================
echo   Git 잠금 파일 정리
echo ==========================================
echo.

REM 모든 가능한 lock 파일 제거
if exist ".git\index.lock" (
    del /f /q ".git\index.lock"
    echo [완료] index.lock 삭제됨
) else (
    echo [정보] index.lock 없음
)

if exist ".git\HEAD.lock" (
    del /f /q ".git\HEAD.lock"
    echo [완료] HEAD.lock 삭제됨
)

if exist ".git\config.lock" (
    del /f /q ".git\config.lock"
    echo [완료] config.lock 삭제됨
)

if exist ".git\refs\heads\main.lock" (
    del /f /q ".git\refs\heads\main.lock"
    echo [완료] main.lock 삭제됨
)

REM ORIG_HEAD, MERGE_HEAD 등 진행 중 작업 표시 파일들도 정리
if exist ".git\MERGE_HEAD" del /f /q ".git\MERGE_HEAD"
if exist ".git\CHERRY_PICK_HEAD" del /f /q ".git\CHERRY_PICK_HEAD"

echo.
echo ==========================================
echo   잠금 정리 완료!
echo   이제 GitHub_업로드.bat을 실행하세요.
echo ==========================================
echo.
pause
