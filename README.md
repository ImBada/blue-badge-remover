# blue-badge-remover

X(트위터)에서 수익성 목적의 파란 뱃지(Premium 구독) 계정을 숨기는 크롬 익스텐션. 팔로우 중인 계정과 수동 화이트리스트는 예외 처리.

## 기능

- X 타임라인/답글/검색에서 수익성 파란 뱃지 계정의 트윗 자동 숨김
- GraphQL API 응답 기반 정확한 파딱 판별 (레거시 인증/기관 계정 제외)
- SVG 뱃지 감지 폴백 (골드/그레이 뱃지 구분)
- 팔로우 중인 계정은 뱃지가 있어도 표시 (세션 토큰 자동 추출 + 동기화)
- 수동 화이트리스트로 특정 계정 예외 처리
- 리트윗/인용 트윗 필터링 (개별 토글)
- 숨김 방식 선택: 완전 제거 / 접힌 상태로 표시
- 계정 전환 시 팔로우 목록 자동 재동기화
- Popup UI에서 모든 설정 관리

## 기술 스택

- **Language**: TypeScript (strict mode)
- **Platform**: Chrome Extension (Manifest V3)
- **Build**: Vite + CRXJS
- **Test**: Vitest (45 tests)

## 설치 (개발)

```bash
# 1. 의존성 설치
npm install

# 2. 빌드
npm run build

# 3. 테스트
npm run test
```

## 크롬에 설치하기

### 개발 빌드 로드

1. 프로젝트를 빌드합니다
   ```bash
   npm run build
   ```

2. 크롬 브라우저에서 주소창에 `chrome://extensions` 를 입력하여 접속합니다

3. 우측 상단의 **"개발자 모드"** 토글을 켭니다

   ![개발자 모드](https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/enable-developer-mode-bef48f284e498cc.png)

4. 좌측 상단의 **"압축 해제된 확장 프로그램을 로드합니다"** 버튼을 클릭합니다

5. 프로젝트의 `dist/` 폴더를 선택합니다

6. "Blue Badge Remover" 익스텐션이 목록에 나타나면 설치 완료입니다

### 사용법

1. x.com에 로그인합니다
2. 익스텐션 아이콘을 클릭하여 Popup UI를 엽니다
3. 마스터 ON/OFF로 전체 기능을 제어합니다
4. 필터링 범위(타임라인/답글/검색), 숨김 방식, 리트윗/인용 트윗 설정을 조정합니다
5. 팔로우 동기화 버튼을 눌러 팔로우 목록을 가져옵니다
6. 화이트리스트에 예외 처리할 계정의 @핸들을 추가합니다

### 개발 모드 (HMR)

```bash
npm run dev
```

코드 변경 시 자동으로 익스텐션이 리로드됩니다. 개발 모드에서도 위와 동일한 방법으로 `dist/` 폴더를 크롬에 로드합니다.

## 프로젝트 구조

```
src/
├── background/              # Service Worker (팔로우 동기화)
├── content/                 # Content Script (DOM 감시, 필터링)
├── injected/                # 페이지 컨텍스트 스크립트 (fetch 인터셉트)
├── popup/                   # Popup UI (설정 화면)
├── features/
│   ├── badge-detection/     # D1: 뱃지 감지 (API 파싱 + SVG 폴백)
│   ├── content-filter/      # D2: 콘텐츠 필터링 (MutationObserver)
│   ├── follow-list/         # D3: 팔로우 동기화 & 화이트리스트
│   └── settings/            # D4: 설정 관리 (Chrome Storage)
└── shared/                  # 공통 타입, 유틸, 상수
```

## 문서

| 문서 | 내용 |
|------|------|
| `docs/ARCHITECTURE.md` | 아키텍처, 의존성 규칙 |
| `docs/REQUIREMENTS.md` | EARS 기반 요구사항 |
| `docs/CONVENTIONS.md` | 작업/커밋/PR 컨벤션 |
| `docs/CODE_REVIEW.md` | 코드 리뷰 규칙 |
| `docs/RELIABILITY.md` | 에러 처리 정책 |
| `docs/SECURITY.md` | 보안 정책 |
