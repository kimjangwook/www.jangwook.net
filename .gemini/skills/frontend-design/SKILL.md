---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality and optimal UX psychology. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that is both beautiful and effective.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that combine exceptional aesthetics with evidence-based UX psychology principles. Implement real working code with meticulous attention to both visual beauty and functional effectiveness.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking Framework

Before coding, understand the context and commit to a BOLD yet FUNCTIONAL design direction:

### 1. Purpose & Context
- **Problem**: What problem does this interface solve? Who uses it?
- **Goals**: What actions should users take? What emotions should they feel?
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Success Metrics**: How will we measure effectiveness? (CVR, completion rate, task time, etc.)

### 2. Aesthetic Direction
Pick an extreme aesthetic tone but ensure it serves the function:
- **Tone Options**: Brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc.
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?
- **Psychology**: Which UX principles will drive conversions/engagement? (social proof, scarcity, progress, etc.)

### 3. UX Psychology Strategy
Select 3-5 core principles from the UX Psychology Toolkit (below) that align with your goals:
- **E-commerce**: Social proof, scarcity, anchoring, loss aversion
- **SaaS**: Progress visualization, gamification, peak-end rule, endowment effect
- **Education**: Goal gradient, variable rewards, streak systems, chunking
- **Social**: FOMO, variable rewards, social proof, infinite scroll
- **Forms**: Multi-step, progress bars, optimistic UI, validation feedback

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity. Beauty must serve usability, not compromise it.

---

## Frontend Aesthetics Guidelines

### Visual Design Principles

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics. Pair a distinctive display font with a refined body font. Establish clear hierarchy (H1 > H2 > Body) with size and weight.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Ensure WCAG AA color contrast (4.5:1 for body text, 3:1 for large text).
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Keep animations under 300ms for UI feedback, up to 500ms for transitions.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density. Use spacing to create visual hierarchy and group related elements (Law of Proximity).
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

**NEVER use generic AI-generated aesthetics**:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Cliched color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

---

## UX Psychology Toolkit

Apply these evidence-based principles to enhance usability and drive desired user actions:

### 1. Responsiveness & Performance (CRITICAL)

#### Doherty Threshold
**Principle**: System responses under 400ms feel instant and keep users engaged.

**Time Thresholds**:
- 0-100ms: Instant (direct manipulation)
- 100-400ms: Fast (visual feedback only)
- 400ms-1s: Acceptable (show loading indicator)
- 1-10s: Slow (show progress bar)
- 10s+: Very slow (background processing + notification)

**Implementation**:
```tsx
// Skeleton loading (< 1 second wait)
const ProductCard = ({ isLoading, product }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }
  return <div>{/* actual content */}</div>;
};

// Optimistic UI (instant feedback)
const useLike = (postId) => {
  const [isLiked, setIsLiked] = useState(false);

  const toggleLike = async () => {
    // Update UI immediately
    setIsLiked(!isLiked);

    try {
      await api.toggleLike(postId);
    } catch (error) {
      // Rollback on failure
      setIsLiked(isLiked);
      toast.error('Like failed');
    }
  };

  return { isLiked, toggleLike };
};
```

#### State Feedback
Always provide immediate visual feedback for user actions:
```tsx
const Button = ({ loading, success, error, children, ...props }) => (
  <button
    className={`btn ${success ? 'btn-success' : error ? 'btn-error' : 'btn-primary'}`}
    disabled={loading}
    {...props}
  >
    {loading ? <Spinner /> : success ? '✓ Done' : error ? '✗ Retry' : children}
  </button>
);
```

---

### 2. Cognitive Load Reduction

#### Miller's Law
**Principle**: Average person can hold 7±2 items in working memory.

**Application**:
- Limit navigation to 5-7 items (use "More" dropdown for extras)
- Break long forms into steps (3-5 fields per step)
- Chunk information (phone: 010-1234-5678, not 01012345678)
- Group related items visually

