# Studio Stem 홈페이지 (studiostem.kr)

솔로 창업 브랜드 디자인 스튜디오 "Studio Stem"의 실제 운영 중인 홈페이지. 바닐라 HTML/CSS/JS 정적 사이트, 프레임워크 없음.

## 사용자 (프로젝트 오너)

Studio Stem 대표 (1인 브랜드 디자이너). 코딩 비전공, 터미널/git 명령어를 잘 모름 — 매번 아주 자세하고 쉽게, 단계별로 설명 필요. 항상 한글로 답변할 것.

## 배포 상태 (2026-08-28 기준)

- **실사이트**: https://studiostem.kr — 정상 서비스 중, HTTPS 인증서 정상
- **GitHub repo**: `doaeng615/studiostem-kr` (public), GitHub Pages로 배포 (branch: main, root)
- **push하면 자동 배포**됨 (1분 내). `git push` 외에 별도 배포 작업 불필요
- Google Search Console: 등록 완료 (GA 자동 인증), sitemap 제출 완료
- Naver Search Advisor: 등록 완료 (HTML 태그 방식), sitemap + 웹페이지 수집 요청 완료

## 파일 구조

```
index.html   — About 페이지 (메인)
work.html    — Work/포트폴리오 페이지
css/tokens.css, base.css, components.css, sections.css
js/main.js
assets/      — 이미지, 폰트, 아이콘
robots.txt, sitemap.xml, CNAME
```

## 필수 작업 규칙

1. **매 CSS/JS 수정 후 캐시 버스팅 필수**: `index.html`, `work.html`의 `?v=N` 쿼리스트링을 전부 다음 숫자로 증가 (현재 `v=42`). 로컬 dev 서버(`python http.server`, `http://localhost:8123`)가 cache-control 헤더를 안 보내서, 버전 안 올리면 "고쳤는데 안 고쳐짐" 오탐이 계속 발생함.
2. **수정 확인 후 바로 커밋+push**: 사용자가 "매번 반영할 때마다 푸시해줘"라고 명시적으로 요청함 — push 전 확인 안 받아도 됨. `git add -A && git commit -m "..." && git push`.
3. **반응형 필수 확인**: 데스크탑(1440), 태블릿(~768-1024), 모바일(375) 3개 폭에서 텍스트/요소 겹침·잘림 절대 없어야 함 — 사용자가 반복 강조한 최우선 요구사항. `white-space:nowrap` + 너비 미제한 조합이 이 프로젝트에서 반복적으로 겹침 버그의 원인이었음 (조심).
4. **다크 테마 전용**, 라이트모드 없음.
5. **포트폴리오 3건(BLACK BOWL, BRUT, 주흥)은 실제로는 자체 기획 프로젝트**이지만, UI에는 절대 "자체 기획/self-initiated"라고 밝히지 않음 — 배지는 서비스 카테고리명(BRAND START/DESIGN PLUS/OPENING KIT)으로 표시. 후기 출처도 실명 대신 익명 이니셜 사용 (예: "H 바 리뉴얼").

## 폰트

- 한글 제목: Elice DigitalBaeum OTF (`assets/fonts/`, 웹폰트 라이선스 보유 확인됨 → git에 커밋되어 배포됨, gitignore 아님)
- 영문: Orbitron(포인트), Inter(라벨) — Google Fonts CDN 링크로 로드 (자체 호스팅 아님)

## 문의 폼

`#contactForm` → Web3Forms API(`https://api.web3forms.com/submit`)로 실제 이메일 전송, work@studiostem.kr로 수신. access_key는 `index.html`에 하드코딩되어 있음 (Web3Forms 키는 공개돼도 되는 용도). `js/main.js`의 `initContactForm` 참고.

## 알려진 이슈 / 특이사항

- **GitHub Pages API로 도메인 설정 변경하면 CNAME 파일이 자동 커밋됨** (`gh api -X PUT repos/.../pages -f cname=...`) — 로컬 git과 별개로 remote에 커밋이 생겨서 `git push` 시 rejected 뜰 수 있음. `git pull --rebase` 후 재시도.
- HTTPS 인증서가 간헐적으로 재발급 필요할 수 있음 (도메인 재확인 시). cname을 빈 값으로 PUT 했다가 다시 원래 값으로 PUT하면 강제 재발급 유도 가능.
- 브라우저 프리뷰 스크린샷 도구가 리사이즈/스크롤 직후 가끔 검은 화면만 캡처하는 버그가 있음 — 이럴 땐 스크린샷 대신 `getBoundingClientRect()` 등 좌표 측정으로 레이아웃 검증할 것.

## 최근 작업 이력 (최신순)

- 문의 폼 예산/일정 체크박스를 2열 그리드 → 1열 세로 리스트로 단순화
- 체크박스 라벨 `white-space:nowrap` 제거 (겹침 버그 수정)
- SEO 기반 작업: robots.txt, sitemap.xml, JSON-LD, 메타 태그, Google/Naver 등록
- 문의 폼 실제 이메일 전송 연동 (Web3Forms)
- Elice 폰트 실배포, Orbitron/Inter Google Fonts 연동
- Reviews 섹션 반응형 재구성 (태블릿/모바일에서 헤더 중앙정렬 + 화살표 카드 아래로), 제목 2줄 고정
- FAQ 아코디언 접힘 시 여백 비대칭 버그 수정 (CSS Grid 0fr 트릭에서 padding이 안 눌리는 문제)
- Problem&Solution 박스 너비 통일, STEM'S ANSWER → HOW WE HELP 콘텐츠 교체
- GitHub Pages + 커스텀 도메인(studiostem.kr) 배포, DNS/HTTPS 설정 완료

## 다음에 이어서 할 만한 것 (미정, 사용자에게 확인 필요)

- 별다른 예정 작업 없음. 사용자가 요청하는 대로 진행.
