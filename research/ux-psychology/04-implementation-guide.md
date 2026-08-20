# UX 심리학 구현 가이드라인

## 프론트엔드 개발자를 위한 체크리스트

---

## 1. 응답성 최적화 (도허티 임계값)

### 1.1 응답 시간 기준

| 시간 | 사용자 인식 | 권장 대응 |
|------|------------|----------|
| 0-100ms | 즉각적 | 직접 반응 |
| 100-400ms | 빠름 | 시각적 피드백 |
| 400ms-1s | 적당함 | 로딩 인디케이터 |
| 1-10s | 느림 | 진행률 표시 |
| 10s+ | 매우 느림 | 백그라운드 처리 + 알림 |

### 1.2 구현 패턴

```typescript
// 낙관적 UI 업데이트
const useOptimisticUpdate = <T>(
  mutationFn: (data: T) => Promise<T>
) => {
  const [state, setState] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (optimisticData: T, actualData: T) => {
    // 즉시 UI 업데이트 (낙관적)
    setState(optimisticData);

    try {
      const result = await mutationFn(actualData);
      setState(result);
    } catch (err) {
      // 실패 시 롤백
      setState(null);
      setError(err as Error);
    }
  };

  return { state, error, execute };
};

// 사용 예시
const { execute } = useOptimisticUpdate(api.toggleLike);
const handleLike = () => {
  execute(
    { ...post, liked: true, likeCount: post.likeCount + 1 }, // 낙관적
    { postId: post.id } // 실제 요청
  );
};
```

### 1.3 스켈레톤 로딩

```tsx
// 범용 스켈레톤 컴포넌트
const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = ''
}: SkeletonProps) => {
  const baseClass = 'animate-pulse bg-gray-200 rounded';

  const variants = {
    text: 'h-4 w-full',
    circle: 'rounded-full',
    rect: 'rounded-md',
  };

  return (
    <div
      className={`${baseClass} ${variants[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

// 카드 스켈레톤
const CardSkeleton = () => (
  <div className="p-4 border rounded-lg">
    <Skeleton variant="rect" height={200} className="mb-4" />
    <Skeleton variant="text" width="70%" className="mb-2" />
    <Skeleton variant="text" width="40%" />
  </div>
);
```

---

## 2. 인지 부하 감소

### 2.1 정보 청킹

```tsx
// 긴 폼을 스텝으로 분리
const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  return (
    <div className="form-container">
      {/* 진행률 표시 */}
      <div className="step-indicator">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`step ${i + 1 <= step ? 'completed' : ''}`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* 단계별 콘텐츠 */}
      {step === 1 && <PersonalInfoStep />}
      {step === 2 && <ContactInfoStep />}
      {step === 3 && <PreferencesStep />}
      {step === 4 && <ConfirmationStep />}

      {/* 네비게이션 */}
      <div className="form-navigation">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)}>이전</button>
        )}
        {step < totalSteps ? (
          <button onClick={() => setStep(s => s + 1)}>다음</button>
        ) : (
          <button type="submit">완료</button>
        )}
      </div>
    </div>
  );
};
```

### 2.2 입력 형식 자동화

```tsx
// 입력 포맷팅 훅
const useFormattedInput = (
  formatter: (value: string) => string,
  maxLength?: number
) => {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (maxLength) {
      newValue = newValue.slice(0, maxLength);
    }
    setValue(formatter(newValue));
  };

  return { value, onChange: handleChange };
};

// 전화번호 포맷터
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
};

// 사용
const PhoneInput = () => {
  const phoneInput = useFormattedInput(formatPhone, 13);
  return <input {...phoneInput} placeholder="010-1234-5678" />;
};
```

---

## 3. 시각적 계층 구조

### 3.1 타이포그래피 스케일

```css
/* 명확한 계층 구조 */
:root {
  /* 크기 스케일 (1.25 비율) */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.25rem;     /* 20px */
  --text-xl: 1.5rem;      /* 24px */
  --text-2xl: 1.875rem;   /* 30px */
  --text-3xl: 2.25rem;    /* 36px */
  --text-4xl: 3rem;       /* 48px */

  /* 무게 스케일 */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}

/* 제목 계층 */
.h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: 1.1;
}

