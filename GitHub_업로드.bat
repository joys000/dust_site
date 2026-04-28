@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo ==========================================
echo   GitHub 자동 업로드 스크립트
echo ==========================================
echo.

REM 1. 잠금 파일 정리
if exist ".git\index.lock" (
    echo [1/5] 잠금 파일 정리 중...
    del /f /q ".git\index.lock"
)

REM 2. .gitignore가 적용되도록 캐시 정리
echo [2/5] gitignore 적용 중...
git rm -r --cached "repleace photo" 2>nul
git rm -r --cached "repleace videos" 2>nul
git rm -r --cached "app_screens_backup" 2>nul

REM 3. 변경사항 staging
echo [3/5] 변경사항 추가 중...
git add -A

REM 4. 커밋
echo [4/5] 커밋 중...
git commit -m "사이트 업데이트: 새 앱 스크린샷, 데모 영상, 법률 문서 추가" -m "- app_screens 14장 새 스크린샷으로 교체" -m "- search.html / map.html에 4개 데모 영상 (videos/) 삽입" -m "- 개인정보처리방침 업데이트 (시행일 2026-05-01)" -m "- 서비스 이용약관 추가" -m "- 위치기반서비스 이용약관 추가" -m "- 오픈소스 라이선스 추가" -m "- 모든 페이지 footer에 법률 문서 링크 추가"

REM 5. 푸시
echo [5/5] GitHub로 푸시 중...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo   완료! GitHub로 업로드 성공!
    echo   https://github.com/joys000/dust_site
    echo ==========================================
) else (
    echo.
    echo ==========================================
    echo   푸시 실패!
    echo   GitHub 인증이 필요할 수 있습니다.
    echo   GitHub Personal Access Token이 필요합니다.
    echo ==========================================
)

echo.
pause
