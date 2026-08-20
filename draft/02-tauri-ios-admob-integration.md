# Tauri 2.x iOS 앱에 AdMob 보상형 광고 연동하기

> Tauri v2 iOS 앱에 Google AdMob 보상형 광고를 연동하는 과정과 트러블슈팅을 정리했습니다.
> 공식 플러그인이 없어 직접 Swift 플러그인을 개발했습니다.

---

## 목차

1. [왜 AdMob인가?](#1-왜-admob인가)
2. [Tauri CLI 업그레이드](#2-tauri-cli-업그레이드)
3. [Tauri 플러그인 구조 이해](#3-tauri-플러그인-구조-이해)
4. [플러그인 개발 시작](#4-플러그인-개발-시작)
5. [Swift 플러그인 구현](#5-swift-플러그인-구현)
6. [Rust 브릿지 구현](#6-rust-브릿지-구현)
7. [TypeScript API 구현](#7-typescript-api-구현)
8. [앱에 플러그인 연동](#8-앱에-플러그인-연동)
9. [트러블슈팅](#9-트러블슈팅)
10. [테스트/프로덕션 광고 ID 관리](#10-테스트프로덕션-광고-id-관리)
11. [결론](#11-결론)

---

## 1. 왜 AdMob인가?

### 모바일 게임 수익화 옵션

| 방식 | 장점 | 단점 |
|------|------|------|
| **보상형 광고** | 사용자 경험 좋음, 높은 eCPM | 구현 복잡 |
| 배너 광고 | 구현 간단 | 낮은 eCPM, UX 저해 |
| 인앱 구매 | 높은 수익 | 구현 복잡, 결제 심사 |

### 보상형 광고 사용 사례

Shadow Dash에서는 **컨티뉴 시스템**에 보상형 광고를 적용했습니다:

```
게임오버 → "광고 보고 계속하기" 버튼 → 광고 시청 → 게임 재개
```

사용자가 자발적으로 광고를 시청하고 보상(게임 계속)을 받는 구조로, 사용자 경험을 해치지 않습니다.

---

## 2. Tauri CLI 업그레이드

### 2.1 문제 상황

Tauri v2에서 iOS 플러그인을 개발하려면 Swift Package Manager(SPM)를 사용해야 합니다. 그러나 기존 Tauri CLI에는 iOS 프레임워크 타입 선택 옵션이 없거나 제한적이었습니다.

GoogleMobileAds SDK처럼 외부 프레임워크 의존성이 필요한 플러그인을 만들려면 **XCFramework** 지원이 필요합니다.

### 2.2 XCFramework 지원 (PR #13995)

Tauri 팀에서 XCFramework 지원을 추가하는 PR이 머지되었습니다:
- **PR:** https://github.com/tauri-apps/tauri/pull/13995
- **버전:** Tauri CLI 2.9.6+

이 업데이트로 `--ios-framework` 옵션이 추가되어 플러그인 생성 시 프레임워크 타입을 선택할 수 있게 되었습니다.

### 2.3 Tauri CLI 업그레이드 방법

```bash
# Cargo를 통한 Tauri CLI 업그레이드 (Rust)
cargo install tauri-cli --force

# npm을 통한 업그레이드 (JavaScript)
npm update @tauri-apps/cli

# 또는 bun 사용 시
bun update @tauri-apps/cli
```

### 2.4 버전 확인

```bash
# Cargo 버전 확인
cargo tauri --version
# 출력: tauri-cli 2.9.6 (또는 그 이상)

# npm 버전 확인
npx tauri --version
```

### 2.5 --ios-framework 옵션

플러그인 생성 시 iOS 프레임워크 타입을 지정할 수 있습니다:

```bash
# Xcode 프로젝트 방식 (SPM 의존성 추가 용이)
cargo tauri plugin new admob --ios --ios-framework xcode

# XCFramework 방식
cargo tauri plugin new admob --ios --ios-framework xcframework
```

**옵션 비교:**

| 옵션 | 설명 | 장점 | 단점 |
|------|------|------|------|
| `xcode` | Xcode 프로젝트 생성 | SPM으로 의존성 추가 용이 | 프로젝트 파일 관리 필요 |
| `xcframework` | XCFramework 생성 | 배포 용이 | 외부 의존성 추가 복잡 |

**AdMob 플러그인에는 `xcode` 옵션 권장:**
- GoogleMobileAds SDK를 SPM으로 쉽게 추가 가능
- Xcode에서 직접 빌드 설정 수정 가능

### 2.6 업그레이드 후 플러그인 재생성

기존에 만든 플러그인이 있다면 삭제 후 재생성하는 것이 깔끔합니다:

```bash
# 기존 플러그인 삭제
rm -rf tauri-plugin-admob

# 최신 CLI로 플러그인 재생성
cargo tauri plugin new admob --ios --ios-framework xcode
```

### 2.7 주의사항

1. **Cargo와 npm 버전 일치**: 두 CLI 버전이 다르면 예상치 못한 문제 발생 가능
2. **프로젝트 clean 빌드**: 업그레이드 후 `cargo clean` 및 `node_modules` 재설치 권장
3. **Xcode 캐시 삭제**: `~/Library/Developer/Xcode/DerivedData` 삭제 권장

```bash
# 전체 클린 빌드
cargo clean
rm -rf node_modules
rm -rf ~/Library/Developer/Xcode/DerivedData/앱이름-*
bun install
```

---

## 3. Tauri 플러그인 구조 이해

Tauri v2 모바일 플러그인은 다음 구조로 되어 있습니다:

```
tauri-plugin-admob/
├── src/                    # Rust 코드
│   ├── lib.rs             # 플러그인 진입점
│   ├── mobile.rs          # iOS/Android 브릿지
│   ├── desktop.rs         # 데스크톱 스텁
│   ├── commands.rs        # Tauri 커맨드
│   └── models.rs          # 요청/응답 타입
├── ios/                    # iOS 네이티브 코드
│   └── tauri-plugin-admob/
│       └── AdmobPlugin.swift
├── guest-js/              # TypeScript API
│   └── index.ts
├── permissions/           # Tauri 권한 설정
│   └── default.toml
├── build.rs               # 빌드 스크립트
└── Cargo.toml
```

### 데이터 흐름

```
TypeScript (invoke)
    → Rust (command)
    → Swift (run_mobile_plugin)
    → GoogleMobileAds SDK
```

---

## 4. 플러그인 개발 시작

### 4.1 플러그인 스캐폴딩

```bash
# Xcode 프로젝트 방식으로 생성 (SPM 의존성 추가 용이)
cargo tauri plugin new admob --ios --ios-framework xcode
```

이 명령으로 기본 플러그인 구조가 생성됩니다.

> **참고:** `--ios-framework xcode` 옵션을 사용해야 Xcode에서 SPM으로 GoogleMobileAds SDK를 쉽게 추가할 수 있습니다.

### 4.2 GoogleMobileAds SDK 추가

Xcode에서 플러그인 프로젝트를 열고 Swift Package Manager로 SDK 추가:

1. `tauri-plugin-admob/ios/tauri-plugin-admob.xcodeproj` 열기
2. **File → Add Package Dependencies**
3. URL 입력: `https://github.com/googleads/swift-package-manager-google-mobile-ads`
4. **GoogleMobileAds** 선택 후 추가

---

## 5. Swift 플러그인 구현

### 5.1 AdmobPlugin.swift

```swift
import SwiftRs
import Tauri
import UIKit
import WebKit
import GoogleMobileAds

// MARK: - Argument Types
class InitializeArgs: Decodable {}

class LoadRewardedArgs: Decodable {
    let adUnitId: String
}

class ShowRewardedArgs: Decodable {}

// MARK: - AdMob Plugin
class AdmobPlugin: Plugin {
    private var rewardedAd: GADRewardedAd?
    private var isInitialized = false
    private var pendingInvoke: Invoke?

    // 테스트 광고 ID
    private let testAdUnitId = "ca-app-pub-3940256099942544/1712485313"

    @objc public override func load(webview: WKWebView) {
        NSLog("[AdMob Plugin] Loaded")
    }

    // SDK 초기화
    @objc public func initialize(_ invoke: Invoke) {
        if isInitialized {
            invoke.resolve(["success": true, "message": "Already initialized"])
            return
        }

        GADMobileAds.sharedInstance().start { status in
            self.isInitialized = true
            NSLog("[AdMob Plugin] SDK Initialized")
            invoke.resolve(["success": true, "message": "SDK initialized"])
        }
    }

    // 보상형 광고 로드
    @objc public func loadRewardedAd(_ invoke: Invoke) {
        do {
            let args = try invoke.parseArgs(LoadRewardedArgs.self)
            let adUnitId = args.adUnitId.isEmpty ? testAdUnitId : args.adUnitId

            let request = GADRequest()
            GADRewardedAd.load(withAdUnitID: adUnitId, request: request) { [weak self] ad, error in
                if let error = error {
                    invoke.resolve(["success": false, "error": error.localizedDescription])
                    return
                }

                self?.rewardedAd = ad
                self?.rewardedAd?.fullScreenContentDelegate = self
                invoke.resolve(["success": true])
            }
        } catch {
            invoke.reject(error.localizedDescription)
        }
    }

    // 광고 준비 상태 확인
    @objc public func isRewardedAdReady(_ invoke: Invoke) {
        let isReady = rewardedAd != nil
        invoke.resolve(["ready": isReady])
    }

    // 광고 표시
    @objc public func showRewardedAd(_ invoke: Invoke) {
        guard let rewardedAd = rewardedAd else {
            invoke.resolve(["success": false, "rewarded": false, "error": "No ad loaded"])
            return
        }

        guard let rootViewController = getRootViewController() else {
            invoke.resolve(["success": false, "rewarded": false, "error": "No root view controller"])
            return
        }

        pendingInvoke = invoke

        DispatchQueue.main.async {
            rewardedAd.present(fromRootViewController: rootViewController) { [weak self] in
                let reward = rewardedAd.adReward
                if let pending = self?.pendingInvoke {
                    pending.resolve([
                        "success": true,
                        "rewarded": true,
                        "rewardAmount": reward.amount.intValue,
                        "rewardType": reward.type
                    ])
                    self?.pendingInvoke = nil
                }
            }
        }
    }

    // Root View Controller 가져오기
    private func getRootViewController() -> UIViewController? {
        if let windowScene = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .first(where: { $0.activationState == .foregroundActive }),
           let keyWindow = windowScene.windows.first(where: { $0.isKeyWindow }),
           let rootVC = keyWindow.rootViewController {
            var topController = rootVC
            while let presented = topController.presentedViewController {
                topController = presented
            }
            return topController
        }
        return nil
    }
}

// MARK: - GADFullScreenContentDelegate
extension AdmobPlugin: GADFullScreenContentDelegate {
    func adDidDismissFullScreenContent(_ ad: GADFullScreenPresentingAd) {
        rewardedAd = nil
        if let pending = pendingInvoke {
            pending.resolve(["success": true, "rewarded": false])
            pendingInvoke = nil
        }
    }

    func ad(_ ad: GADFullScreenPresentingAd, didFailToPresentFullScreenContentWithError error: Error) {
        rewardedAd = nil
        if let pending = pendingInvoke {
            pending.resolve(["success": false, "rewarded": false, "error": error.localizedDescription])
            pendingInvoke = nil
        }
    }
}

// MARK: - Plugin Export
@_cdecl("init_plugin_admob")
func initPlugin() -> Plugin {
    return AdmobPlugin()
}
```

---

## 6. Rust 브릿지 구현

### 6.1 models.rs

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InitializeResponse {
    pub success: bool,
    pub message: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoadRewardedAdRequest {
    pub ad_unit_id: String,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoadRewardedAdResponse {
    pub success: bool,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IsRewardedAdReadyResponse {
    pub ready: bool,
}

#[derive(Debug, Clone, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ShowRewardedAdResponse {
    pub success: bool,
    pub rewarded: bool,
    pub reward_amount: Option<i32>,
    pub reward_type: Option<String>,
    pub error: Option<String>,
}
```

### 6.2 mobile.rs

```rust
use serde::de::DeserializeOwned;
use tauri::{
    plugin::{PluginApi, PluginHandle},
    AppHandle, Runtime,
};
use crate::models::*;

#[cfg(target_os = "ios")]
tauri::ios_plugin_binding!(init_plugin_admob);

pub fn init<R: Runtime, C: DeserializeOwned>(
    _app: &AppHandle<R>,
    api: PluginApi<R, C>,
) -> crate::Result<Admob<R>> {
    #[cfg(target_os = "ios")]
    let handle = api.register_ios_plugin(init_plugin_admob)?;
    Ok(Admob(handle))
}

pub struct Admob<R: Runtime>(PluginHandle<R>);

impl<R: Runtime> Admob<R> {
    pub fn initialize(&self) -> crate::Result<InitializeResponse> {
        self.0.run_mobile_plugin("initialize", ()).map_err(Into::into)
    }

    pub fn load_rewarded_ad(&self, ad_unit_id: String) -> crate::Result<LoadRewardedAdResponse> {
        self.0.run_mobile_plugin("loadRewardedAd",
            LoadRewardedAdRequest { ad_unit_id }).map_err(Into::into)
    }

    pub fn is_rewarded_ad_ready(&self) -> crate::Result<IsRewardedAdReadyResponse> {
        self.0.run_mobile_plugin("isRewardedAdReady", ()).map_err(Into::into)
    }

    pub fn show_rewarded_ad(&self) -> crate::Result<ShowRewardedAdResponse> {
        self.0.run_mobile_plugin("showRewardedAd", ()).map_err(Into::into)
    }
}
```

### 6.3 build.rs (중요!)

```rust
const COMMANDS: &[&str] = &[
    "initialize",
    "load_rewarded_ad",
    "is_rewarded_ad_ready",
    "show_rewarded_ad"
];

fn main() {
    // iOS 빌드 시 프레임워크 링크
    let target = std::env::var("TARGET").unwrap_or_default();
    if target.contains("ios") {
        println!("cargo:rustc-link-lib=framework=GoogleMobileAds");
        println!("cargo:rustc-link-lib=framework=UserMessagingPlatform");
    }

    tauri_plugin::Builder::new(COMMANDS)
        .android_path("android")
        .ios_path("ios")
        .build();
}
```

---

## 7. TypeScript API 구현

### guest-js/index.ts

```typescript
import { invoke } from '@tauri-apps/api/core'

export interface InitializeResponse {
  success: boolean;
  message?: string;
}

export interface LoadRewardedAdResponse {
  success: boolean;
  error?: string;
}

export interface IsRewardedAdReadyResponse {
  ready: boolean;
}

export interface ShowRewardedAdResponse {
  success: boolean;
  rewarded: boolean;
  rewardAmount?: number;
  rewardType?: string;
  error?: string;
}

export async function initialize(): Promise<InitializeResponse> {
  return await invoke<InitializeResponse>('plugin:admob|initialize');
}

export async function loadRewardedAd(adUnitId: string = ''): Promise<LoadRewardedAdResponse> {
  return await invoke<LoadRewardedAdResponse>('plugin:admob|load_rewarded_ad', {
    adUnitId,
  });
}

export async function isRewardedAdReady(): Promise<IsRewardedAdReadyResponse> {
  return await invoke<IsRewardedAdReadyResponse>('plugin:admob|is_rewarded_ad_ready');
}

export async function showRewardedAd(): Promise<ShowRewardedAdResponse> {
  return await invoke<ShowRewardedAdResponse>('plugin:admob|show_rewarded_ad');
}
```

---

## 8. 앱에 플러그인 연동

### 8.1 Cargo.toml에 플러그인 추가

```toml
[dependencies]
tauri-plugin-admob = { path = "../tauri-plugin-admob" }
```

### 8.2 lib.rs에 플러그인 등록

```rust
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_admob::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 8.3 권한 설정

`src-tauri/capabilities/default.json`:
```json
{
  "permissions": [
    "core:default",
    "admob:default"
  ]
}
```

`tauri-plugin-admob/permissions/default.toml`:
```toml
[default]
description = "Default permissions for the AdMob plugin"
permissions = [
    "allow-initialize",
    "allow-load-rewarded-ad",
    "allow-is-rewarded-ad-ready",
    "allow-show-rewarded-ad"
]
```

### 8.4 Info.plist에 앱 ID 추가

`src-tauri/gen/apple/앱이름_iOS/Info.plist`:
```xml
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX</string>
<key>SKAdNetworkItems</key>
<array>
    <dict>
        <key>SKAdNetworkIdentifier</key>
        <string>cstr6suwn9.skadnetwork</string>
    </dict>
</array>
```

---

## 9. 트러블슈팅

### 9.1 Swift 타입 에러: "cannot find type 'RewardedAd' in scope"

**에러 메시지:**
```
cannot find type 'RewardedAd' in scope
cannot find type 'FullScreenContentDelegate' in scope
```

**원인:** GoogleMobileAds SDK는 Objective-C 기반으로, Swift에서 사용할 때 `GAD` 접두사가 필요합니다.

**해결:**
```swift
// ❌ 잘못된 코드
private var rewardedAd: RewardedAd?
extension AdmobPlugin: FullScreenContentDelegate

// ✅ 올바른 코드
private var rewardedAd: GADRewardedAd?
extension AdmobPlugin: GADFullScreenContentDelegate
```

### 9.2 링커 에러: "Undefined symbols for architecture arm64"

**에러 메시지:**
```
Undefined symbols for architecture arm64:
  "_OBJC_CLASS_$_GADMobileAds", referenced from:
  "_OBJC_CLASS_$_GADRewardedAd", referenced from:
```

**원인:** GoogleMobileAds 프레임워크가 링크되지 않음

**해결 1: 메인 앱 Xcode 프로젝트에 SDK 추가**

1. `src-tauri/gen/apple/앱이름.xcodeproj` 열기
2. **File → Add Package Dependencies**
3. GoogleMobileAds SDK 추가

**해결 2: build.rs에서 프레임워크 링크**

```rust
fn main() {
    let target = std::env::var("TARGET").unwrap_or_default();
    if target.contains("ios") {
        println!("cargo:rustc-link-lib=framework=GoogleMobileAds");
        println!("cargo:rustc-link-lib=framework=UserMessagingPlatform");
    }
    // ...
}
```

### 9.3 build.rs에서 iOS 타겟 감지 안됨

**에러:** `#[cfg(target_os = "ios")]`가 build.rs에서 작동하지 않음

**원인:** build.rs는 **호스트 머신**(macOS)에서 실행되므로, `target_os`는 항상 `macos`입니다.

**해결:** 환경 변수로 타겟 확인

```rust
// ❌ 작동 안함 (build.rs에서)
#[cfg(target_os = "ios")]
println!("cargo:rustc-link-lib=framework=GoogleMobileAds");

// ✅ 올바른 방법
let target = std::env::var("TARGET").unwrap_or_default();
if target.contains("ios") {
    println!("cargo:rustc-link-lib=framework=GoogleMobileAds");
}
```

### 9.4 Tauri 권한 에러

**에러 메시지:**
```
admob.is_rewarded_ad_ready not allowed.
Permissions associated with this command: admob:allow-is-rewarded-ad-ready
```

**원인:** Tauri v2는 보안을 위해 모든 플러그인 명령어에 명시적 권한이 필요합니다.

**해결:**

1. `permissions/default.toml`에 권한 정의
2. 앱의 `capabilities/default.json`에 플러그인 권한 추가

### 9.5 광고가 표시되지 않음

**증상:** 버튼 클릭해도 광고 안 나옴, 바로 게임 재개

**원인:** fallback 로직이 광고 없이 게임을 재개시킴

**해결:** fallback 로직 제거 또는 수정
```typescript
// ❌ 잘못된 코드 - 광고 없어도 게임 재개
if (!readyCheck.ready) {
  await loadRewardedAd();
  game.startContinue(); // 광고 없이 바로 진행
}

// ✅ 올바른 코드 - 광고 필수
if (!readyCheck.ready) {
  adError = 'Ad not ready. Loading...';
  await loadRewardedAd();
  // 사용자가 다시 버튼 클릭해야 함
}
```

### 9.6 Archive 시 dSYM 경고

**경고 메시지:**
```
Upload Symbols Failed
The archive did not include a dSYM for the GoogleMobileAds.framework
```

**원인:** Google SDK의 SPM 배포본에는 dSYM이 포함되어 있지 않음

**영향:** 앱 동작에는 문제없음. 크래시 리포트 심볼화에만 영향.

**해결:** 무시해도 됨 (Google SDK 내부 크래시는 어차피 수정 불가)

---

## 10. 테스트/프로덕션 광고 ID 관리

### 광고 설정 파일

`src/lib/config/admob.ts`:
```typescript
// 광고 활성화 플래그 (승인 전까지 false)
export const ADS_ENABLED = false;

const TEST_AD_UNITS = {
  rewardedAd: 'ca-app-pub-3940256099942544/1712485313',
  appId: 'ca-app-pub-3940256099942544~1458002511',
};

const PRODUCTION_AD_UNITS = {
  rewardedAd: 'ca-app-pub-YOUR_ID/YOUR_AD_UNIT',
  appId: 'ca-app-pub-YOUR_ID~YOUR_APP_ID',
};

const isDevelopment = import.meta.env.DEV;

export const AD_UNITS = isDevelopment ? TEST_AD_UNITS : PRODUCTION_AD_UNITS;
export const isTestMode = isDevelopment;
```

### 사용법

```typescript
import { AD_UNITS, ADS_ENABLED } from '$lib/config/admob';
import * as admob from 'tauri-plugin-admob-api';

// 광고 활성화 시에만 초기화
if (ADS_ENABLED) {
  await admob.initialize();
  await admob.loadRewardedAd(AD_UNITS.rewardedAd);
}
```

### 동작 방식

| 환경 | 광고 ID | 비고 |
|------|---------|------|
| `bun tauri ios dev` | 테스트 ID | 테스트 광고 표시 |
| `bun tauri ios build` | 프로덕션 ID | 실제 광고 표시 |

---

## 11. 결론

### 배운 점

1. **Tauri CLI 최신 버전 유지** - XCFramework 지원 등 중요한 기능이 계속 추가됨
2. **Tauri 플러그인 구조** - Rust ↔ Swift 브릿지 이해
3. **크로스 컴파일** - build.rs에서 HOST vs TARGET 구분
4. **Tauri v2 권한 시스템** - capabilities와 permissions
5. **GoogleMobileAds SDK** - GAD 접두사, 비동기 콜백 패턴

### 핵심 체크리스트

- [ ] Tauri CLI 최신 버전으로 업그레이드 (`cargo install tauri-cli --force`)
- [ ] `--ios-framework xcode` 옵션으로 플러그인 생성
- [ ] GoogleMobileAds SDK를 **메인 앱**과 **플러그인** 모두에 추가
- [ ] build.rs에서 `std::env::var("TARGET")`으로 iOS 감지
- [ ] `permissions/default.toml`에 모든 명령어 권한 정의
- [ ] `capabilities/default.json`에 `admob:default` 추가
- [ ] Info.plist에 `GADApplicationIdentifier` 추가
- [ ] 테스트/프로덕션 광고 ID 분리 관리

### 다음 단계

- Android 지원 추가
- 배너 광고 구현
- 전면 광고 구현
- 광고 이벤트 트래킹

---

**작성일:** 2026년 1월
**환경:** macOS, Tauri CLI 2.9.6+, GoogleMobileAds SDK 11+, Xcode 16
