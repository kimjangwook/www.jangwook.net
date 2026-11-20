视频中响起了两声提示音。屏幕上出现了安全验证失败、需要重新验证的提示文字和按钮。仅靠听觉获取信息的用户虽然能察觉到错误信号，却可能错过究竟是哪里失败了以及接下来该如何继续操作。音频描述正是将这类画面含义与原声一同传达给用户的方法。

## 判断仅靠声音会遗漏哪些信息的标准

WCAG 2.2 的<strong>成功标准 1.2.5（预录音频描述，Audio Description (Prerecorded)，AA 级）</strong>要求为预录同步媒体中的所有视频内容提供音频描述。该项的判定以成功标准的要求及相关术语定义为依据。W3C 同步提供的解读（Understanding）、充分技术（Sufficient Techniques）和失败案例（Failures）均属于非规范性（non-normative）参考资料。在实务中，为了避免因未满足某一项技术就直接断定标准失败，或反过来将特定技术误认为唯一标准答案，必须首先厘清这一边界。

A 级标准 <strong>SC 1.2.3（音频描述或媒体替代）</strong>与 AA 级标准 <strong>SC 1.2.5</strong> 之间的区别非常明确。在 SC 1.2.3 中，可以选择提供完整包含画面、对白、重要声音及必要交互的基于时间的媒体文本替代，或者提供音频描述。但在 AA 级的 SC 1.2.5 中，仅靠常规的文本替代并不足够。以语音传达视觉信息的音频描述成为基本要求。

不过，这并不意味着必须为所有视频都强制附加一条独立的音频描述音轨。如果重要的画面信息已经全部包含在默认音轨（对白、旁白、音效）中，则不需要额外的音频描述音轨。此外，还需区分基于同步媒体（synchronized media）定义的适用排除条件。如果视频所提供的信息并未超出正文或其文本替代，且明确标明其为文本的媒体替代，则该视频不属于 SC 1.2.5 的适用对象，判定结果为 `not_applicable`。

<figure class="learning-figure"><a href="/images/accessibility/audio-description-prerecorded-20261120/zh/paths-7363e88210f0.svg" aria-label="查看原尺寸图示"><img src="/images/accessibility/audio-description-prerecorded-20261120/zh/paths-7363e88210f0.svg" alt="由三张卡片组成的对比图示。第一张卡片说明 SC 1.2.3（A 级）可选择文本替代或音频描述；第二张卡片说明 SC 1.2.5（AA 级）以音频描述为基本要求，并列出 G78、G173、G226 路径；第三张卡片说明 G203 仅为单人讲话、固定背景且无随时间变化的重要视觉信息时才允许使用的限定路径。" loading="lazy" /></a><figcaption>对比 A 级与 AA 级的要求差异，以及 G203 限定适用范围的概念图。</figcaption></figure>

## 实现路径选择：G78、G173、G226 与 G203 的局限

提供音频描述的方法并不局限于单一技术。根据制作环境和播放器的支持范围，可以考虑以下充分技术：

* <strong>G78（提供用户可选择的第二音轨）</strong>：在默认语音之外提供包含音频描述的辅助音轨，并允许用户通过内容自带控件、媒体播放器或操作系统（OS）设置将其开启。
* <strong>G173（提供包含音频描述的独立版本）</strong>：提供已混入音频描述的独立视频版本。该版本本身也必须是无障碍的；如果放置在独立页面上，还需确认是否存在便于用户查找并跳转至该版本的链接。
* <strong>G226（融入描述的旁白）</strong>：从脚本撰写阶段起，就将画面的核心视觉信息自然地融入默认旁白中。该技术与 G173 组合被认可为充分技术，并未强制限定单一技术方式。

需要特别注意的技术是 <strong>G203（针对固定背景单人讲话视频的静态文本替代）</strong>。G203 并非给普通视频附上文本替代就能通过 AA 级的方法。它是一条非常有限的通过路径，仅适用于只有一名讲话者、背景固定、完全没有随时间变化的重要视觉信息，且仅将原声中未包含的背景语境、讲话者姓名、演职员表等静态信息通过程序化关联的文本加以补充的情况。对于包含界面操作画面或错误提示变化的教学视频，不能适用 G203。

