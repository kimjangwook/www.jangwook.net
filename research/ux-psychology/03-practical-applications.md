# UX 심리학 실제 적용 사례

## 1. Claude Code와 UX 심리학 통합 사례

### 출처: Qiita (nori0724)

**검증 결과**: UX 심리학 컨텍스트를 제공하면 AI가 생성하는 UI/UX 품질이 획기적으로 향상됨

### 비교 실험

#### 패턴 A: 기능 요건만 제시
```
Next.jsでAIチャットボットを作りたいです。
APIキーはAzure OpenAI APIキーを使用。
会話機能のみ必要。
```

**결과**: 기본적인 관리 화면 같은 단순한 UI

#### 패턴 B: UX 심리학 문서 포함
```
@ux_concepts.md를 참고하여
UI/UX를 향상시켜 주세요.
```

**결과**: 현대적이고 세련된 모던 UI

### 자동 적용된 개념들

| 개념 | 설명 | 구현 예시 |
|------|------|---------|
| 미적 사용성 효과 | 아름다운 것이 사용하기 쉬워 보임 | shadcn/ui와 Tailwind CSS 통일된 색상 팔레트 |
| 노동 착각 | 처리 과정을 보여주면 가치감 향상 | "생각 중..." 스피너 표시 |
| 도허티 임계값 | 0.4초 이내 응답이 중요 | 스트리밍 응답으로 즉각적 피드백 |
| 친숙성 편향 | 익숙한 패턴이 학습 비용 절감 | 일반적인 채팅 UI 거품 디자인 |

---

## 2. 기업별 적용 사례

### 2.1 Duolingo - 게이미피케이션 종합

**적용 개념**:
- 게이미피케이션
- 자이가르닉 효과
- 목표 기울기 효과
- 변동형 보상
- 손실 회피 (스트릭)

**구현 요소**:
```jsx
// 스트릭 시스템
const StreakDisplay = ({ currentStreak, streakFreeze }) => (
  <div className="streak-container">
    <div className="flame-icon">🔥</div>
    <span className="streak-count">{currentStreak}일</span>
    <span className="streak-label">연속 학습</span>

    {/* 손실 회피: 스트릭 위험 경고 */}
    {currentStreak > 7 && !streakFreeze && (
      <div className="streak-warning">
        오늘 학습하지 않으면 {currentStreak}일 스트릭이 사라집니다!
      </div>
    )}
  </div>
);

// 진행도 기울기
const LessonProgress = ({ completed, total }) => (
  <div className="lesson-progress">
    <ProgressBar value={completed} max={total} />
    {completed >= total * 0.8 && (
      <span className="encouragement">거의 다 왔어요!</span>
    )}
  </div>
);
```

---

### 2.2 Amazon - 앵커 효과 & 희소성

**적용 개념**:
- 앵커 효과
- 희소성
- 사회적 증명
- 손실 회피

**구현 패턴**:
```jsx
const ProductPrice = ({ originalPrice, salePrice, stockCount, soldCount }) => (
  <div className="product-pricing">
    {/* 앵커 효과 */}
    <div className="price-anchor">
      <span className="original">${originalPrice}</span>
      <span className="sale">${salePrice}</span>
      <span className="discount">
        {Math.round((1 - salePrice/originalPrice) * 100)}% OFF
      </span>
    </div>

    {/* 희소성 */}
    {stockCount < 10 && (
      <span className="scarcity-alert">
        🔥 단 {stockCount}개 남음
      </span>
    )}

    {/* 사회적 증명 */}
    <span className="social-proof">
      지난 24시간 동안 {soldCount}명이 구매했습니다
    </span>
  </div>
);
```

---

### 2.3 Netflix - 선택 과부하 해결

**적용 개념**:
- 선택 과부하 방지
- 개인화
- 노동 착각

**구현 전략**:
```jsx
const ContentRecommendation = ({ user, categories }) => (
  <div className="content-grid">
    {/* 개인화된 첫 번째 행 - 결정 피로 감소 */}
    <section className="top-picks">
      <h2>{user.name}님을 위한 추천</h2>
      <ContentRow items={user.topPicks.slice(0, 8)} />
    </section>

    {/* 카테고리별 제한된 선택지 */}
    {categories.slice(0, 5).map(category => (
      <section key={category.id}>
        <h3>{category.name}</h3>
        <ContentRow items={category.items.slice(0, 8)} />
      </section>
    ))}
  </div>
);

// 노동 착각 - 개인화 로딩
const PersonalizingScreen = () => (
  <div className="personalizing">
    <Spinner />
    <p>당신의 취향에 맞는 콘텐츠를 선별하고 있습니다...</p>
    <ul className="processing-steps">
      <li>✓ 시청 기록 분석</li>
      <li>✓ 선호 장르 파악</li>
      <li className="current">→ 최적 콘텐츠 매칭 중...</li>
    </ul>
  </div>
);
```

---

### 2.4 Airbnb - 희소성 & 사회적 증명

**적용 개념**:
- 희소성
- 사회적 증명
- 시각적 계층

```jsx
const ListingCard = ({ listing }) => (
  <div className="listing-card">
    <div className="listing-image">
      <img src={listing.image} alt={listing.title} />

      {/* 희소성 - 최상단 위치 */}
      {listing.availableRooms <= 2 && (
        <span className="scarcity-badge">
          희귀한 기회 - 남은 방 {listing.availableRooms}개
        </span>
      )}
    </div>

    <div className="listing-info">
      <h3>{listing.title}</h3>

      {/* 사회적 증명 */}
      <div className="social-proof">
        <span className="rating">★ {listing.rating}</span>
        <span className="reviews">({listing.reviewCount})</span>
        {listing.isSuperhost && (
          <span className="superhost-badge">슈퍼호스트</span>
        )}
      </div>

      <p className="price">₩{listing.price}/박</p>
    </div>
  </div>
);
```

