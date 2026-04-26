# 미세먼지 알리미 — 공식 사이트

안드로이드 앱 **미세먼지 알리미** 의 공식 소개 사이트입니다.
1인 개발 · 첫 앱 · 2026.05.15 출시 예정.

---

## 🚀 GitHub Pages 배포

### 1. 새 GitHub 저장소 만들기

1. github.com 로그인 → 우측 상단 ＋ → New repository
2. Repository name: `dustalert-site` (또는 본인 GitHub username으로 `username.github.io` — 그러면 본인 메인 페이지가 됨)
3. **Public** 선택
4. README, .gitignore 추가하지 않음 (이미 있음)
5. Create repository

### 2. 이 폴더를 GitHub에 올리기

터미널 열고:

```bash
cd ~/Desktop/dustalert-site

git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/사용자ID/저장소이름.git
git push -u origin main
```

### 3. GitHub Pages 활성화

1. 저장소 페이지 → **Settings** 탭
2. 좌측 메뉴 **Pages** 클릭
3. **Source**: `Deploy from a branch`
4. **Branch**: `main` / `/ (root)` → Save
5. 1-2분 기다리면 배포 완료

### 4. 접속 URL

- 일반 저장소: `https://사용자ID.github.io/저장소이름/`
- `username.github.io` 저장소: `https://사용자ID.github.io/`

---

## 📁 파일 구조

```
dustalert-site/
├── index.html              ← 메인 사이트 (모든 페이지 통합)
├── privacy_policy.html     ← 개인정보 처리방침
├── app_icon_512.png        ← 앱 아이콘
├── README.md               ← 이 파일
├── .gitignore              ← Git 무시 파일
├── .nojekyll               ← Jekyll 비활성화 (GitHub Pages)
└── app_screens/
    └── cropped/
        ├── screen_01.png   ← 조언 꿀팁 백과
        ├── screen_02.png   ← 오늘의 복약
        ├── screen_03.png   ← 약 등록 검색
        ├── screen_04.png   ← 7일 일기예보
        ├── screen_05.png   ← 홈 (밤 풍경)
        ├── screen_06.png   ← 응급·보건 지도
        ├── screen_07.png   ← 홈 (좋음 + 카드)
        ├── screen_08.png   ← 홈 (박스 순서 편집)
        ├── screen_09.png   ← 처방전 사진 인식
        ├── screen_10.png   ← 일기 (캘린더 + 등급 필터)
        ├── screen_11.png   ← 일기 (1년 히트맵)
        ├── screen_12.png   ← 일기 (둘 다 뷰)
        ├── screen_13.png   ← 일기 작성
        ├── screen_14.png   ← 일기 (시작 안내)
        ├── screen_15.png   ← 복약 진행 중
        ├── screen_16.png   ← 복약 확인 다이얼로그
        ├── screen_17.png   ← 위젯 응원 문구 설정
        └── screen_18.png   ← 설정 (5소스 판정)
```

---

## ✏️ 자주 수정할 부분

### 1. 후원자 명단 추가

`index.html` 열고 `const DONORS = [` 검색 → 아래에 한 줄씩 추가:

```javascript
const DONORS = [
  // 최상단이 가장 최신
  { name:'홍길동', message:'좋은 앱 만들어주셔서 감사합니다', date:'2026-05-20', channel:'kakao' },
  { name:'김영희', message:'부모님 폰에 설치해드렸어요', date:'2026-05-18', channel:'toss' },
];
```

- `name`: Form #2에서 받은 "사이트에 표시할 이름"
- `message`: Form #2에서 받은 "한 마디 응원" (없으면 빈 문자열 `''`)
- `date`: `YYYY-MM-DD`
- `channel`: `'kakao'` / `'kb'` / `'toss'`

저장 후 git push 하면 자동 반영.

### 2. Google Form 링크 변경

`index.html`에서:
- 사전 알림 폼: `forms.gle/W6aDA9DCMDtbSWo88` 검색
- 후원자 명단 폼: `forms.gle/M6Mc6GfrmVQvfdYs7` 검색

### 3. 후원 채널 정보

`index.html`에서:
- 카카오페이: `qr.kakaopay.com/FVEzGQrKR` 검색
- KB국민은행: `94320201264162` 검색
- 토스뱅크: `100014422354` 검색

### 4. 도메인 설정 (옵션)

커스텀 도메인 사용하려면:
1. `CNAME` 파일 만들기 (내용: `your-domain.com` 한 줄)
2. `index.html` `<head>`에서 canonical URL 주석 풀기:
   ```html
   <link rel="canonical" href="https://your-domain.com/" />
   ```

---

## 📞 문의

- 개발자: **신재우** (1인 개발 · 첫 앱)
- 이메일: **joyss00000@gmail.com**
- 사전 알림 신청: https://forms.gle/W6aDA9DCMDtbSWo88
- 후원자 명단 등록: https://forms.gle/M6Mc6GfrmVQvfdYs7

---

© 2026 신재우 · 미세먼지 알리미 · Made with care 💛
