# Tauri + PixiJS로 iOS 게임 개발부터 App Store 배포까지

> Tauri 2.x와 PixiJS를 사용해 웹 기술로 iOS 게임을 개발하고 App Store에 배포하는 전체 과정을 정리했습니다.

---

## 목차

1. [기술 스택 선택](#1-기술-스택-선택)
2. [개발 환경 설정](#2-개발-환경-설정)
3. [트러블슈팅: 환경 설정 에러](#3-트러블슈팅-환경-설정-에러)
4. [iOS 개발 빌드](#4-ios-개발-빌드)
5. [실제 기기 테스트](#5-실제-기기-테스트)
6. [App Store 배포](#6-app-store-배포)
7. [Xcode 설정 가이드](#7-xcode-설정-가이드)
8. [스크린샷 촬영](#8-스크린샷-촬영)
9. [자주 발생하는 에러와 해결법](#9-자주-발생하는-에러와-해결법)

---

## 1. 기술 스택 선택

### 왜 Tauri + PixiJS인가?

| 기술 | 역할 | 장점 |
|------|------|------|
| **PixiJS 8** | 2D 렌더링 엔진 | WebGL 기반 고성능, 가벼움, 유연함 |
| **SvelteKit** | 프론트엔드 프레임워크 | 빠른 빌드, 작은 번들, Svelte 5 runes |
| **Tauri 2.x** | 네이티브 래퍼 | Electron보다 가벼움, iOS/Android 지원 |
| **TypeScript** | 개발 언어 | 타입 안정성, IDE 지원 |

### PixiJS vs Phaser

| 항목 | PixiJS | Phaser |
|------|--------|--------|
| 용도 | 순수 렌더링 엔진 | 풀 게임 프레임워크 |
| 번들 크기 | ~300KB | ~1MB |
| 유연성 | 높음 (직접 구현) | 중간 (프레임워크 규칙) |
| 학습 곡선 | 중간 | 낮음 |
| 추천 | 커스텀 게임 로직 | 빠른 프로토타입 |

**Shadow Dash에서 PixiJS를 선택한 이유:**
- 낮/밤 전환 같은 커스텀 시각 효과 구현 용이
- SvelteKit과의 자연스러운 통합
- 더 작은 번들 사이즈로 모바일 최적화

### AI 개발 친화적인 게임 장르

첫 프로젝트로 추천하는 장르:

| 순위 | 장르 | 개발 난이도 | AI 활용도 | 수익 잠재력 |
|------|------|-------------|-----------|-------------|
| 1 | 탭 반응 게임 (Flappy Bird류) | ⭐ | ★★★ | ★★ |
| 2 | 단어/퀴즈 | ⭐⭐ | ★★★★★ | ★★★ |
| 3 | 2048 계열 | ⭐⭐ | ★★★★ | ★★ |
| 4 | 아이들/방치형 | ⭐⭐ | ★★★★ | ★★★★ |

**탭 반응 게임을 추천하는 이유:**
- 코드량이 적음 (500줄 이내 가능)
- 게임 로직이 단순하고 명확
- 스킨/테마 교체로 시리즈화 용이
- 첫 프로젝트로 전체 파이프라인 학습에 적합

---

## 2. 개발 환경 설정

### 2.1 필수 도구 설치

```bash
# Node.js (v18+)
node --version

# Rust 설치
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# iOS 타겟 추가
rustup target add aarch64-apple-ios
rustup target add aarch64-apple-ios-sim

# Xcode Command Line Tools
xcode-select --install
```

### 2.2 Homebrew 패키지 (macOS)

```bash
brew install cocoapods
```

### 2.3 프로젝트 초기화

```bash
# SvelteKit 프로젝트 생성
npx sv create my-game
cd my-game

# PixiJS 설치
bun add pixi.js

# Tauri 초기화
bun add -D @tauri-apps/cli
bunx tauri init

# iOS 초기화
bunx tauri ios init
```

### 2.4 SvelteKit 설정 (Tauri용)

`svelte.config.js`:
```javascript
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      fallback: 'index.html'
    }),
    prerender: {
      entries: []
    }
  }
};
```

`src/routes/+layout.ts`:
```typescript
export const prerender = true;
export const ssr = false;
```

---

## 3. 트러블슈팅: 환경 설정 에러

### 3.1 Bun과 Tauri CLI 호환성 문제

**에러:**
```
Cannot find native binding. npm has a bug related to optional dependencies
```

**원인:** Bun이 Tauri CLI의 optional dependency를 제대로 처리하지 못하는 경우

**해결:**
```bash
# npm으로 전환
rm -rf node_modules bun.lockb
npm install
npm run tauri dev
```

> 참고: 최신 버전에서는 Bun도 대부분 정상 작동합니다.

### 3.2 Rosetta 모드 충돌 (Apple Silicon Mac)

**에러:**
```
Error: Cannot install under Rosetta 2 in ARM default prefix (/opt/homebrew)!
```

**원인:** 터미널이 Rosetta(x86_64) 모드로 실행 중

**해결:**
1. 터미널 앱 → 정보 가져오기 → "Rosetta를 사용하여 열기" 체크 해제
2. 터미널 재시작
3. 확인: `arch` 명령어 실행 → `arm64` 출력되어야 함

### 3.3 Rust/Cargo 설치 에러

**에러:**
```
failed to run 'cargo metadata' command: No such file or directory
```

**해결:**
```bash
# Rust 설치
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# PATH 적용
source "$HOME/.cargo/env"

# 확인
cargo --version
```

---

## 4. iOS 개발 빌드

### 4.1 시뮬레이터 실행

```bash
bun tauri ios dev
```

시뮬레이터 선택 프롬프트가 나타나면 원하는 기기 선택.

### 4.2 Vite 서버 설정

`vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',  // 모든 IP에서 접근 허용
    port: 1420,
    strictPort: true,
  },
});
```

---

## 5. 실제 기기 테스트

### 5.1 Apple Developer 계정 설정

**필수:**
- Apple Developer 계정 ($99/년) 또는 무료 Apple ID (7일 제한)

### 5.2 Team ID 설정

`src-tauri/tauri.conf.json`:
```json
{
  "bundle": {
    "iOS": {
      "developmentTeam": "YOUR_TEAM_ID"
    }
  }
}
```

Team ID 확인: https://developer.apple.com/account → Membership details

### 5.3 기기 등록

**에러:**
```
Device "iPhone" isn't registered in your developer account
```

**해결:**
1. Xcode에서 프로젝트 열기
2. 연결된 iPhone으로 Run 실행
3. "Register Device" 프롬프트에서 등록

### 5.4 실제 기기 실행

```bash
bun tauri ios dev --device
```

### 5.5 네트워크 연결 에러

**에러:**
```
Failed to request http://192.168.0.33:1420/: Connection refused
```

**해결:**
1. Mac과 iPhone이 같은 Wi-Fi인지 확인
2. Mac 방화벽 확인
3. Vite 설정에서 `host: '0.0.0.0'` 확인

---

## 6. App Store 배포

### 6.1 프로덕션 빌드

```bash
bun tauri ios build
```

### 6.2 Xcode에서 Archive

```bash
# Xcode 프로젝트 열기
open src-tauri/gen/apple/*.xcodeproj
```

1. **Destination**: Any iOS Device (arm64) 선택
2. **Product → Archive** 실행
3. Archive 완료 후 **Organizer** 창에서 **Distribute App** 클릭
4. **App Store Connect** 선택 → Upload

### 6.3 Build Rust Code 스크립트 수정

Archive 시 에러 방지를 위해 **Build Phases → Build Rust Code** 스크립트 수정:

```bash
export PATH="$HOME/.nvm/versions/node/v22.22.0/bin:$HOME/.cargo/bin:/usr/local/bin:$PATH"

# Archive 모드에서는 스킵
if [ "$ACTION" = "install" ] || [ "$ACTION" = "archive" ]; then
    echo "Skipping Rust build for archive"
    exit 0
fi

bun run -- tauri ios xcode-script -v --platform ${PLATFORM_DISPLAY_NAME:?} --sdk-root ${SDKROOT:?} --framework-search-paths "${FRAMEWORK_SEARCH_PATHS:?}" --header-search-paths "${HEADER_SEARCH_PATHS:?}" --gcc-preprocessor-definitions "${GCC_PREPROCESSOR_DEFINITIONS:-}" --configuration ${CONFIGURATION:?} ${FORCE_COLOR} ${ARCHS:?}
```

### 6.4 App Store Connect 설정

https://appstoreconnect.apple.com

**필수 정보:**
- 앱 이름, 부제 (각 30자)
- 설명 (4000자)
- 키워드 (100자, 쉼표 구분)
- 스크린샷 (6.7", 6.5", 5.5" 필수)
- 개인정보 처리방침 URL
- 지원 URL

### 6.5 심사 제출

1. 모든 정보 입력 완료
2. **Add for Review** 클릭
3. **Submit for Review** 클릭

**예상 심사 기간:** 24-48시간

---

## 7. Xcode 설정 가이드

### 7.1 TARGETS 위치

```
Xcode 좌측 패널
    └── 📘 프로젝트명 (파란 아이콘) 클릭
        └── 중앙 패널: PROJECT / TARGETS
            └── TARGETS → 프로젝트명_iOS 클릭
```

### 7.2 주요 탭

| 탭 | 용도 |
|------|------|
| **General** | 앱 이름, 버전, Bundle ID |
| **Signing & Capabilities** | Team 설정, 코드 서명 |
| **Build Phases** | 빌드 스크립트 수정 |

---

## 8. 스크린샷 촬영

### 8.1 시뮬레이터 실행

```bash
# 실제 기기 연결 해제 후 실행
bun tauri ios dev

# 또는 특정 기기 지정
bunx tauri ios dev --device "iPhone 16 Pro Max"
```

### 8.2 상태바 정리 (깔끔한 스크린샷용)

```bash
# 시간을 9:41로 설정 (Apple 공식 시간)
xcrun simctl status_bar booted override --time "9:41"

# 배터리 100%
xcrun simctl status_bar booted override --batteryLevel 100 --batteryState charged

# 원래대로 복구
xcrun simctl status_bar booted clear
```

### 8.3 필수 스크린샷 크기

| 기기 | 해상도 |
|------|--------|
| 6.7" (iPhone 16 Pro Max) | 1320 × 2868 |
| 6.5" (iPhone 15 Plus) | 1290 × 2796 |
| 5.5" (iPhone 8 Plus) | 1242 × 2208 |

---

## 9. 자주 발생하는 에러와 해결법

### 에러 모음

| 에러 | 원인 | 해결 |
|------|------|------|
| `Cannot find native binding` | Bun 호환성 | npm 사용 |
| `Cannot install under Rosetta 2` | 터미널 Rosetta 모드 | Rosetta 비활성화 |
| `cargo: command not found` | Rust 미설치 | Rust 설치 |
| `Device isn't registered` | 기기 미등록 | Xcode에서 등록 |
| `Connection refused` | 네트워크 문제 | Vite host 설정, 방화벽 |
| `npm: command not found` (Xcode) | PATH 문제 | 심볼릭 링크 또는 스크립트 PATH 추가 |

### Xcode에서 npm/cargo 못 찾을 때

```bash
# 심볼릭 링크 생성
sudo ln -s $(which bun) /usr/local/bin/bun
sudo ln -s $(which node) /usr/local/bin/node
sudo ln -s ~/.cargo/bin/cargo /usr/local/bin/cargo
```

---

## 명령어 요약

```bash
# 개발 (시뮬레이터)
bun tauri ios dev

# 개발 (실제 기기)
bun tauri ios dev --device

# 프로덕션 빌드
bun tauri ios build

# Xcode 열기
open src-tauri/gen/apple/*.xcodeproj

# 시뮬레이터 목록
xcrun simctl list devices available | grep iPhone

# iOS 타겟 추가
rustup target add aarch64-apple-ios
rustup target add aarch64-apple-ios-sim
```

---

## 결론

Tauri 2.x + PixiJS + SvelteKit 조합으로 iOS 앱을 개발하는 것은 웹 개발자에게 매우 매력적인 선택입니다.

**핵심 포인트:**
1. **SvelteKit + PixiJS** - 가볍고 빠른 게임 개발
2. **Tauri 2.x** - 네이티브 성능과 작은 번들 사이즈
3. **터미널에서 빌드** - Xcode 직접 빌드보다 안정적
4. **Build Script 수정** - Archive 시 에러 방지

첫 앱을 성공적으로 배포하면 두 번째부터는 훨씬 수월해집니다!

---

**작성일:** 2026년 1월
**환경:** macOS, Tauri 2.x, PixiJS 8, SvelteKit, Xcode 16
