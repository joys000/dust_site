# 미세먼지 알리미 — 공식 사이트

안드로이드 앱 **미세먼지 알리미** 의 공식 소개 사이트입니다.
1인 개발 · 첫 앱 · 2026년 5월 중순 출시 예정.

---

## 📁 파일 구조 (분리된 다중 페이지)

```
dustalert-site/
├── index.html              ← 홈
├── try.html                ← 체험해보기
├── search.html             ← 장소·대기·날씨
├── map.html                ← 응급·보건·약국
├── extras.html             ← 부가기능
├── advice.html             ← 조언
├── story.html              ← 만든 이야기
├── donors.html             ← 응원해주신 분들
├── download.html           ← 다운로드
├── privacy_policy.html     ← 개인정보 처리방침
├── style.css               ← 공통 CSS (모든 페이지 공유)
├── script.js               ← 공통 JS (모든 페이지 공유)
├── app_icon_512.png        ← 앱 아이콘
├── README.md               ← 이 파일
├── .gitignore
├── .nojekyll
└── app_screens/cropped/    ← 스크린샷 18장
```

각 페이지는 평균 10~35KB로 가볍고, 공통 CSS·JS는 한 번 로드되면 캐시되어 다른 페이지로 이동 시 즉시 표시됩니다. 모바일 뒤로가기·앞으로가기도 정상 동작합니다.

---

## ✏️ 자주 수정할 부분

### 1. 후원자 명단 추가

`script.js` 파일 열고 `const DONORS = [` 검색 → 그 아래에 한 줄씩 추가:

```javascript
const DONORS = [
  // 최상단이 가장 최신
  { name:'홍길동', message:'좋은 앱 만들어주셔서 감사합니다', date:'2026-05-20', channel:'kakao' },
  { name:'김영희', message:'부모님 폰에 설치해드렸어요', date:'2026-05-18', channel:'toss' },
];
```

- `name`: 사이트에 표시할 이름
- `message`: 한 마디 응원 (없으면 빈 문자열 `''`)
- `date`: `YYYY-MM-DD`
- `channel`: `'kakao'` / `'kb'` / `'toss'`

### 2. Google Form 링크 변경

`script.js`에서:
- 사전 알림 폼: `forms.gle/W6aDA9DCMDtbSWo88` 검색
- 후원자 명단 폼: `forms.gle/M6Mc6GfrmVQvfdYs7` 검색

또는 각 HTML 파일에서 `forms.gle/...` 검색하셔도 됩니다.

### 3. 후원 채널 정보

`download.html`에서 검색:
- 카카오페이: `qr.kakaopay.com/FVEzGQrKR`
- KB국민은행: `94320201264162`
- 토스뱅크: `100014422354`

### 4. 도메인 설정 (옵션)

각 HTML의 `<head>` 안 canonical URL 주석을 활성화:
```html
<link rel="canonical" href="https://your-domain.com/페이지명.html" />
```

---

## 🚀 GitHub Pages 배포

### 1. GitHub 저장소에 모든 파일 push

기존 저장소가 있으시면 변경사항 commit + push 하시면 됩니다.

새로 시작하려면:
```bash
cd dustalert-site
git init
git add .
git commit -m "Multi-page site"
git branch -M main
git remote add origin https://github.com/사용자ID/저장소이름.git
git push -u origin main
```

### 2. GitHub Pages 활성화

저장소 Settings → Pages → Branch `main` / `(root)` → Save

### 3. 접속 URL

- 일반 저장소: `https://사용자ID.github.io/저장소이름/`
- 직접 페이지: `https://사용자ID.github.io/저장소이름/try.html`

---

## 📞 문의

- 개발자: **신재우** (1인 개발 · 첫 앱)
- 이메일: **joyss00000@gmail.com**
- 사전 알림: https://forms.gle/W6aDA9DCMDtbSWo88
- 후원자 명단 등록: https://forms.gle/M6Mc6GfrmVQvfdYs7

---

© 2026 신재우 · 미세먼지 알리미 · Made with care 💛
