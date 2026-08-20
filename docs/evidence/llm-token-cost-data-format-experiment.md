# Evidence: llm-token-cost-data-format-experiment
Date: 2026-06-21  | tiktoken 0.12.0 (o200k_base, cl100k_base) | Python 3.12.8
## Flat 50 records
format                         chars   o200k  cl100k   vs JSON chars/tok
------------------------------------------------------------------------------
TSV                             3742    1568    1663    -62.0%      2.39
CSV                             3742    1650    1650    -60.0%      2.27
Markdown table                  4766    1897    1897    -54.0%      2.51
JSON (compact)                  7985    2578    2593    -37.5%      3.10
key: value lines                6982    2708    2708    -34.4%      2.58
YAML                            7834    3159    3159    -23.5%      2.48
TOML                            8533    3176    3191    -23.1%      2.69
JSON (pretty, indent=2)        10986    4128    4143     +0.0%      2.66
XML                            13654    4777    4778    +15.7%      2.86

baseline JSON pretty o200k = 4128 tokens for 50 records

## Nested 20 orders
format               o200k   vs JSON
--------------------------------------
JSON (compact)        1538    -45.7%
YAML                  1958    -30.9%
TOML                  2021    -28.7%
JSON (pretty)         2835     +0.0%

(nested: CSV/TSV/Markdown 표는 적용 불가 — 중첩 배열을 평탄화 못 함)

## Delimiter tokenization detail
comma row    -> 12 tokens  [258, 69488, 11, 36810, 16, 43127, 921, 42589, 11, 899, 13, 20]
tab row      -> 12 tokens  [258, 69488, 197, 36810, 16, 12706, 921, 42589, 197, 899, 13, 20]
3 commas     -> 1 tokens  [105617]
3 tabs       -> 1 tokens  [833]
indent 2sp   -> 4 tokens  [220, 2140, 25, 1432]
brace        -> 9 tokens  [745, 220, 392, 74, 1243, 220, 16, 198, 92]
