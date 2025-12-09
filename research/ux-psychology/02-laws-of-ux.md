# Laws of UX - 30가지 UX 법칙

## 출처: lawsofux.com

---

## 휴리스틱 (Heuristics)

### 1. 심미-유용성 효과 (Aesthetic-Usability Effect)
**법칙**: 사용자들은 시각적으로 아름다운 디자인을 더 실용적이라고 인식합니다.

**핵심 통찰**:
- 아름다운 디자인은 긍정적 반응 유발
- 사용자가 사소한 문제에 더 관대해짐
- 첫인상이 전체 사용성 평가에 영향

**구현 가이드**:
```css
/* 세련된 버튼 디자인 */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}
```

---

### 2. 도허티 임계값 (Doherty Threshold)
**법칙**: 컴퓨터와 사용자가 400ms 이하 속도로 상호작용할 때 생산성이 향상됩니다.

**출처**: Walter Doherty & Ahrvind Thadani, IBM Systems Journal (1982)

**핵심 숫자**:
- **0.1초**: 즉각적으로 느껴짐
- **0.4초**: 집중 유지 가능
- **1초**: 사고 흐름 유지 한계
- **10초**: 주의력 유지 한계

**구현 전략**:
```jsx
// 낙관적 UI 업데이트
const handleLike = async () => {
  // 즉시 UI 업데이트 (낙관적)
  setLiked(true);
  setLikeCount(prev => prev + 1);

  try {
    await api.like(postId);
  } catch (error) {
    // 실패 시 롤백
    setLiked(false);
    setLikeCount(prev => prev - 1);
  }
};
```

---

### 3. 피츠의 법칙 (Fitts's Law)
**법칙**: 목표에 도달하는 시간은 목표까지의 거리와 목표 크기의 함수입니다.

**수식**: T = a + b × log₂(D/W + 1)
- T: 이동 시간
- D: 거리
- W: 목표 너비

**적용**:
```css
/* 터치 영역 확보 */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}

/* 자주 사용하는 버튼은 크게, 가까이 */
.primary-action {
  width: 100%;
  padding: 16px 24px;
  font-size: 18px;
}
```

---

### 4. 목표 기울기 효과 (Goal-Gradient Effect)
**법칙**: 목표에 가까워질수록 접근 동기가 강해집니다.

**커피숍 포인트 카드 연구**:
- 12칸 중 2칸 완료된 카드 vs 10칸 빈 카드
- 같은 스탬프 수 필요하지만 전자가 완료율 높음

**구현**:
```jsx
const ProgressBar = ({ current, total }) => {
  const percentage = Math.round((current / total) * 100);
  return (
    <div className="progress-container">
      <div
        className="progress-bar"
        style={{ width: `${percentage}%` }}
      />
      <span className="progress-text">
        {percentage >= 80
          ? `거의 다 왔습니다! ${percentage}%`
          : `${percentage}% 완료`}
      </span>
    </div>
  );
};
```

---

### 5. 힉의 법칙 (Hick's Law)
**법칙**: 의사결정 시간은 선택지의 수와 복잡성에 따라 증가합니다.

**수식**: T = b × log₂(n + 1)
- T: 반응 시간
- n: 선택지 수

**적용**:
```jsx
// 선택지 제한
const PlanSelector = ({ plans }) => {
  // 3개 이하로 제한
  const displayPlans = plans.slice(0, 3);

  return (
    <div className="plan-grid">
      {displayPlans.map(plan => (
        <PlanCard
          key={plan.id}
          plan={plan}
          recommended={plan.isRecommended}
        />
      ))}
    </div>
  );
};
```

---

### 6. 야콥의 법칙 (Jakob's Law)
**법칙**: 사용자는 이미 알고 있는 다른 웹사이트와 동일하게 작동하기를 선호합니다.

**핵심 원칙**:
- 기존 멘탈 모델 활용
- 관습적 패턴 준수
- 혁신보다 친숙함 우선