.h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: 1.2;
}

.h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
  line-height: 1.3;
}

.body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: 1.6;
}

.caption {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  color: var(--text-secondary);
}
```

### 3.2 색상 대비

```css
/* 접근성 기준 충족 색상 */
:root {
  /* 배경 */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;

  /* 텍스트 - WCAG AA 기준 충족 */
  --text-primary: #1e293b;    /* 대비 12.6:1 */
  --text-secondary: #64748b;  /* 대비 4.6:1 */
  --text-muted: #94a3b8;      /* 대비 3.0:1 - 큰 텍스트만 */

  /* 강조 */
  --accent-primary: #3b82f6;
  --accent-hover: #2563eb;

  /* 상태 */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
}
```

---

## 4. 피드백 시스템

### 4.1 상태 표시

```tsx
// 버튼 상태 컴포넌트
const Button = ({
  children,
  loading,
  success,
  error,
  onClick,
  ...props
}: ButtonProps) => {
  const getContent = () => {
    if (loading) return <Spinner size="sm" />;
    if (success) return '✓ 완료';
    if (error) return '✗ 다시 시도';
    return children;
  };

  const getVariant = () => {
    if (success) return 'success';
    if (error) return 'error';
    return 'primary';
  };

  return (
    <button
      className={`btn btn-${getVariant()}`}
      disabled={loading}
      onClick={onClick}
      {...props}
    >
      {getContent()}
    </button>
  );
};
```

### 4.2 토스트 알림

```tsx
// 토스트 시스템
const ToastContext = createContext<ToastContextType | null>(null);

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);

    // 자동 제거 (피크-엔드 법칙: 짧은 긍정적 피드백)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-icon">{getIcon(toast.type)}</span>
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
```

---

## 5. 사회적 증명 구현

### 5.1 리뷰 및 평점

```tsx
const SocialProof = ({
  rating,
  reviewCount,
  recentPurchases,
  clientLogos,
}: SocialProofProps) => (
  <div className="social-proof">
    {/* 평점 */}
    <div className="rating">
      <StarRating value={rating} />
      <span className="rating-value">{rating}</span>
      <span className="review-count">({reviewCount.toLocaleString()} 리뷰)</span>
    </div>

    {/* 실시간 활동 */}
    {recentPurchases > 0 && (
      <div className="recent-activity">
        <span className="pulse-dot" />
        지난 24시간 동안 {recentPurchases}명이 구매
      </div>
    )}

    {/* 신뢰 로고 */}
    {clientLogos && (
      <div className="trust-logos">
        <span className="trust-label">신뢰하는 기업들</span>
        <div className="logo-grid">
          {clientLogos.map(logo => (
            <img key={logo.name} src={logo.url} alt={logo.name} />
          ))}
        </div>
      </div>
    )}
  </div>
);
```

---

## 6. 희소성 및 긴급성

### 6.1 재고/시간 제한 표시

```tsx
const ScarcityIndicator = ({
  stockCount,
  endTime,
  viewCount,
}: ScarcityProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!endTime) return;

    const timer = setInterval(() => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('종료됨');
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="scarcity-container">
      {/* 재고 부족 */}
      {stockCount !== undefined && stockCount <= 10 && (
        <div className="stock-warning">
          <span className="icon">🔥</span>
          <span>단 {stockCount}개 남음</span>
        </div>
      )}

      {/* 시간 제한 */}
      {endTime && (
        <div className="time-limit">
          <span className="icon">⏰</span>
          <span>남은 시간: {timeLeft}</span>
        </div>
      )}

      {/* 현재 관심 */}
      {viewCount && viewCount > 5 && (
        <div className="current-viewers">
          <span className="icon">👁</span>
          <span>{viewCount}명이 보고 있습니다</span>
        </div>
      )}
    </div>
  );
};
```

---

## 7. 진행률 및 게이미피케이션

### 7.1 진행률 표시

```tsx
const ProgressSystem = ({
  current,
  total,
  label,
  showMilestones = false,
}: ProgressProps) => {
  const percentage = Math.round((current / total) * 100);
  const isNearComplete = percentage >= 80;

  const milestones = [25, 50, 75, 100];

  return (
    <div className="progress-system">
      <div className="progress-header">
        <span className="progress-label">{label}</span>
        <span className="progress-value">{current}/{total}</span>
      </div>

      <div className="progress-bar-container">
        <div
          className={`progress-bar ${isNearComplete ? 'near-complete' : ''}`}
          style={{ width: `${percentage}%` }}
        />

        {showMilestones && milestones.map(milestone => (
          <div
            key={milestone}
            className={`milestone ${percentage >= milestone ? 'achieved' : ''}`}
            style={{ left: `${milestone}%` }}
          >
            <span className="milestone-marker" />
            {milestone === 100 && <span className="milestone-icon">🏆</span>}
          </div>
        ))}
      </div>

      {/* 목표 기울기 - 격려 메시지 */}
      {isNearComplete && (
        <div className="encouragement">
          <span className="icon">⭐</span>
          거의 다 왔습니다! 조금만 더!
        </div>
      )}
    </div>
  );
};
```

### 7.2 배지 시스템

```tsx
const BadgeSystem = ({ badges, recentBadge }: BadgeSystemProps) => (
  <div className="badge-system">
    {/* 최근 획득 배지 - 피크 경험 */}
    {recentBadge && (
      <div className="recent-badge animate-pop">
        <span className="badge-icon">{recentBadge.icon}</span>
        <div className="badge-info">
          <span className="badge-title">새 배지 획득!</span>
          <span className="badge-name">{recentBadge.name}</span>
        </div>
      </div>
    )}

    {/* 배지 컬렉션 */}
    <div className="badge-collection">
      {badges.map(badge => (
        <div
          key={badge.id}
          className={`badge ${badge.earned ? 'earned' : 'locked'}`}
          title={badge.description}
        >
          <span className="badge-icon">
            {badge.earned ? badge.icon : '🔒'}
          </span>
          <span className="badge-name">{badge.name}</span>
        </div>
      ))}
    </div>
  </div>
);
```

---

## 8. 완료 경험 (피크-엔드 법칙)

### 8.1 성공 화면

```tsx
const SuccessScreen = ({
  title,
  message,
  nextAction,
  confetti = true,
}: SuccessScreenProps) => {
  useEffect(() => {
    if (confetti) {
      // 컨페티 효과 트리거
      triggerConfetti();
    }
  }, [confetti]);

  return (
    <div className="success-screen">
      <div className="success-animation">
        <div className="checkmark-circle">
          <svg className="checkmark" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
      </div>

      <h2 className="success-title">{title}</h2>
      <p className="success-message">{message}</p>

      {nextAction && (
        <button
          className="btn btn-primary"
          onClick={nextAction.onClick}
        >
          {nextAction.label}
        </button>
      )}
    </div>
  );
};
```

---

## 9. 체크리스트: 페이지별 적용

### 랜딩 페이지
- [ ] 0.4초 이내 첫 콘텐츠 표시
- [ ] 명확한 시각적 계층 (H1 > H2 > Body)
- [ ] 사회적 증명 (고객사 로고, 통계)
- [ ] 단일 CTA 강조 (폰 레스토르프)
- [ ] 희소성/긴급성 요소

### 제품 페이지
- [ ] 앵커 효과 (원가 + 할인가)
- [ ] 사회적 증명 (리뷰, 평점)
- [ ] 희소성 표시 (재고, 시간 제한)
- [ ] 스켈레톤 로딩
- [ ] 이미지 지연 로딩

### 폼/체크아웃
- [ ] 단계별 분리 (인지 부하 감소)
- [ ] 진행률 표시 (목표 기울기)
- [ ] 입력 자동 포맷팅
- [ ] 실시간 유효성 검사
- [ ] 성공 완료 화면 (피크-엔드)

### 대시보드
- [ ] 정보 청킹 (7±2 규칙)
- [ ] 단계적 공개
- [ ] 스켈레톤 로딩
- [ ] 상태 피드백
- [ ] 미완료 항목 강조 (자이가르닉)

### 온보딩
- [ ] 단계적 공개
- [ ] 진행률 표시
- [ ] 부여 효과 (개인화)
- [ ] 성공 축하 화면
- [ ] 게이미피케이션 요소
