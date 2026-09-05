# Studio Stem 홈페이지 (studiostem.kr)

솔로 창업 브랜드 디자인 스튜디오 "Studio Stem"의 실제 운영 중인 홈페이지. 바닐라 HTML/CSS/JS 정적 사이트(프레임워크 없음) + Supabase(포트폴리오 CMS 백엔드).

## 사용자 (프로젝트 오너)

Studio Stem 대표 (1인 브랜드 디자이너). 코딩 비전공, 터미널/git 명령어를 잘 모름 — 매번 아주 자세하고 쉽게, 단계별로 설명 필요. 항상 한글로 답변할 것.

## ⚠️ 현재 WORK 페이지 임시 비공개 상태 (2026-09-03부터)

사용자 요청으로 **WORK 탭/페이지를 당분간 숨겨둔 상태**임:
- `index.html`, `work.html`, `work-post.html`의 상단 nav + 모바일 메뉴에서 WORK 링크를 HTML 주석으로 감싸서 비활성화 (`<!-- WORK tab temporarily hidden -->` 주석 찾으면 됨)
- `work.html`, `work-post.html`에 `<meta name="robots" content="noindex, nofollow">` 추가 (검색 노출 방지)
- `sitemap.xml`에서 `/work.html` 항목 주석 처리
- **관리자 페이지(`/admin/`)는 그대로 정상 작동** — 포트폴리오 업로드/수정/삭제 가능, 로그인도 정상
- 페이지 자체는 삭제 안 됐고 URL 직접 접속은 여전히 가능 (완전 차단 아님, 발견 경로만 제거)

**사용자가 "워크페이지 다시 보이게 해줘" 하면**: 위 3곳의 주석(`<!-- WORK tab temporarily hidden -->`)을 해제하고, `work.html`/`work-post.html`의 noindex 메타 태그 제거하고, sitemap.xml 주석 해제 후 커밋+push. Google/Naver에 재색인 요청도 다시 안내할 것.

## 배포 상태

- **실사이트**: https://studiostem.kr — 정상 서비스 중, HTTPS 인증서 정상
- **GitHub repo**: `doaeng615/studiostem-kr` (public), GitHub Pages로 배포 (branch: main, root)
- **push하면 자동 배포**됨 (1분 내). `git push` 외에 별도 배포 작업 불필요
- Google Search Console / Naver Search Advisor: 등록 및 sitemap 제출 완료

## 파일 구조

```
index.html        — About 페이지 (메인, 홈페이지)
work.html         — Work 목록 페이지 (Supabase에서 발행된 포폴 목록 fetch) — 현재 nav에서 숨김 상태
work-post.html    — Work 상세페이지 템플릿 (?slug=xxx 로 개별 글 렌더링) — 현재 nav에서 숨김 상태
admin/login.html, dashboard.html, editor.html  — 관리자 CMS (Supabase Auth 로그인 필요)
css/tokens.css, base.css, components.css, sections.css  — About 페이지 등 공통 스타일 (건드리지 말 것 — 별도 지시 없는 한)
css/portfolio.css — work.html/work-post.html 전용 (포트폴리오 카드, 상세 블록 렌더링)
css/admin.css     — 관리자 페이지 전용
js/main.js        — About 페이지 공통 스크립트
js/work.js, work-post.js — 목록/상세 페이지 렌더링
js/supabase-config.js — Supabase URL + anon key (공개돼도 안전한 키)
js/admin-auth.js, admin-dashboard.js, admin-editor.js — 관리자 로직
supabase/schema.sql, fix-grants.sql — DB 스키마 (참고용, 이미 실행됨)
assets/           — 이미지, 폰트, 아이콘
robots.txt, sitemap.xml, CNAME
```

## 포트폴리오 CMS (Supabase)

- **백엔드**: Supabase 프로젝트 `studiostem-cms` (Postgres + Auth + Storage), 무료 티어
- **테이블**: `portfolio_posts` (slug, title, industry, badge, problem, direction, output, thumbnail_url, content jsonb, status draft/published, sort_order)
- **본문 블록 타입**: `text`(size/weight/color 지정 가능, 색상은 orange/white 2종만), `image`(PNG/JPG/GIF만, PDF 지원 안 함 — 사용자가 명시적으로 제거 요청함), `youtube`(링크 붙여넣으면 자동 embed)
- **블록 간 여백 규칙**: 이미지/유튜브끼리 인접 = 0px, 텍스트-텍스트 인접 = 20px, 텍스트-미디어 인접 = 50px (`css/portfolio.css`의 `.post-body` 인접 셀렉터 참고)
- **썸네일 규격**: 16:9 고정, 데스크탑(≥1025px)에서 카드 폭 1000px 고정+중앙정렬, 그 아래는 유동적
- **카드 디자인**: 피그마 "Project Card" 컴포넌트(node 19:73) 스펙 그대로 구현 — 단, 피그마의 "SELF-INITIATED BRAND PROJECT" 라벨은 기존 서비스 카테고리 배지로 대체함 (자체기획 비공개 방침 유지)
- **Storage 버킷**: `portfolio-thumbnails`, `portfolio-media` (둘 다 public, 업로드는 로그인 사용자만)
- 관리자 계정은 Supabase 대시보드에서 직접 생성함 (공개 회원가입 페이지 없음)

