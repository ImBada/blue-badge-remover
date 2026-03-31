# Blue Badge Remover

<p align="center">
  <img src="public/icons/icon.svg" alt="Blue Badge Remover" width="96">
</p>

<p align="center">
  <strong>X(Twitter)에서 수익성 파란 뱃지(Premium) 계정을 숨기는 크롬 익스텐션</strong><br>
  팔로우 중인 계정과 화이트리스트는 예외 처리됩니다
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/cjhmbgfnddpcdfmoicfcocekmainhhdm?utm_source=item-share-cb"><img alt="Chrome Web Store" src="https://img.shields.io/badge/Chrome_Web_Store-v1.1.0-4285F4?logo=googlechrome&logoColor=white"></a>
  <img alt="Manifest V3" src="https://img.shields.io/badge/Manifest-V3-blue">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green">
  <a href="https://x.com/Fotoner_P/status/2037977299191251444"><img alt="Featured on X" src="https://img.shields.io/badge/Featured_on_X-10K+_retweets-000000?logo=x&logoColor=white"></a>
</p>

## Screenshots

<p align="center">
  <img src="docs/img/screen.png" alt="Popup UI" width="340">
</p>

## Features

| 기능 | 설명 |
|------|------|
| **파딱 감지** | GraphQL API 응답 기반 판별 + SVG 뱃지 폴백 (금딱/기관 계정 제외) |
| **숨김 범위** | 타임라인, 트윗 상세(답글), 검색 결과, 북마크 (각각 토글) |
| **숨김 방식** | 완전 제거 또는 접힌 상태로 표시 (방패 아이콘 + 클릭하여 펼치기) |
| **리트윗 필터** | 팔로우가 파딱 트윗을 리트윗한 경우 숨김 (토글) |
| **인용 필터** | 필터링 안 함 / 인용 부분만 숨기기 / 트윗 전체 숨기기 |
| **키워드 필터** | 특정 키워드를 포함하는 파딱만 선별 숨김 (AdGuard식 문법) |
| **카테고리 필터** | 내장 키워드를 카테고리별(정치, 경제, 욕설 등) 개별 토글 |
| **팔로우 예외** | Following 페이지 방문 시 자동 수집, 계정별 캐시 |
| **화이트리스트** | 별도 관리 페이지에서 @아이디 추가, 프로필 배너에서 원클릭 추가 |
| **온보딩** | 첫 설치 시 팔로우 동기화 안내 (팝업 + 사이트 배너) |
| **계정 전환** | 계정별 팔로우 캐시 자동 전환, 즉시 재필터링 |
| **다국어** | 한국어 / English / 日本語 |
| **도메인** | x.com + twitter.com 양쪽 지원 |
| **디버그 모드** | 트윗별 처리 라벨 + 콘솔 로그 |

## Install

### Chrome Web Store

[**Chrome Web Store에서 설치**](https://chromewebstore.google.com/detail/cjhmbgfnddpcdfmoicfcocekmainhhdm?utm_source=item-share-cb)

### 개발 빌드

```bash
npm install
npm run build
npm run test
```

1. `chrome://extensions` 접속
2. **개발자 모드** 활성화
3. **압축 해제된 확장 프로그램을 로드합니다** 클릭
4. `dist/` 폴더 선택

## Usage

1. **x.com 또는 twitter.com에 로그인**
2. 익스텐션 아이콘 클릭 -> Popup에서 설정
3. **팔로우 동기화**: "팔로잉 페이지 열기" -> 최하단까지 스크롤하면 자동 수집
4. **화이트리스트**: 별도 관리 페이지에서 @아이디 추가, 또는 파딱 프로필 배너에서 바로 추가
5. **키워드 필터**: 팝업에서 키워드 필터 활성화 -> 고급 필터 설정에서 카테고리별 토글/커스텀 규칙 편집

### 숨김 동작

| 상황 | 동작 |
|------|------|
| 파딱의 직접 트윗 | 숨김 (팔로우/화이트리스트 제외) |
| 팔로우가 파딱을 리트윗 | retweetFilter ON이면 숨김 |
| 누군가 파딱을 인용 | quoteMode 설정에 따라 처리 |
| 팔로우의 직접 트윗 | 파딱이어도 표시 |
| 북마크 페이지 | 기본적으로 표시 (설정에서 변경 가능) |
| 본인 트윗 | 본인이 파딱이어도 항상 표시 |

## How It Works

```
x.com / twitter.com 페이지 로드
  |
  +-- fetch interceptor 주입 (fetch + XHR 패치)
  |     +-- GraphQL 응답에서 뱃지 데이터 추출 (is_blue_verified + verified_type)
  |     +-- Following API 응답에서 팔로우 핸들 추출 (screen_name)
  |     +-- 프로필 데이터 캐싱 (handle, displayName, bio)
  |
  +-- MutationObserver로 새 트윗 감지
  |     +-- 작성자 핸들 추출 (socialContext 링크 건너뜀)
  |     +-- 파딱 판별 (API 캐시 -> SVG 폴백, linearGradient 금딱 제외)
  |     +-- 팔로우/화이트리스트/본인 예외 체크
  |     +-- 키워드 필터 매칭 (활성화 시)
  |     +-- 숨김 처리 (remove / collapse + 맥락 정보)
  |
  +-- 인용 트윗: "인용" 텍스트 기반 블록 감지
  +-- SPA 네비게이션: pushState/popstate + URL 폴링 감지
  +-- 계정 전환: 프로필 링크 2초 간격 감시 -> 팔로우 캐시 교체
```

## Tech Stack

- **TypeScript** (strict mode)
- **Chrome Extension** Manifest V3
- **Vite** + **CRXJS**
- **Vitest** (170 tests)

## Project Structure

```
src/
├── background/              # Service Worker
├── content/                 # Content Script (메인 로직)
├── injected/                # fetch/XHR 인터셉터 (MAIN world)
├── popup/                   # Popup UI (설정)
├── options/                 # 고급 필터 설정 페이지
├── collector/               # 키워드 수집 분석 페이지
├── whitelist/               # 화이트리스트 관리 페이지
├── features/
│   ├── badge-detection/     # 뱃지 감지 (API + SVG)
│   ├── content-filter/      # 트윗 필터링 (Observer + Hider)
│   ├── keyword-filter/      # 키워드 필터 (파서 + 매처 + 카테고리)
│   ├── keyword-collector/   # 키워드 수집 (토크나이저 + 통계)
│   ├── follow-list/         # 팔로우 동기화
│   └── settings/            # Chrome Storage 래퍼
├── shared/
│   ├── types/               # Settings, BadgeInfo, FilterRule
│   ├── constants/           # 기본값, 스토리지 키
│   ├── utils/               # 구조화 로거
│   └── i18n.ts              # 다국어 번역 (ko/en/ja)
public/
├── icons/                   # 익스텐션 아이콘
└── _locales/                # Chrome i18n (ko, en, ja)
```

## Privacy

- 수집하는 데이터: 없음
- 외부 서버 통신: 없음 (모든 처리가 로컬)
- 인증 토큰 저장: 안 함
- 권한: `storage` + `x.com`/`twitter.com` host permission만 사용
- 상세: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)

## Disclaimer

> This extension modifies the user's local browser display only. It does not access, modify, or interfere with X's servers or API.

## License

[MIT](LICENSE)

## Author

[@fotoner_p](https://x.com/fotoner_p)