## 对白间隙、提示音保留与 F113 失败条件

失败案例 <strong>F113</strong> 针对的是画面中存在重要视觉信息、对白之间也存在可适当利用的空白间隙，却未加入音频描述的情况。在判断间隙时，不适用固定的时间阈值（例如一律要求 2 秒以上），而应综合考量以下三个因素：

1. <strong>间隙长度与场景邻近度</strong>：考察用于插入描述的区间是否既不远离对应的视觉事件，又能以易于理解的语速传达信息。
2. <strong>重要声响的保留</strong>：背景音乐可以通过降低音量（ducking）的方式进行调节，但绝不能用音频描述掩盖表示错误的提示音或代表操作结果的核心音效。
3. <strong>间隙不足时的判断</strong>：仅凭对白间隙不足这一事实本身，并不能自动决定 AA 级通过或失败。通过暂停视频来插入描述的<strong>扩展音频描述（Extended Audio Description）</strong>也可以作为满足 AA 级的方法使用；而在间隙不足时强制要求提供扩展音频描述，则是 AAA 级标准 <strong>SC 1.2.7</strong> 的附加要求。

## 实际 6 个场景对照：恢复码引导视频

为了将原理代入实际画面，我们将公共实训对象——恢复码引导视频（`source.mp4`，时长约 31.21 秒，韩语画面、韩语单音频流）按大致时间段划分为 6 个区间，对画面信息与默认语音进行了对照。以下区间为大致的场景划分，而非精确时间码测量。

<figure class="learning-figure"><a href="/images/accessibility/audio-description-prerecorded-20261120/zh/storyboard-a-1704a27a882f.svg" aria-label="查看原尺寸图示"><img src="/images/accessibility/audio-description-prerecorded-20261120/zh/storyboard-a-1704a27a882f.svg" alt="按顺序排列恢复码引导视频从 0 秒到 31 秒 6 个实际画面帧的分镜图。标注了各场景的大致时间、画面步骤、原声覆盖情况，以及 12~15 秒失败提示和 20~26 秒教学用恢复码声明处的信息遗漏要点。" loading="lazy" /></a><figcaption>从原始 MP4 提取的 6 个实际画面帧（原始提取）以及各大致区间的画面与语音对应摘要。 (1/2)</figcaption></figure>

<figure class="learning-figure"><a href="/images/accessibility/audio-description-prerecorded-20261120/zh/storyboard-b-cceda55ec15e.svg" aria-label="查看原尺寸图示"><img src="/images/accessibility/audio-description-prerecorded-20261120/zh/storyboard-b-cceda55ec15e.svg" alt="按顺序排列恢复码引导视频从 0 秒到 31 秒 6 个实际画面帧的分镜图。标注了各场景的大致时间、画面步骤、原声覆盖情况，以及 12~15 秒失败提示和 20~26 秒教学用恢复码声明处的信息遗漏要点。" loading="lazy" /></a><figcaption>从原始 MP4 提取的 6 个实际画面帧（原始提取）以及各大致区间的画面与语音对应摘要。 (2/2)</figcaption></figure>