```tsx
// Multi-step form
const CheckoutForm = () => {
  const [step, setStep] = useState(1);
  const steps = [
    { label: 'Shipping', fields: <ShippingFields /> },
    { label: 'Payment', fields: <PaymentFields /> },
    { label: 'Review', fields: <ReviewFields /> },
  ];

  return (
    <div>
      {/* Progress indicator */}
      <div className="flex justify-between mb-8">
        {steps.map((s, i) => (
          <div key={i} className={`step ${i <= step - 1 ? 'active' : ''}`}>
            <span className="step-number">{i + 1}</span>
            <span className="step-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Current step */}
      <div className="step-content">{steps[step - 1].fields}</div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        {step > 1 && <button onClick={() => setStep(s => s - 1)}>Back</button>}
        {step < steps.length ? (
          <button onClick={() => setStep(s => s + 1)}>Next</button>
        ) : (
          <button type="submit">Complete</button>
        )}
      </div>
    </div>
  );
};
```

#### Progressive Disclosure
Only show information when users need it:
```tsx
const Accordion = ({ items }) => {
  const [open, setOpen] = useState(null);

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="border-b">
          <button
            className="w-full text-left p-4 flex justify-between"
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.title}
            <span>{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <div className="p-4 pt-0">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
};
```

---

### 3. Visual Hierarchy & Information Architecture

#### Clear Typography Scale
Establish distinct levels:
```css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.25rem;    /* 20px */
  --text-xl: 1.5rem;     /* 24px */
  --text-2xl: 1.875rem;  /* 30px */
  --text-3xl: 2.25rem;   /* 36px */
  --text-4xl: 3rem;      /* 48px */
}

.h1 {
  font-size: var(--text-4xl);
  font-weight: 700;
  line-height: 1.1;
}

.h2 {
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: 1.2;
}

.body {
  font-size: var(--text-base);
  line-height: 1.6;
}

.caption {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
```

#### F-Pattern & Z-Pattern
- **F-Pattern** (content-heavy): Logo top-left, navigation top-right, content flows left-to-right
- **Z-Pattern** (landing pages): Logo top-left → CTA top-right → content middle → CTA bottom-right

#### Law of Proximity
Group related elements closely, separate unrelated ones:
```css
.form-group {
  margin-bottom: 24px; /* Space between groups */
}

.form-group label {
  margin-bottom: 4px;  /* Label close to input */
}

.form-group input {
  margin-bottom: 8px;  /* Input close to helper text */
}
```

---

### 4. Persuasion & User Psychology

#### Social Proof
Show that others trust/use your product:
```tsx
const SocialProof = ({ rating, reviewCount, purchaseCount, logos }) => (
  <div className="social-proof space-y-4">
    {/* Ratings */}
    <div className="flex items-center gap-2">
      <StarRating value={rating} />
      <span className="font-semibold">{rating}</span>
      <span className="text-gray-600">({reviewCount.toLocaleString()} reviews)</span>
    </div>

    {/* Recent activity */}
    {purchaseCount > 0 && (
      <div className="flex items-center gap-2 text-sm">
        <span className="pulse-dot bg-green-500" />
        <span>{purchaseCount} people bought this in the last 24 hours</span>
      </div>
    )}

    {/* Trust logos */}
    <div className="flex gap-4 opacity-60">
      {logos.map(logo => (
        <img key={logo.name} src={logo.url} alt={logo.name} className="h-8 grayscale" />
      ))}
    </div>
  </div>
);
```

#### Scarcity & Urgency
Create FOMO (Fear of Missing Out):
```tsx
const ScarcityBadge = ({ stockCount, endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!endTime) return;
    const timer = setInterval(() => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Ended');
        clearInterval(timer);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="space-y-2">
      {stockCount <= 10 && (
        <div className="flex items-center gap-2 text-orange-600 font-medium">
          <span>🔥</span>
          <span>Only {stockCount} left in stock</span>
        </div>
      )}
      {endTime && (
        <div className="flex items-center gap-2 text-red-600 font-medium">
          <span>⏰</span>
          <span>Ends in {timeLeft}</span>
        </div>
      )}
    </div>
  );
};
```

