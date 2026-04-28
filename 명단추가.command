#!/bin/bash
# macOS Finder에서 더블클릭으로 실행
cd "$(dirname "$0")"
clear

# Python 3 확인
if ! command -v python3 >/dev/null 2>&1; then
    echo "❌ Python 3가 설치되어 있지 않아요."
    echo "   설치 방법:"
    echo "   1) 터미널에서: xcode-select --install"
    echo "   2) 또는 https://www.python.org/downloads/ 에서 다운로드"
    echo ""
    read -p "Enter 누르면 닫힘..."
    exit 1
fi

python3 add-donor.py "$@"