**적용**:
- 로고는 좌상단, 클릭 시 홈으로
- 검색은 상단 중앙 또는 우측
- 장바구니 아이콘은 우상단
- 푸터에 연락처, 약관 등

---

### 7. 밀러의 법칙 (Miller's Law)
**법칙**: 평균적으로 사람은 작업 기억에 7±2개 항목만 유지할 수 있습니다.

**출처**: George Miller, "The Magical Number Seven, Plus or Minus Two" (1956)

**적용**:
```jsx
// 정보 청킹
const PhoneInput = () => {
  return (
    <div className="phone-input">
      <input maxLength={3} placeholder="010" /> -
      <input maxLength={4} placeholder="1234" /> -
      <input maxLength={4} placeholder="5678" />
    </div>
  );
};

// 네비게이션 항목 제한
const Navigation = ({ items }) => {
  const mainItems = items.slice(0, 5);
  const moreItems = items.slice(5);

  return (
    <nav>
      {mainItems.map(item => <NavItem key={item.id} {...item} />)}
      {moreItems.length > 0 && <DropdownMenu items={moreItems} label="더보기" />}
    </nav>
  );
};
```

---

### 8. 파레토 원칙 (Pareto Principle)
**법칙**: 약 80%의 결과는 20%의 원인에서 비롯됩니다.

**UX 적용**:
- 20% 기능이 80% 사용량 차지
- 가장 많이 사용되는 기능에 집중
- 자원을 고영향 영역에 배분

---

### 9. 피크-엔드 규칙 (Peak-End Rule)
**법칙**: 경험 판단은 전체 평균보다 최고점과 끝점에 기반합니다.

**구현**:
```jsx
// 작업 완료 후 축하 화면
const CompletionScreen = ({ taskName }) => (
  <div className="completion-screen">
    <ConfettiAnimation />
    <div className="celebration-icon">🎉</div>
    <h2>축하합니다!</h2>
    <p>{taskName}을(를) 성공적으로 완료했습니다</p>
    <Button onClick={handleContinue}>계속하기</Button>
  </div>
);
```

---

### 10. 포스텔의 법칙 (Postel's Law)
**법칙**: 입력은 관대하게, 출력은 보수적으로 처리하세요.

**구현**:
```jsx
// 관대한 입력 처리
const normalizeInput = (value) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s@.-]/g, '');
};

// 전화번호 다양한 형식 허용
const normalizePhone = (phone) => {
  return phone.replace(/[^0-9]/g, '');
};
```

---

### 11. 계열 위치 효과 (Serial Position Effect)
**법칙**: 사용자들은 시리즈의 첫 번째와 마지막 항목을 가장 잘 기억합니다.

**적용**:
```jsx
// 중요 항목을 양 끝에 배치
const BottomNavigation = () => (
  <nav className="bottom-nav">
    <NavItem icon="home" label="홈" important />      {/* 첫 번째 */}
    <NavItem icon="search" label="검색" />
    <NavItem icon="add" label="만들기" />
    <NavItem icon="notifications" label="알림" />
    <NavItem icon="profile" label="프로필" important /> {/* 마지막 */}
  </nav>
);
```

---

### 12. 테슬러의 법칙 (Tesler's Law)
**법칙**: 모든 시스템에는 감소할 수 없는 일정 수준의 복잡성이 존재합니다.

**핵심 질문**: 복잡성을 사용자에게 전가할 것인가, 시스템이 처리할 것인가?

**좋은 예**:
```jsx
// 시스템이 복잡성 처리
const AddressInput = () => {
  const handlePostalCode = async (code) => {
    const address = await fetchAddressByPostalCode(code);
    // 자동으로 시/구/동 채움
    setCity(address.city);
    setDistrict(address.district);
    setStreet(address.street);
  };

  return (
    <input
      type="text"
      placeholder="우편번호 입력"
      onChange={e => handlePostalCode(e.target.value)}
    />
  );
};
```

---

### 13. 폰 레스토르프 효과 (Von Restorff Effect)
**법칙**: 여러 유사 객체 중 다르게 보이는 것이 기억될 가능성이 높습니다.

