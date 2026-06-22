# Evidence — LLM output determinism (temperature & seed)

Date: 2026-06-22
Host: Apple Silicon (darwin 24.6.0), Ollama 0.30.7
Method: identical prompt sent N times per condition; outputs SHA-256 hashed; unique-count + majority share measured.

## Raw run log
```
=== RUN 1: small gemma4 (melavisions, ~2GB), n=15 ===
# model=melavisions/gemma4:latest  n=15  prompt='Write a single short marketing tagline for a new AI coding assistant. Only output the tagline.'

condition                     unique/n  maj_share  avg_lat_s
--------------------------------------------------------------
temp=0.0, no seed               1/15          1.0        0.6
temp=0.0, seed=42               1/15          1.0       0.59
temp=0.8, no seed               5/15        0.467        0.6
temp=0.8, seed=42               1/15          1.0       0.67
temp=0.8, seed=42 (rerun)       1/15          1.0       0.67

# first-output samples per condition:
- [temp=0.0, no seed] "Code Smarter, Not Harder"
- [temp=0.0, seed=42] "Code Smarter, Not Harder"
- [temp=0.8, no seed] "Code Smarter, Not Harder"
- [temp=0.8, seed=42] "Code Smarter, Not Harder with Ada"
- [temp=0.8, seed=42 (rerun)] "Code Smarter, Not Harder with Ada"
=== RUN 2: flagship gemma4:12b-it-qat, longer output (num_predict=200), n=8 ===
# model=gemma4:12b-it-qat n=8 num_predict=200
# prompt='Explain in about 5 sentences why caching matters for LLM applications. Be specific.'

condition                  uniq/n     maj   lat_s  chars
--------------------------------------------------------
temp=0.0, no seed          1/8       1.0   28.53      0
temp=0.0, seed=7           1/8       1.0   27.48      0
temp=1.0, no seed          1/8       1.0   27.93      0
temp=1.0, seed=7           1/8       1.0   28.29      0
=== RUN 3: gemma4:e4b (9.6GB) via /api/chat, n=12 ===
# model=gemma4:e4b n=12 endpoint=/api/chat
condition                    uniq/n     maj   lat_s
---------------------------------------------------
temp=0.0, no seed            1/12      1.0    1.51
temp=0.0, seed=42            1/12      1.0    0.79
temp=0.8, no seed            7/12    0.333    0.84
temp=0.8, seed=42            1/12      1.0    0.86
temp=0.8, seed=42 rerun      1/12      1.0    0.85

# samples:
- [temp=0.0, no seed] Code faster, smarter.
- [temp=0.0, seed=42] Code faster, smarter.
- [temp=0.8, no seed] Code faster, smarter, effortlessly.
- [temp=0.8, seed=42] Code faster, effortlessly smart.
- [temp=0.8, seed=42 rerun] Code faster, effortlessly smart.
```

## Notes
- gemma4:12b-it-qat (community QAT build) returned EMPTY content via both /api/generate and /api/chat
  (done_reason=length, eval_count>0). Excluded from determinism table; treated as a packaging quirk.
- melavisions/gemma4 (~2GB) and gemma4:e4b (9.6GB) both answered normally and gave consistent results.