## 필수 작업 규칙

1. **매 CSS/JS 수정 후 캐시 버스팅 필수**: 관련 HTML의 `?v=N` 쿼리스트링을 전부 다음 숫자로 증가 (현재 `v=45`). 로컬 dev 서버(`python http.server`, `http://localhost:8123`)가 cache-control 헤더를 안 보내서, 버전 안 올리면 "고쳤는데 안 고쳐짐" 오탐이 계속 발생함.
2. **수정 확인 후 바로 커밋+push**: 사용자가 "매번 반영할 때마다 푸시해줘"라고 명시적으로 요청함 — push 전 확인 안 받아도 됨. `git add -A && git commit -m "..." && git push`.
3. **반응형 필수 확인**: 데스크탑(1440), 태블릿(~768-1024), 모바일(375) 3개 폭에서 텍스트/요소 겹침·잘림 절대 없어야 함 — 사용자가 반복 강조한 최우선 요구사항. `white-space:nowrap` + 너비 미제한 조합이 이 프로젝트에서 반복적으로 겹침 버그의 원인이었음 (조심).
4. **다크 테마 전용**, 라이트모드 없음.
5. **포트폴리오는 실제로는 자체 기획 프로젝트**이지만, UI에는 절대 "자체 기획/self-initiated"라고 밝히지 않음 — 배지는 서비스 카테고리명(BRAND START/DESIGN PLUS/OPENING KIT)으로 표시. 후기 출처도 실명 대신 익명 이니셜 사용 (예: "H 바 리뉴얼"). 피그마 등 참고 자산에 이 라벨이 그대로 있어도 절대 그대로 옮기지 말 것.
6. **ABOUT 페이지(index.html) 디자인/섹션 구조는 명시적 요청 없이 건드리지 말 것** — nav 링크 숨김처럼 명확히 요청받은 최소 변경은 예외.

## 폰트

- 한글 제목: Elice DigitalBaeum OTF (`assets/fonts/`, 웹폰트 라이선스 보유 확인됨 → git에 커밋되어 배포됨, gitignore 아님)
- 영문: Orbitron(포인트), Inter(라벨) — Google Fonts CDN 링크로 로드 (자체 호스팅 아님)

## 문의 폼

`#contactForm` → Web3Forms API(`https://api.web3forms.com/submit`)로 실제 이메일 전송, work@studiostem.kr로 수신. access_key는 `index.html`에 하드코딩되어 있음 (Web3Forms 키는 공개돼도 되는 용도). `js/main.js`의 `initContactForm` 참고.

## 알려진 이슈 / 특이사항

- **GitHub Pages API로 도메인 설정 변경하면 CNAME 파일이 자동 커밋됨** (`gh api -X PUT repos/.../pages -f cname=...`) — 로컬 git과 별개로 remote에 커밋이 생겨서 `git push` 시 rejected 뜰 수 있음. `git pull --rebase` 후 재시도.
- HTTPS 인증서가 간헐적으로 재발급 필요할 수 있음 (도메인 재확인 시). cname을 빈 값으로 PUT 했다가 다시 원래 값으로 PUT하면 강제 재발급 유도 가능.
- 브라우저 프리뷰 스크린샷 도구가 리사이즈/스크롤 직후 가끔 검은 화면만 캡처하는 버그가 있음 — 이럴 땐 스크린샷 대신 `getBoundingClientRect()` 등 좌표 측정으로 레이아웃 검증할 것.
- Supabase 테이블을 raw SQL로 만들면 `anon`/`authenticated` 롤에 기본 GRANT가 자동으로 안 붙을 수 있음 (RLS 정책과는 별개 문제) — "permission denied for table" 에러 뜨면 `grant select/insert/update/delete ...` 직접 실행 필요 (`supabase/fix-grants.sql` 참고).

## 최근 작업 이력 (최신순)

- WORK 탭/페이지 임시 비공개 처리 (위 섹션 참고)
- 포트폴리오 카드를 피그마 Project Card 컴포넌트 스펙에 정확히 맞춤, 본문 이미지 radius 0
- PDF 블록 기능 전체 제거, 이미지 업로드 PNG/JPG/GIF만 허용, 블록 간격 규칙 적용
- Supabase 기반 포트폴리오 CMS 구축: work.html/work-post.html 동적 렌더링 + 관리자 로그인/대시보드/에디터
- 문의 폼 예산/일정 체크박스를 2열 그리드 → 1열 세로 리스트로 단순화
- 체크박스 라벨 `white-space:nowrap` 제거 (겹침 버그 수정)
- SEO 기반 작업: robots.txt, sitemap.xml, JSON-LD, 메타 태그, Google/Naver 등록
- 문의 폼 실제 이메일 전송 연동 (Web3Forms)
- Elice 폰트 실배포, Orbitron/Inter Google Fonts 연동
- GitHub Pages + 커스텀 도메인(studiostem.kr) 배포, DNS/HTTPS 설정 완료

## 다음에 이어서 할 만한 것 (미정, 사용자에게 확인 필요)

- WORK 페이지 언제 다시 공개할지는 사용자 지시 대기 중