**구현**:
```jsx
// 추천 플랜 강조
const PricingTable = ({ plans }) => (
  <div className="pricing-grid">
    {plans.map(plan => (
      <div
        className={`plan-card ${plan.recommended ? 'highlighted' : ''}`}
        key={plan.id}
      >
        {plan.recommended && (
          <span className="badge">추천</span>
        )}
        <h3>{plan.name}</h3>
        <p className="price">{plan.price}</p>
      </div>
    ))}
  </div>
);
```

---

### 14. 자이가르닉 효과 (Zeigarnik Effect)
**법칙**: 완료된 작업보다 미완료 또는 중단된 작업을 더 잘 기억합니다.

**LinkedIn 프로필 사례**:
```jsx
const ProfileCompletion = ({ profile }) => {
  const completedSteps = calculateCompletedSteps(profile);
  const totalSteps = 5;

  return (
    <div className="profile-completion">
      <h3>프로필 완성도: {completedSteps}/{totalSteps}</h3>
      <ProgressBar value={completedSteps} max={totalSteps} />

      {/* 미완료 항목 강조 */}
      <ul className="incomplete-items">
        {!profile.photo && <li>📷 프로필 사진 추가</li>}
        {!profile.headline && <li>✏️ 한 줄 소개 작성</li>}
        {!profile.experience && <li>💼 경력 추가</li>}
      </ul>
    </div>
  );
};
```

---

## 게슈탈트 원칙 (Gestalt Principles)

### 15. 공통 영역의 법칙 (Law of Common Region)
**법칙**: 명확한 경계 내 영역을 공유하는 요소들이 함께 그룹화됩니다.

```css
.card-group {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  background: #f8fafc;
}
```

---

### 16. 근접성의 법칙 (Law of Proximity)
**법칙**: 가까운 객체들은 함께 그룹화되어 인식됩니다.

```css
/* 관련 항목은 가깝게, 다른 그룹은 멀리 */
.form-group {
  margin-bottom: 24px; /* 그룹 간 여백 */
}

.form-group label {
  margin-bottom: 4px; /* 라벨과 입력 가깝게 */
}

.form-group input {
  margin-bottom: 8px; /* 도움말까지 거리 */
}
```

---

### 17. 프래그난츠의 법칙 (Law of Prägnanz)
**법칙**: 모호하거나 복잡한 이미지는 가장 단순한 형태로 해석됩니다.

**적용**: 단순하고 명확한 아이콘과 형태 사용

---

### 18. 유사성의 법칙 (Law of Similarity)
**법칙**: 유사한 요소들은 분리되어 있어도 하나의 그룹으로 인식됩니다.

```css
/* 같은 유형 버튼은 같은 스타일 */
.btn-action {
  background: #3b82f6;
  color: white;
}

.btn-secondary {
  background: transparent;
  border: 1px solid #3b82f6;
  color: #3b82f6;
}
```

---

### 19. 균일한 연결의 법칙 (Law of Uniform Connectedness)
**법칙**: 시각적으로 연결된 요소들이 비연결 요소보다 더 관련성 있어 보입니다.

```css
/* 단계 표시기에서 연결선 사용 */
.step-indicator {
  display: flex;
  align-items: center;
}

.step-connector {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
}

.step-connector.completed {
  background: #3b82f6;
}
```

---

## 인지 원칙 (Cognitive Principles)

### 20. 선택 과부하 (Choice Overload)
**법칙**: 대량의 옵션을 제시받으면 사람들이 압도당합니다.

**잼 연구 (Sheena Iyengar)**:
- 24종류 잼: 3% 구매
- 6종류 잼: 30% 구매

**적용**:
```jsx
// 필터로 선택지 좁히기
const ProductFilter = ({ products, onFilter }) => {
  const [category, setCategory] = useState(null);

  const filteredProducts = category
    ? products.filter(p => p.category === category)
    : products.slice(0, 12); // 초기에는 12개만 표시

  return (
    <div>
      <FilterBar onChange={setCategory} />
      <ProductGrid products={filteredProducts} />
    </div>
  );
};
```

