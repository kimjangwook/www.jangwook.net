# Evidence: local-llm-reasoning-mode-token-cost-experiment

Model: gemma4:12b-it-qat (Ollama, Q4_0, 11.9B). Run 2026-06-30. temperature=0, seed=7, num_ctx=2048, num_predict=700.
Endpoint: POST /api/chat with top-level `think` boolean.

## Raw run log
```
A1   think=False ok=True  1.2s tok=2 ans='Tokyo'
A2   think=False ok=True  1.2s tok=3 ans='56'
A3   think=False ok=True  1.1s tok=2 ans='7'
A4   think=False ok=True  1.1s tok=2 ans='Green'
B1   think=False ok=True  1.6s tok=3 ans='50'
B2   think=False ok=True  1.6s tok=3 ans='80'
B3   think=False ok=False 1.9s tok=6 ans='12.50'
B4   think=False ok=True  1.6s tok=3 ans='13'
C1   think=False ok=True  1.4s tok=2 ans='5'
C2   think=False ok=True  1.4s tok=2 ans='5'
C3   think=False ok=True  1.6s tok=3 ans='47'
C4   think=False ok=False 1.8s tok=3 ans='21'
C5   think=False ok=True  1.1s tok=2 ans='3'
A1   think=True  ok=True  7.5s tok=46 ans='Tokyo'
A2   think=True  ok=True  12.3s tok=80 ans='56'
A3   think=True  ok=True  12.7s tok=83 ans='7'
A4   think=True  ok=True  9.6s tok=60 ans='Green'
B1   think=True  ok=True  37.5s tok=252 ans='50'
B2   think=True  ok=True  31.5s tok=211 ans='80'
B3   think=True  ok=False 43.9s tok=298 ans='12.50'
B4   think=True  ok=True  24.2s tok=158 ans='13'
C1   think=True  ok=True  44.5s tok=297 ans='5'
C2   think=True  ok=True  58.9s tok=399 ans='5'
C3   think=True  ok=True  39.6s tok=267 ans='47'
C4   think=True  ok=True  30.0s tok=200 ans='17'
C5   think=True  ok=True  15.7s tok=103 ans='3'
DONE total=26
```

## Reasoning trace — C1 (bat and ball)
```
Q: A bat and a ball cost 1.10 dollars in total. The bat costs 1.00 dollar more than the ball. How much does the ball cost, in cents? Just the number.

THINKING:
*   Total cost of bat + ball = $1.10.
    *   Difference in cost (bat - ball) = $1.00.
    *   Goal: Find the cost of the ball in *cents*.

    *   Let $x$ be the price of the ball.
    *   The bat costs $x + 1.00$.
    *   Equation: $x + (x + 1.00) = 1.10$.

    *   $2x + 1.00 = 1.10$
    *   $2x = 1.10 - 1.00$
    *   $2x = 0.10$
    *   $x = 0.05$

    *   The ball costs $0.05 dollars.
    *   Convert to cents: $0.05 \times 100 = 5$.

    *   Ball cost = 5 cents ($0.05).
    *   Bat cost = Ball + 100 cents = 105 cents ($1.05).
    *   Total = 5 + 105 = 110 cents ($1.10). Correct.

    *   The user wants "Just the number".

ANSWER: 5```

## Reasoning trace — C3 (lily pads)
```
Q: In a lake there is a patch of lily pads. Every day the patch doubles in size. It takes 48 days to cover the entire lake. How many days did it take to cover half the lake? Just the number.

THINKING:
*   Initial state: A patch of lily pads in a lake.
    *   Growth rate: Doubles every day.
    *   Final state: Covers the entire lake in 48 days.
    *   Question: How many days to cover half the lake?

    *   Day $n$: Size = $S_n$
    *   Rule: $S_{n+1} = 2 \times S_n$ (doubles every day)
    *   Given: $S_{48} = \text{Full Lake}$

    *   If the size doubles every day, then one day *before* it was full, it must have been half as big.
    *   Mathematically: $S_{48} = 2 \times S_{47}$
    *   Since $S_{48}$ is "Full Lake", then $S_{47}$ must be $\frac{1}{2} \times \text{Full Lake}$.

    *   Day 48: Full lake.
    *   Day 47: Half the lake (because it doubles to become full on day 48).

    *   The user requested "Just the number."

ANSWER: 47```