| 大致区间 | 屏幕上显示的核心信息 | 默认语音（原声） | 音频描述补充审查要点 |
| :--- | :--- | :--- | :--- |
| <strong>0~6 秒</strong> | 安全设置画面、路径（设置→安全→恢复码）、“生成新恢复码”按钮 | “在设置中选择安全”，用户提问“现在可以把旧恢复码扔掉吗？” | 语音提及了部分菜单进入路径，但需确认细致画面结构是否清晰 |
| <strong>7~11 秒</strong> | 生成前确认对话框、保存新恢复码前禁止废弃旧恢复码的提示、“保留旧恢复码”按钮 | “不可以，在保存新恢复码之前请不要扔掉。” | 核心警告意图已包含在语音中，但视频演示画面中显示的按钮名称仅存在于画面上 |
| <strong>12~15 秒</strong> | <strong>“安全验证失败”</strong>标题、<strong>“安全验证失败。请重新验证。”</strong>提示语、<strong>“重新进行安全验证”</strong>按钮 | 播放两声提示音后，直至 16 秒前均无对白 | <strong>主要缺陷候选</strong>：仅靠提示音无法传达安全验证失败的状态及重新验证的指引 |
| <strong>16~19 秒</strong> | 重新验证完成画面、“确认生成”按钮 | “重新完成安全验证后，确认生成。” | 重新验证成功及进入下一步的流程已反映在默认语音中 |
| <strong>20~26 秒</strong> | 新恢复码画面、教学用虚拟恢复码 `R7K2-P9M4`、<strong>“此画面中的恢复码无法在实际账号中使用。”</strong>声明、“保存恢复码”按钮 | “将新恢复码保存在安全的地方。重新生成后，旧恢复码将无法再使用。” | 相比逐字朗读虚拟字符串，更需审查是否遗漏了<strong>教学用途、无法用于实际账号</strong>这一核心含义 |
| <strong>27~31 秒</strong> | 生成完成画面、新恢复码已保存及旧恢复码失效状态、“返回设置”按钮 | “确认生成完成画面。” | 完成状态已包含在语音中，需确认最终返回按钮等附加界面信息 |

### 仅靠提示音无法获知的信息：12~15 秒安全验证失败区间

在这段视频中，音频描述的必要性体现得最为明显的位置是 <strong>12~15 秒</strong>。画面上出现了安全验证失败的标题、要求重新验证的提示文字，以及“重新进行安全验证”按钮。然而默认语音中仅响起了两声提示音，直到 16 秒才再次出现对白。

提示音虽然发出了某种错误发生的信号，但从听众的角度来看，无法得知究竟是什么失败了，也无从知晓视频演示的流程中需要通过哪个按钮来进行重新验证。紧接着在 16 秒突然出现“重新完成安全验证后”的对白时，看不见画面的用户就会丢失失败与重试之间的上下文衔接。

<figure class="learning-figure"><a href="/images/accessibility/audio-description-prerecorded-20261120/zh/scene_compare-4d09a7d58275.svg" aria-label="查看原尺寸图示"><img src="/images/accessibility/audio-description-prerecorded-20261120/zh/scene_compare-4d09a7d58275.svg" alt="将第 14 秒安全验证失败画面帧与画面信息、当前语音、改进示例分三列对比的图示。画面显示安全验证失败与重新验证提示及按钮；当前语音为两声提示音后无对白；改进示例为保留提示音后说明失败状态与重新验证按钮的未制作建议文案。" loading="lazy" /></a><figcaption>将第 14 秒的实际画面帧（原始提取）与当前原声（观察）进行对照，并列整理了保留提示音的音频描述示例（建议、未制作）。</figcaption></figure>

改进这一区间时需要遵循两项原则。第一，必须完整保留原声中必要的两声提示音，不得用音频描述将其覆盖。第二，应在提示音结束后的对白间隙中安排简短描述，但在经过实际录音和混音之前，绝不能断定“4 秒内一定能塞下这句话”。下面的概念图展示了保留提示音与间隙排布之间的关系；由于实际修改后的音频尚未制作和验证，语速与时长必须在制作阶段重新测量。

<figure class="learning-figure"><a href="/images/accessibility/audio-description-prerecorded-20261120/zh/timing-4c72ac57d721.svg" aria-label="查看原尺寸图示"><img src="/images/accessibility/audio-description-prerecorded-20261120/zh/timing-4c72ac57d721.svg" alt="上下对比原始音轨与建议音轨的时间轴概念图。原始音轨在 12 秒附近播放两声提示音后经过无对白间隙，衔接 16 秒的重新验证对白；建议方案保留两声提示音不被掩盖，在其后的间隙区间安排音频描述，并标注需重新测量时长以避免与 16 秒的下一句对白重叠。" loading="lazy" /></a><figcaption>在两声提示音与下一句对白之间的间隙中排布描述的概念图。区间为大致划分，实际发声时长需在制作后重新测量。</figcaption></figure>

### 20~26 秒区间：字符串朗读与含义传达的区别

