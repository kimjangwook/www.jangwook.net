---
title: WCAG リフロー基準を通過しても、400％拡大では読めないことがある
description: 横方向の基準合格が縦方向の読みやすさまで保証しないことを、実測の数字で確かめた。損失が画面の高さに応じて減らない絶対値であることを軸に、その正体を一つずつ分解した。
pubDate: '2026-08-29'
heroImage: ../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/hero.png
tags:
- accessibility
- wcag
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: This article extends the earlier finding that rules can be silently truncated
      while still technically compliant, showing how a page can pass WCAG reflow yet
      lose reading space at every zoom level.
    ko: WCAG 리플로우를 통과해도 실제로는 읽기 공간이 사라지는 이 글은, 규격을 지켰는데도 규칙이 조용히 잘려버리는 이전 글의 문제 의식을
      UI 측정으로 확장해 보여준다.
    ja: WCAGリフローを通過しても読書空間が失われる実測を示すこの記事は、仕様準拠でもルールが静かに切断されるという前回記事の問題意識をUI計測へ広げてくれる。
    zh: 本文将通过实测说明页面符合WCAG回流标准却仍丢失阅读空间,把上一篇文章中规则被静默截断的问题延伸到了UI符合性的盲区。
---

字を大きく拡大して読む人がいる。視力の弱い人もいれば、距離を置いて画面を見ている人もいる。画面を400％に拡大すると、Webページの中身は縦に伸びて、横は細い帯になる。そこで問題になるのは次の疑問だ。アクセシビリティの基準に合格したページは、その拡大の中で本当に読めるのか。測ってみたら、答えは否だった。そして理由は画面が小さいことではなく、決まった大きさの「通行料」が毎回引かれることだった。

## リフロー判定が測れるものと測れないもの

WCAGというのは、Webの内容を誰でも使えるようにするための国際的な決めごとの集まりだ。その中の1.4.10は「リフロー」と呼ばれる基準で、初めて聞く人に言い換えるなら「画面を拡大しても横にスクロールしなくて済むか」を見る決まりである。リフローは「流れを組み直す」という意味で、狭い画面に合わせてレイアウトが組み替わることを指す。

この基準の定め方はこうだ。

> Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels; Horizontal scrolling content at a height equivalent to 256 CSS pixels.
> — [WCAG 2.2 Success Criterion 1.4.10 Reflow (spec) / W3C](https://www.w3.org/TR/WCAG22/#reflow)

読み替えると、縦に流れる内容に対しては幅320ピクセルだけを要求している。幅は測る。高さは測らない。これは穴ではなく、設計の意図である。この規格が縦の読みやすさを保証すると主張したことは一度もない。

健康診断に似ている。血圧を測る検査は血圧だけを見る。合格証を渡されても、それは聴力や足腰まで健康だと証明したことにはならない。検査が測らなかった項目は、合格証では証明されない。リフロー判定の合格証は横方向の項目だけを裏付けている。

それでも実務では、合格が出ていれば「拡大しても読めるはずだ」と代理の信頼が置かれがちである。この代理の信頼がどこで崩れるかを測ったのが今回の実験だ。

## 測定方法と見える縦の空間

測ったのは「本文に実際に届く縦の画素数」だ。ピクセルは画面を形作る最小の点の数え方である。画面を幅320ピクセルに固定し、高さを844、400、256、200の四段階に変えた。844はスマートフォンに近い高さで、200は400％拡大の環境で現れる極端に低い画面である。画面を400％に拡大するとは、縦と横のそれぞれの長さを四分の一にすることであり、高さもその分で減る。

測定の手順はこう進めた。

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="ja"><span class="lm-card__title">測定手順</span><ol class="lm-card__steps"><li class="lm-card__text">ステップ 1. 幅320ピクセルに画面を固定し、高さを844、400、256、200に変えながら読める縦の空間を測った。</li><li class="lm-card__text">ステップ 2. 画面の固定された要素を取り除いた後、空間がどれだけ戻るかを確認した。</li><li class="lm-card__text">ステップ 3. どの要素が空間をどれだけ占めているか、一つずつ外しながら個別に測った。</li><li class="lm-card__text">ステップ 4. 固定要素が一つもないダミーページで、測定方法自体が損失を作っていないかを確認した。</li><li class="lm-card__text">ステップ 5. ページが横にはみ出さない基準を通過するかどうかも合わせて確認した。</li></ol></div>

方法自体は単純である。画面の中で縦に一列に点を打ち、それぞれの点の下にあるのが本文か他の何かかを機械に確かめさせる。これを2ピクセルおきに、横三つの位置で繰り返す。本文に届いた点だけを数え、縦の画素数に換算する。この指標を「usable_px（使える画素数）」と呼ぶ。測定方法が損失を作り込んでいないかの確認もした。固定要素が一つもない、文字だけの練習用ページでは、全行で割合が1.0になり、測り方そのものは無害だった。

公開されている実在のサイト一つに、高さ四段階かつスクロール二状態かつ部品の除去実験を重ねて、27回の実行で確かめた。

## 画面の高さと無関係な82ピクセルの損失

高さ844の画面では、本文に届く画素数は762だった。差し引きの82は上の方にある帯などに取られた分である。この82には特徴がある。

| 画面の高さ | 本文に届いた画素数 | 失った画素数 | 失った割合（上部） |
|---|---|---|---|
| 844 | 762 | 82 | 約10％ |
| 400 | 318 | 82 | 約20％ |
| 256 | 174 | 82 | 約32％ |
| 200 | 118 | 82 | 41.0％ |

画面の高さが844から200まで減っても、失った画素数は四つすべてで82と同じだった。数値が意味するのは、損失が画面の大きさに応じて縮まない絶対値だということである。82という数字は、画面の上をいつも占めている部品が持っている高さ分だ。

損失は金額で言えばつねに82ピクセルで同じだ。画面が低くなるほど、占める割合だけが大きくなる。割合が大きくなったのではなく、割り算の分母が小さくなったのである。スクロールして文章の途中まで進んだ先でも、下部の広告欄が残る場合はさらに減って、残りは200のうち110まで下がる。損失率は41.0％から45.0％に増える。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-budget-ladder-320w-4heights" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">高さ別の縦空間ラダー</span><span class="lm-card__text">画面の高さが844から200に減っても、失われる縦の空間は四つのケースすべてで正確に82ピクセルで同じだった。</span><div class="lm-card__numbers"><span class="lm-card__chip">高さ844の損失 82</span><span class="lm-card__chip">高さ400の損失 82</span><span class="lm-card__chip">高さ256の損失 82</span><span class="lm-card__chip">高さ200の損失 82</span></div></div>

## 要素別の回復量の分解と90ピクセルの正体

この82ピクセルを占めているのがどの部品かを確かめた。部品を一つずつ外して、戻る画素数を測った。

上部の帯は、200の高さでは固定をやめて文章と一緒に流れた。だから上部の状態での82ピクセルは、固定要素ではなく文章の流れの中の帯の分である。スクロールして途中まで進むと、代わりに画面の下に張り付いた高さ400ピクセルの広告欄が姿を見せる。読み手の進む先に先回りして、どの画面でも同じ400の高さを保つ。この広告欄は画面の高さに反応せず、高さ844でも200でも400のままだった。

部品ごとに外して戻る画素数を比べた結果が次の図になる。下部の固定バーを一つ外すと90ピクセルが戻り、それ以外のどの部品を外しても単独では0ピクセルしか戻らなかった。読み始めに画面を占める読書進捗の帯も、上へ戻るボタンも、戻す量は0だった。90という数字は「戻るボタンが高さ48を持っているから」ではない。広告欄が読む空間を覆う量として出る数字だ。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-removal-decomposition-at-320x200" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">原因要素を一つずつ分解</span><span class="lm-card__text">下部の固定バーを一つ外すと90ピクセルが戻り、残りの要素は単独では0ピクセルだった。</span><div class="lm-card__numbers"><span class="lm-card__chip">固定バーの回復 90</span><span class="lm-card__chip">最上部ボタンの回復 0</span><span class="lm-card__chip">ヘッダーの回復 0</span></div></div>

## 横方向の合格判定の隣に置く縦の検査

一方で、横方向の判定は全部通っていた。幅320の画面で、はみ出した画素数は0、判定は8回中8回の合格だった。一覧ページなども含めて、いわゆるリフローの合格証はそのまま有効である。合格証と、200の高さで本文に届く画素数118という事実が、同じサイトの上に並んで立つ。

W3C自身の解説も、こう張り付く帯に触れている。

> Such sticky or fixed content can pose significant issues for those who would benefit from Reflow, as aside from obscuring keyboard focus, such sticky or fixed content can make reading content difficult if not impossible.
> — [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

基準を守るための技法も用意されている。決まりに「C34」という番号が付いた方法がそれだ。画面が特定より低い高さになったら、張り付く帯を普通の流れに戻すやり方を示している。規格は縦を測らないが、縦の損失を出す部品には対処の作法が存在する。

画面を大きく拡大したとき文章が読めなくなるのは、画面が小さいからではない。画面の上をいつも占めている固定要素が、決まった大きさの空間を奪い続けるからである。縦の空間を奪う量は画面の高さに比例せず約82ピクセルで固定であり、そのうち途中読みでの90ピクセルは下部の固定バー一つが占める分だった。

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="ja"><span class="lm-card__title">結論</span><p class="lm-card__takeaway">縦の予算を侵食するコストは画面の高さに比例する相対値ではなく約82ピクセルの絶対的な通行料で、途中読み状態の90ピクセル分は下部の固定バー一つが原因だった。</p></div>

拡大して読む人を受け止めるページを作る人なら、横の合格判定とは別に、縦の届く画素数を測る検査をもう一本回すのが今日できる一手だ。反対に、画面に張り付く要素が一つもない文書や報告書を作る人なら、既存の横方向の基準だけで足りて、別の検査は過剰である。

## この記事が確認できなかったこと

測れなかったことが三つある。一つは上部の帯が固定をやめる画面の高さの境目の正確な値で、400から844のどこかにあるとしか、測定では特定できていない。二つは下部の広告欄の遮りがいくつかの測定で消えることがある理由で、広告の読み込みのタイミングが疑わしいまま未解決だ。三つは拡大利用者が実際にどう離脱するかという行動の面で、この実験は測っていない。

次に確認すべきは、その境目の値をW3Cの技法の例に合わせて測ることと、遮りが消える条件を再現することだ。なお、この判断には覆る条件がある。画面を占める固定要素を全部外しても縦の空間が増えない、あるいは失う縦の画素数が画面の高さに比例して変わる、ということが観測されたなら、この記事の判断は間違いだ。

## 参考資料

1. [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
2. [WCAG 2.2 Success Criterion 1.4.10 Reflow (spec) / W3C](https://www.w3.org/TR/WCAG22/#reflow)
3. [CSS technique C34: Using media queries to un-fixing sticky headers / W3C WAI](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)