#### Anchoring (Pricing)
Show original price to make sale price feel better:
```tsx
const Pricing = ({ original, sale }) => {
  const discount = Math.round(((original - sale) / original) * 100);

  return (
    <div className="pricing">
      <div className="flex items-center gap-3">
        <span className="text-2xl text-gray-400 line-through">
          ${original}
        </span>
        <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
          {discount}% OFF
        </span>
      </div>
      <div className="text-4xl font-bold text-blue-600">
        ${sale}
      </div>
    </div>
  );
};
```

---

### 5. Motivation & Progress

#### Goal Gradient Effect
**Principle**: Motivation increases as people get closer to a goal.

**Implementation**:
```tsx
const ProgressBar = ({ current, total, label }) => {
  const percentage = Math.round((current / total) * 100);
  const isNearComplete = percentage >= 80;

  return (
    <div className="progress-system">
      <div className="flex justify-between mb-2">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-gray-600">{current}/{total}</span>
      </div>

      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isNearComplete ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isNearComplete && (
        <div className="mt-2 text-green-600 font-medium text-sm">
          ⭐ Almost there! Just a little more!
        </div>
      )}
    </div>
  );
};
```

#### Zeigarnik Effect
**Principle**: People remember incomplete tasks better than completed ones.

**Implementation**:
```tsx
const TaskList = ({ tasks }) => {
  const completed = tasks.filter(t => t.completed).length;
  const incomplete = tasks.filter(t => !t.completed);

  return (
    <div>
      <h3 className="font-semibold mb-2">
        Profile Completion: {completed}/{tasks.length}
      </h3>

      {/* Highlight incomplete items */}
      {incomplete.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="font-medium text-yellow-800 mb-2">
            Incomplete items
          </p>
          <ul className="space-y-2">
            {incomplete.map(task => (
              <li key={task.id} className="flex items-center gap-2">
                <span className="text-yellow-600">○</span>
                <span>{task.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All tasks */}
      <ul className="space-y-2">
        {tasks.map(task => (
          <li key={task.id} className={task.completed ? 'opacity-60' : ''}>
            <span className={task.completed ? 'text-green-600' : 'text-gray-400'}>
              {task.completed ? '✓' : '○'}
            </span>
            <span className={task.completed ? 'line-through' : ''}>
              {task.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

#### Peak-End Rule
**Principle**: People judge experiences by their peak and ending, not the average.

**Implementation**:
```tsx
const SuccessScreen = ({ title, message, onContinue }) => {
  useEffect(() => {
    // Trigger confetti animation
    triggerConfetti();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Animated checkmark */}
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <svg className="w-16 h-16 text-green-600 animate-checkmark" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="25" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path fill="none" stroke="currentColor" strokeWidth="3" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </div>

      <h2 className="text-3xl font-bold mb-3">{title}</h2>
      {message && <p className="text-gray-600 text-center max-w-md mb-8">{message}</p>}

      <button
        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700"
        onClick={onContinue}
      >
        Continue
      </button>
    </div>
  );
};
```

---

### 6. Accessibility (NON-NEGOTIABLE)

#### WCAG AA Compliance (Minimum)
- **Color Contrast**: 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt bold)
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Focus Indicators**: Clear visible focus states
- **Alt Text**: Meaningful descriptions for images
- **Semantic HTML**: Proper heading hierarchy, ARIA labels

**Color Contrast Variables**:
```css
:root {
  /* Background */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;

  /* Text - WCAG AA compliant */
  --text-primary: #1e293b;    /* 12.6:1 contrast */
  --text-secondary: #475569;  /* 7.0:1 contrast */
  --text-tertiary: #64748b;   /* 4.6:1 contrast */

  /* Links */
  --link-color: #2563eb;      /* 5.1:1 contrast */
  --link-hover: #1e40af;      /* 7.3:1 contrast */

  /* Status colors */
  --success: #16a34a;         /* 4.5:1 contrast */
  --error: #dc2626;           /* 5.9:1 contrast */
  --warning: #ca8a04;         /* 4.6:1 contrast */
}
```

**Keyboard Navigation**:
```tsx
const AccessibleButton = ({ onClick, children, ...props }) => (
  <button
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    }}
    {...props}
  >
    {children}
  </button>
);
```

**Focus Indicators**:
```css
/* Clear focus outline for all interactive elements */
:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}
```

---

## Page-Type Specific Checklists

### Landing Page
- [ ] 0.4s or less to first content (Doherty Threshold)
- [ ] Clear visual hierarchy (H1 > H2 > Body)
- [ ] Social proof above the fold (logos, stats)
- [ ] Single prominent CTA (Von Restorff Effect)
- [ ] Scarcity/urgency elements if applicable
- [ ] F-pattern or Z-pattern layout

### Product Page
- [ ] Anchoring (original + sale price)
- [ ] Social proof (reviews, ratings, purchase count)
- [ ] Scarcity indicators (stock, time limit)
- [ ] Skeleton loading for images/reviews
- [ ] Clear "Add to Cart" CTA
- [ ] Related products (max 4-6)

### Forms & Checkout
- [ ] Multi-step if >5 fields (cognitive load)
- [ ] Progress indicator (goal gradient)
- [ ] Auto-formatting (phone, credit card)
- [ ] Real-time validation
- [ ] Success screen with celebration (peak-end)
- [ ] Clear error messages with recovery path

### Dashboard
- [ ] Information chunking (7±2 rule)
- [ ] Progressive disclosure (accordions, tabs)
- [ ] Skeleton loading for async data
- [ ] Empty states with clear next actions
- [ ] Incomplete tasks highlighted (Zeigarnik)

### Onboarding
- [ ] Progressive disclosure (3-5 steps max)
- [ ] Progress indicator
- [ ] Personalization (endowment effect)
- [ ] Success celebration at end
- [ ] Skip option for advanced users

---

## Anti-Patterns to Avoid

**Don't**:
- Use generic fonts (Inter, Roboto, Arial) without justification
- Create purple gradient backgrounds (cliche)
- Hide important actions (hamburger menu for primary nav)
- Ignore loading states (blank screen = user leaves)
- Skip accessibility (legal risk + excludes users)
- Overload with choices (decision paralysis)
- Forget mobile (>50% of traffic)
- Use fake urgency (damages trust)
- Ignore performance (slow = high bounce rate)

**Do**:
- Choose distinctive, contextual fonts
- Create custom color palettes with WCAG compliance
- Show loading states (skeleton, spinner, progress)
- Provide immediate feedback (optimistic UI)
- Test keyboard navigation
- Limit choices (3-5 options)
- Mobile-first design
- Use authentic scarcity/urgency only
- Optimize for <3s page load

---

## Success Metrics

Track these to validate your design:
- **Performance**: FCP < 1s, LCP < 2.5s, CLS < 0.1
- **Engagement**: Task completion rate > 70%, bounce rate < 40%
- **Conversion**: CVR improvement, AOV increase
- **Accessibility**: WCAG AA compliance 100%, keyboard nav 100%
- **User Satisfaction**: NPS > 50, CSAT > 4.0/5.0

---

## Final Note

Remember: Claude is capable of extraordinary creative work. Don't hold back - show what can truly be created when thinking outside the box, committing fully to a distinctive vision, **and grounding every decision in evidence-based UX psychology**.

**Beauty without usability is art. Usability without beauty is engineering. Great design is both.**