在 20~26 秒区间，画面上展示了教学用虚拟恢复码 `R7K2-P9M4`，并附有“此画面中的恢复码无法在实际账号中使用。”的注意事项。默认语音只说明了将恢复码保存到安全位置的流程，却未提及画面中的恢复码是不能用于实际账号的教学示例。此时，音频描述的目的并不是机械地把这八个虚拟字符全部念出来，而是要补足画面所呈现的恢复码属于教学示例、无法在实际账号中使用的<strong>核心含义遗漏</strong>。

## 实训中已确认的信息与尚待保留的判断

在实际媒体巡检中，将观察事实与最终判定分离开来至关重要。本次记录仅限于在本地服务器上渲染公共实训 1.0.2 版本初始状态（`variant=a`，`state=initial`）时收集到的证据。

* <strong>媒体文件与 DOM 确认</strong>：`source.mp4`（约 31.21 秒）仅包含单一音频流。DOM 的 `<track>` 元素中只有字幕（`captions`），且在已观察的区域内未发现指向音频描述版本的链接。
* <strong>避免技术误判</strong>：仅凭 Chromium 内核浏览器未暴露 `audioTracks` API 这一事实，不能证明不存在音频描述音轨。同样，在浏览器中以静音状态成功将视频从头到尾连续播放完毕，也不能作为已听取并验证音频的证据。
* <strong>观察范围的局限</strong>：通过原生音频处理、大约每 1 秒间隔的帧观察以及 6 个代表帧的提取，确认了 12~15 秒与 20~26 秒的视觉信息遗漏候选。但这一结果不能替代全帧连续观察、专家听评或生产环境的全面审计。生产页面的其他状态、独立页面的替代版本链接、操作系统层面的音轨选择路径，以及改进后的音频目前均尚未审查。

因此，在当前观察范围内，虽然可以清晰说明默认语音遗漏重要视觉信息的缺陷候选，但对整个实训对象的最终判定（`actual_decision`）仍维持为<strong>判定待定（`inconclusive`）</strong>，而非直接确定失败。只有将已确认的事实（单一音频流、观察区域内未发现描述链接、12~15 秒无对白提示音）与需要补充核查的项目（其他路径是否存在替代版本、生产环境状态）分开记录，才能做出准确的无障碍审计。

<section class="lesson-result"><h3>练习资料的判定与范围</h3><p><strong>最终判定：待定（inconclusive）</strong></p><ul><li>约12–15秒：画面显示失败提示与重新认证按钮；原声观测记录仅包含两次提示音。</li><li>约20–26秒：画面显示仅供教学、不能用于真实账户的声明，但原声观测记录未包含该含义。</li></ul><p>仅限当前工作版本练习的初始状态、原始音频处理、约每秒一次的视频抽样及代表性解码帧。生产页面、其他状态、操作系统选择路径和修正音频尚未检查。同一证据经三个独立会话审查后均保留待定判定；这并不代表对原始音频进行了三次直接听取。</p></section>

## 查看公共实训对象

下方实训界面为生产路径链接，供读者亲自查看播放器与视频。正文记录的 DOM 与画面帧观察依据均基于实训环境的初始状态（`variant=a`，`state=initial`）收集，实训时请一并核对画面构成与音轨状态是否一致。视频的原始语音与画面文字均为韩语。

<iframe src="/labs/accessibility/common/target?lang=zh&variant=a&state=initial#lab-recorded-video" title="公共实训：用于检查音频描述的恢复码引导视频" loading="lazy" style="width:100%;min-height:720px;border:1px solid #888;"></iframe>

