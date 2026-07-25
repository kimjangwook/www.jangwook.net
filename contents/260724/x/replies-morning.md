# X 상호작용 스카우트 — morning (2026-07-24 금)

수집: `scripts/x-scout.sh replies` + `likes` (Grok CLI X 검색). replies 6건 중 실측 각도가 강한 3건 채택.

문체 규범: です・ます調 구어체 존댓말. 「〜んですよね」 이번 산출물 전면 배제(본편 3본에서 이미 2회 상한 도달 — team-lead QA). 헤지 어미 3건 서로 다르게 분산. 아포리즘 닫기·「正直」「地味に」 미사용. 날조 금지 — 확언 대신 관찰·진행형으로 프레이밍.

---

## 초안 1 — quote · @aakobuppan (👍175)

- 원문 요지: GEO/LLMO 대책으로 SEOer가 살아남기 힘든 이유를 추試 가능한 검증 note로 정리
- URL: https://x.com/aakobuppan/status/2080111672250012057
- 각도: 시책보다 "효과를 재는 구조"를 먼저 만드는 실측주의. 인용 위치 이동 관찰

초안:
```
施策そのものより「効いたか測る仕組み」を先に置かないと、自分でも判断できなかったです。

うちは同じ質問を定期的にPerplexityとChatGPTに投げて、引用に出るかどうかを記録してます。増減より、引用される箇所が動くのが見ていて面白いところでした。
```
(어미: 面白いところでした — 감상 파편)

---

## 초안 2 — quote · @seito_horiguchi (👍264)

- 원문 요지: Next.js를 그만두고 React×Fastify로. 경계 모호함과 취약점 연발이 이유
- URL: https://x.com/seito_horiguchi/status/2079851792427323604
- 각도: 요건마다 SSR 필요성을 측정하고 나서 자르는 派. 개인 블로그는 정적으로 회귀

초안:
```
境界が曖昧になる話、わかる気がします。

うちは個人ブログでSSRが要らなかったので、Astroの静的に寄せてます。フレームワークの優劣より、その要件で本当にSSRが要るのかを測ってから決める方が、あとで揉めない印象です。
```
(어미: 印象です — 약한 유보)

---

## 초안 3 — quote · @kgsi (👍62)

- 원문 요지: 사람용 HTML과 AI용 Markdown+llms.txt를 동일 소스에서 내보내는 문서 설계
- URL: https://x.com/kgsi/status/2080062981766008876
- 각도: llms.txt 배치 전후 동일 프롬프트 기록. 인용 "문장" 교체 관찰

초안:
```
人間用HTMLとAI用Markdownを一つのソースから出す設計、良いですね。

うちもllms.txtを置いて、前後で同じプロンプトのAI回答を残してます。引用が増えるというより、引用される「文」が入れ替わったのが意外でした。
```
(어미: 意外でした — 감탄 파편)

---

## 좋아요 목록 (8건)

1. @makoto_ueki — WCAG-EM 2.0(W3C Group Note) 공개, 평가 대상이 웹사이트 외 디지털 제품 전반으로 확대 https://x.com/makoto_ueki/status/2080335625358893113
2. @aiweblab_jp — AI 생성 HTML의 heading 계층 누락 지적 + 프롬프트 고정·HeadingsMap 납품 전 확인 https://x.com/aiweblab_jp/status/2080405095993520487
3. @koki_okino — FAQPage 구현만으로는 AI 노출 거의 안 늘고, 일차정보·사례 있는 회사에서 효과 (검증 체감) https://x.com/koki_okino/status/2080342175636914235
4. @tooru_medemi — Edelman 2026 조사(15시장·17,688명), AI를 신뢰원으로 꼽는 사람 3% vs 제3자 목소리 41% https://x.com/tooru_medemi/status/2080402021446996178
5. @niyu1103 — 코더 초기 案件에서 node_modules째 FTP 업로드한 실패담을 정직하게 공유 https://x.com/niyu1103/status/2080261695675719965
6. @kouhei_engineer — 본번 비재현 에러에 2시간, 원인은 캐시였던 현장 あるある 실패·재발 방지 https://x.com/kouhei_engineer/status/2080218431304171564
7. @_pochi — Codex 병렬 개발에서 컨플릭트 해소·타당성 검사 비용, 파일 분할로 예방하는 실측적 깨달음 https://x.com/_pochi/status/2080147180002976242
8. @ryo_ai_hack — Meta 광고 API 일예산 자동조정 자작으로 판명된 함정(학습 리셋·반영 지연·재개 시 CPA 튐) 3점 https://x.com/ryo_ai_hack/status/2080412739693138427