---

### 21. 청킹 (Chunking)
**법칙**: 정보를 의미 있는 단위로 묶으면 기억하기 쉬워집니다.

```jsx
// 신용카드 번호 청킹
const CreditCardInput = ({ value, onChange }) => {
  const formatValue = (val) => {
    return val
      .replace(/\s/g, '')
      .replace(/(.{4})/g, '$1 ')
      .trim();
  };

  return (
    <input
      value={formatValue(value)}
      onChange={e => onChange(e.target.value.replace(/\s/g, ''))}
      placeholder="1234 5678 9012 3456"
    />
  );
};
```

---

### 22. 인지 부하 (Cognitive Load)
**법칙**: 인터페이스를 이해하고 상호작용하는 데 필요한 정신적 자원의 양입니다.

**세 가지 유형**:
1. **내재적**: 과제 자체의 복잡성
2. **외재적**: 불필요한 정보로 인한 부담
3. **본유적**: 학습과 이해에 필요한 처리

**감소 전략**:
- 불필요한 요소 제거
- 관련 정보 가까이 배치
- 익숙한 패턴 사용

---

### 23. 인지 편향 (Cognitive Bias)
**법칙**: 세계 인식과 의사결정 능력에 영향을 미치는 체계적 사고 오류입니다.

**주요 편향**:
- 확증 편향
- 현상 유지 편향
- 앵커링
- 가용성 휴리스틱

---

### 24. 멘탈 모델 (Mental Model)
**법칙**: 시스템이 어떻게 작동하는지에 대한 사용자의 압축된 이해입니다.

**설계 시 고려사항**:
- 기존 멘탈 모델과 일치하는 설계
- 새로운 모델이 필요하면 충분한 온보딩 제공
- 사용자 기대와 시스템 동작 일치

---

### 25. 작업 기억 (Working Memory)
**법칙**: 작업 완료에 필요한 정보를 임시로 보유하고 조작하는 인지 체계입니다.

**용량**: 약 4개 항목 (이전 7±2보다 낮은 최신 추정)

**설계 함의**:
- 중요 정보는 화면에 유지
- 기억에 의존하지 않는 설계
- 컨텍스트 전환 최소화

---

### 26. 몰입 (Flow)
**법칙**: 활동에 완전히 몰입된 정신 상태로, 집중과 즐거움을 경험합니다.

**조건**:
- 명확한 목표
- 즉각적 피드백
- 도전과 능력의 균형

---

### 27. 활동적 사용자의 역설 (Paradox of the Active User)
**법칙**: 사용자들은 매뉴얼을 읽지 않고 즉시 소프트웨어 사용을 시작합니다.

**설계 함의**:
- 직관적 인터페이스 필수
- 맥락 내 도움말 제공
- 점진적 학습 지원

---

### 28. 선택적 주의 (Selective Attention)
**법칙**: 환경의 자극 중 일부에만 집중하는 과정입니다.

**보이지 않는 고릴라 실험**: 집중하면 다른 것을 놓침

**설계 함의**:
- 중요 정보는 사용자 주의 경로에 배치
- 시각적 계층으로 주의 유도
- 예상치 못한 변화는 명확하게 표시

---

### 29. 오컴의 면도날 (Occam's Razor)
**법칙**: 동등하게 설명하는 가설 중 가정이 가장 적은 것을 선택해야 합니다.

**UX 적용**:
- 가장 단순한 해결책 선택
- 불필요한 기능 제거
- "필요할 수도 있다"는 이유로 추가하지 않음

---

### 30. 파킨슨의 법칙 (Parkinson's Law)
**법칙**: 모든 업무는 주어진 시간을 모두 소비할 때까지 팽창합니다.

**UX 적용**:
- 적절한 시간 제한 설정
- 단계별 마감 표시
- 긴급성 시각화