[打开公共实训](/labs/accessibility/common/target?lang=zh&variant=a&state=initial#lab-recorded-video)

## 实务审查清单

在审查预录视频是否符合 SC 1.2.5 时，请核对以下项目。勾选仅表示已执行该项审查工作，是否满足标准需另行记录。

- [ ] <strong>准备输入资料</strong>：一并准备好原始视频文件（或媒体流）、默认音轨、字幕文件，以及视频所在页面的完整 DOM 和周边链接信息。
- [ ] <strong>确认适用排除情况</strong>：首先核实视频是否未提供超出正文文本或文本替代的额外信息，且已明确标示为文本替代，以此区分是否属于 `not_applicable`。
- [ ] <strong>对照原声与视觉信息</strong>：分段核对主要场景切换、错误提示、按钮与状态变化、声明文字等核心视觉信息是否已包含在默认语音中。
- [ ] <strong>确认替代路径的启用方式</strong>：检查是否存在用户实际能够开启或跳转至音频描述的路径，如 G78（播放器、内容控件或操作系统音轨选择）或 G173（独立版本链接及页面无障碍性）。
- [ ] <strong>审查描述内容的恰当性</strong>：确认描述并非单纯的装饰性说明或无意义字符罗列，而是包含了帮助用户理解下一步操作或掌握注意事项所必需的核心含义。
- [ ] <strong>检查对白间隙与声响保留</strong>：评估对白间隙的长度与场景邻近度，检查是否掩盖了提示音等核心音效（背景音可调节音量）。不套用固定的秒数阈值。
- [ ] <strong>核实限定技术（G203）的条件</strong>：若拟仅凭静态文本替代判定通过，必须严格确认是否同时满足单人讲话、固定背景、无随时间变化的重要视觉信息等全部条件。
- [ ] <strong>记录依据并在相同条件下复检</strong>：将已观察环境（URL、状态、文件版本）与未确认范围分开记录；添加或修改音频描述后，在相同条件下重新测量声音重叠情况与语速时长以完成验证。

## 复用评估提示词的输入准备与输出判定解读

在无障碍巡检中使用评估提示词时，不要只丢给它一个视频文件，而应明确一并提供<strong>输入资料的范围</strong>。将页面内是否存在替代版本链接、播放器音轨列表、视频用途（是否为文本替代）以及分段画面与语音的观察记录结构化地输入，能够有效减少过度推测。

输出的判定结果分为四种状态解读：

* <strong>`pass`</strong>：已确认默认语音包含了全部核心视觉信息，或已验证存在无障碍的音频描述（G78/G173/G226）或符合严格条件的 G203。
* <strong>`fail`</strong>：已确证违规，例如在适用对象视频中遗漏了核心视觉信息、没有替代路径，且在存在适当间隙的情况下仍未提供描述。
* <strong>`not_applicable`</strong>：依据同步媒体定义，明确标示为文本替代且未提供额外视觉信息的情况。
* <strong>`inconclusive`</strong>：即使发现了缺陷候选，但仍存在其他页面的描述版本链接、操作系统音轨设置或完整音频听评等关键核查范围尚未确认，因而无法下定论的状态。此时应补齐缺失的核查项后再重新判定。

## 系列导航与官方出处

* 上一篇：[实时字幕（SC 1.2.4）](/zh/series/accessibility/captions-live)
* 全部目录：[无障碍系列首页](/zh/series/accessibility)
* 下一篇：[预录手语（SC 1.2.6）](/zh/series/accessibility/sign-language-prerecorded)

<strong>官方参考文档</strong>

* [WCAG 2.2 SC 1.2.5 Audio Description (Prerecorded) 规范原文](https://www.w3.org/TR/WCAG22/#audio-description-prerecorded)
* [Understanding SC 1.2.5: Audio Description (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded.html)
* [Understanding SC 1.2.7: Extended Audio Description (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/extended-audio-description-prerecorded.html)
* [G78：提供用户可选择的第二音轨](https://www.w3.org/WAI/WCAG22/Techniques/general/G78)
* [G173：提供包含音频描述的独立版本](https://www.w3.org/WAI/WCAG22/Techniques/general/G173)
* [G226：提供融入音频描述的旁白](https://www.w3.org/WAI/WCAG22/Techniques/general/G226)
* [G203：针对固定背景单人讲话视频的静态文本替代](https://www.w3.org/WAI/WCAG22/Techniques/general/G203)
* [F113：存在对白间隙却遗漏音频描述的失败案例](https://www.w3.org/WAI/WCAG22/Techniques/failures/F113)

<!-- evaluation-prompt -->