---

### 2.5 LinkedIn - 자이가르닉 효과

**적용 개념**:
- 자이가르닉 효과
- 목표 기울기 효과
- 부여 효과

```jsx
const ProfileStrength = ({ profile }) => {
  const steps = [
    { key: 'photo', label: '프로필 사진', completed: !!profile.photo },
    { key: 'headline', label: '헤드라인', completed: !!profile.headline },
    { key: 'summary', label: '요약', completed: !!profile.summary },
    { key: 'experience', label: '경력', completed: profile.experience?.length > 0 },
    { key: 'skills', label: '스킬', completed: profile.skills?.length >= 5 },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const percentage = (completedCount / steps.length) * 100;

  return (
    <div className="profile-strength">
      <h3>프로필 완성도</h3>

      {/* 진행률 표시 - 목표 기울기 */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${percentage}%` }} />
        <span className="percentage">{percentage}%</span>
      </div>

      {/* 미완료 항목 강조 - 자이가르닉 효과 */}
      {percentage < 100 && (
        <div className="incomplete-steps">
          <p>프로필을 완성하면 채용 담당자에게 40% 더 많이 노출됩니다</p>
          <ul>
            {steps.filter(s => !s.completed).map(step => (
              <li key={step.key}>
                <span className="icon">○</span>
                <span>{step.label} 추가하기</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

---

### 2.6 Notion - 부여 효과 & 단계적 공개

**적용 개념**:
- 부여 효과
- 단계적 공개
- 기본값 편향

```jsx
const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({});

  return (
    <div className="onboarding">
      {/* 단계적 공개 */}
      {step === 1 && (
        <div className="step">
          <h2>Notion을 어떻게 사용하실 건가요?</h2>
          <div className="options">
            <button onClick={() => setPreferences({...preferences, useCase: 'personal'})}>
              개인 사용
            </button>
            <button onClick={() => setPreferences({...preferences, useCase: 'team'})}>
              팀 협업
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step">
          <h2>어떤 작업을 하실 건가요?</h2>
          <div className="options">
            <button>문서 작성</button>
            <button>프로젝트 관리</button>
            <button>노트 정리</button>
          </div>
        </div>
      )}

      {/* 부여 효과 - 맞춤형 템플릿 */}
      {step === 3 && (
        <div className="step">
          <h2>당신만을 위한 워크스페이스가 준비되었습니다!</h2>
          <p>선택하신 {preferences.useCase}용 템플릿이 적용되었습니다.</p>
          <button onClick={completeOnboarding}>시작하기</button>
        </div>
      )}
    </div>
  );
};
```

---

### 2.7 TikTok - 변동형 보상

**적용 개념**:
- 변동형 보상
- 몰입 (Flow)
- 도허티 임계값

```jsx
const TikTokFeed = () => {
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 변동형 보상 - 예측 불가능한 콘텐츠
  const loadMoreVideos = async () => {
    const newVideos = await fetchRandomizedVideos();
    setVideos([...videos, ...newVideos]);
  };

  // 몰입 상태 유지 - 즉각적 전환
  const handleSwipe = (direction) => {
    if (direction === 'up') {
      setCurrentIndex(prev => prev + 1);
      // 즉각적 응답 - 도허티 임계값
      if (currentIndex >= videos.length - 3) {
        loadMoreVideos(); // 미리 로드
      }
    }
  };

  return (
    <div className="feed-container" onSwipe={handleSwipe}>
      <Video
        src={videos[currentIndex]?.src}
        autoPlay
        loop
      />
      {/* 다음 비디오 미리 로드 - 0.4초 내 전환 */}
      <Video
        src={videos[currentIndex + 1]?.src}
        preload
        hidden
      />
    </div>
  );
};
```

---

## 3. 카테고리별 베스트 프랙티스

### 3.1 전자상거래

| 개념 | 적용 |
|------|------|
| 앵커 효과 | 원가 + 할인가 동시 표시 |
| 희소성 | "남은 재고 N개" 표시 |
| 사회적 증명 | 리뷰, 평점, 구매자 수 |
| 손실 회피 | "오늘만 이 가격" |
| 기본값 편향 | 추천 옵션 미리 선택 |

### 3.2 SaaS

| 개념 | 적용 |
|------|------|
| 미끼 효과 | 3단계 가격 정책 |
| 매몰비용 | 연간 선결제 할인 |
| 자이가르닉 | 온보딩 체크리스트 |
| 부여 효과 | 맞춤형 초기 설정 |
| 피크-엔드 | 성공 완료 화면 |

### 3.3 교육 앱

| 개념 | 적용 |
|------|------|
| 게이미피케이션 | XP, 배지, 리더보드 |
| 목표 기울기 | 진행률 표시 |
| 변동형 보상 | 불규칙한 보너스 |
| 손실 회피 | 스트릭 시스템 |
| 자이가르닉 | 미완료 레슨 강조 |

### 3.4 소셜 미디어

| 개념 | 적용 |
|------|------|
| 변동형 보상 | 무한 스크롤 피드 |
| 사회적 증명 | 좋아요, 팔로워 수 |
| 호기심 간극 | 일부 콘텐츠 가림 |
| 몰입 | 자동 재생 |
| 도허티 임계값 | 즉각적 반응 |
