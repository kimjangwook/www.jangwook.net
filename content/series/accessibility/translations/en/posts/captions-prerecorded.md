## Captions are not enough if they change the meaning of an instruction

In an account recovery guide video, a user asks, “Can I discard the old codes now?” The guide replies, “No. Do not discard them before saving the new recovery codes.” But the captions display, “Discard them before saving the new recovery codes.” Most of the sentence matches the original, but a user who acts on these captions could lose codes they still need.

This video has a caption file, and text is visible during playback. An automated check could confirm that a caption track exists. Whether users receive the same information, however, is a separate question. A single negation, warning sound, or change in when dialogue appears can alter the meaning of the guidance.

The previous [article on prerecorded audio and silent video](/en/series/accessibility/audio-only-and-video-only-prerecorded) distinguished alternatives for audio-only and video-only content. This article covers **WCAG 2.2 Success Criterion 1.2.2 Captions (Prerecorded), Level A**. This criterion requires the audio in prerecorded synchronized media to be conveyed through captions that users can read while viewing the screen. The recovery code guide is a fictional example created to explain and verify the topics in this article; it does not involve real accounts or codes.

<figure class="learning-figure"><a href="/images/accessibility/captions-prerecorded/en/fig-01-7d1ad7793733.svg"><img src="/images/accessibility/captions-prerecorded/en/fig-01-7d1ad7793733.svg" alt="In the video on the left, the guide's answer heard at 9 seconds can be read in captions at the same moment. On the right, only a full transcript appears below the video, so users must find the current dialogue separately."></a><figcaption>Figure 01. A transcript helps users read the full content, but it does not directly replace the role of captions read alongside the screen during playback. <a href="/images/accessibility/captions-prerecorded/en/fig-01-7d1ad7793733.svg">View the original diagram</a></figcaption></figure>

## First, identify what the captions are for

1.2.2 requires captions for audio in prerecorded synchronized media. Common examples include product guide videos with a presenter's explanation, educational videos with dialogue and sound effects, and recorded interviews. This also includes simple videos in which a presenter and their explanation play together. The relationship between the visuals and audio does not have to be complex for the criterion to apply.

Classification based only on file names or HTML tags can be wrong. A `video` element may actually contain only audio, or a video file may contain only decorative music. Muting the player does not mean the original has no sound. Check the actual audio and visual information, whether the content is prerecorded, and what users need to learn from the sound.

| Actual content | Criterion to review first | What to check |
| --- | --- | --- |
| Prerecorded synchronized media with dialogue or important sounds | 1.2.2 Captions (Prerecorded) | Are captions that make the sound understandable provided alongside the visuals? |
| Prerecorded audio-only content | 1.2.1 | Is an alternative, such as a transcript, available that conveys the same information? |
| Prerecorded video with no actual sound | 1.2.1 | Is there a sufficient alternative for the visual information or an audio track? |
| Live synchronized media | 1.2.4 Captions (Live), Level AA | Are captions provided for the sound currently being broadcast? |
| A recording of a live event made available afterward | 1.2.2 for the recording provided | Has the recording been reviewed separately from how the live broadcast was handled? |

There is no need to mechanically require the same captions for every file simply because it has background music. Determine whether the music is merely decorative or conveys information needed for understanding, such as changes in mood or events. Conversely, a video with important warning sounds must not be treated as silent video simply because it has no dialogue.

## Captions convey important sounds and speakers as well as dialogue

If captions are treated as a speech recognition file with timestamps added, information can be overlooked. Consider which information users would have learned by listening is necessary to understand the scene and the actions.

First, preserve the meaning of the dialogue. Negation, conditions, numbers, sequence, and warnings require particular care. Changing “Once new codes are issued, you cannot use the old codes” to “Once new codes are issued, you can use the old codes” reverses the central meaning. Omitting “after” from “Discard them after saving” also changes the order of operations.

This does not mean every syllable must be copied literally. A sentence that removes repetition or unnecessary wording can convey the same meaning. In this article, shortening “Save the new codes in a safe place. Once new codes are issued, the old codes can no longer be used” to “Save the new codes safely. After new codes are issued, the old codes cannot be used” preserves both pieces of information: saving the codes and invalidating the old ones. Review information and meaning rather than character-by-character match rates.

The speaker is also part of the content. If an off-screen user and guide exchange a question and answer, users who cannot hear the sound need to know who is speaking. This helps prevent them from reading the question as an instruction from the guide or confusing who is giving the answer. However, if the speaker is already clear from the screen and context, there is no need to make repeating a name on every line a universal requirement.

Sound also exists outside dialogue. A warning sound indicating an error, a knock at the door, laughter, or a change in music should be included in captions if it affects the meaning of the scene. Judge in context whether simply naming the sound, such as “[warning sound],” is sufficient. If two warning sounds indicate a failed security check, users need to know that meaning to decide what to do next.

## Can captions be omitted if a full transcript is provided?

Adding a full transcript to an ordinary prerecorded video does not, by itself, remove the caption requirement. While reading the transcript, users must connect it to the step currently shown, identify whose answer is being given, and determine when a warning occurred. A transcript is a useful additional route, but its role differs from synchronized captions.

1.2.2 includes an exception for media that is an alternative for text. This applies **when the media adds no information absent from text already provided, and the media is clearly labeled as an alternative for that text**. Both conditions must be checked together.

For example, suppose the page contains a complete explanation of the steps, questions and answers, and the meaning of the warning, and actually displays “This video is a media alternative for the explanation below.” If the entire video conveys only the same information as that explanation, the exception can be considered. But if only the video states the warning “The old codes can no longer be used,” it adds information absent from the text, even if the label is present.

Do not accept the exception based only on a matching title, a transcript link, or a producer's statement that “the content is the same.” Compare the entire media, the entire associated text, and the label actually visible to users. If one of the two conditions is confirmed not to hold, evaluate the ordinary caption requirement. If the materials needed for comparison are unavailable, neither the exception nor sufficiency can be determined. Record the decision as inconclusive and request the necessary materials.

<figure class="learning-figure"><a href="/images/accessibility/captions-prerecorded/en/fig-02-8a65a3b047ba.svg"><img src="/images/accessibility/captions-prerecorded/en/fig-02-8a65a3b047ba.svg" alt="After checking for dialogue or sounds needed for understanding in prerecorded synchronized media, check whether the media adds no information absent from the text and is clearly labeled as an alternative for that text. If both conditions hold, the exception applies. If either is absent, continue evaluating the ordinary caption requirement. Insufficient evidence is classified as inconclusive."></a><figcaption>Figure 02. A missing exception condition means captions must be evaluated. Do not immediately mark a failure without checking whether captions are actually provided and sufficient. <a href="/images/accessibility/captions-prerecorded/en/fig-02-8a65a3b047ba.svg">View the original diagram</a></figcaption></figure>

## When and where captions appear are also part of the information

If an accurate sentence appears after the video ends, users cannot read it when needed. If no caption appears while the guide answers “Do not discard them,” and the answer appears on the next screen instead, users may mistake it for an instruction about the current step. Also check for dialogue shown out of order and multiple sentences displayed too briefly.

When evaluating timing, record both the original sound interval and the caption display interval. To make a correction possible, connect the difference in seconds to what users need to understand or decide on the screen at that time. Instead of a single line saying “Poor caption synchronization,” it is more useful to record “The designed answer interval is 7.6–11.6 seconds, but the caption appears at 12.6–16.6 seconds, causing users to read the previous answer on the security check result screen.”

Do not generalize this example's 5-second delay into a pass threshold for all videos. Do not add an arbitrary delay in seconds or character count to WCAG 1.2.2 as if it were a fixed requirement. This criterion also does not require a separate numeric pass threshold for reading time. Record the effect of display duration on use as a practical review that explains the relationship between the original and the screen.

The 7.60–11.60-second interval in Figure 03 is the designed interval in which the answer was placed. The actual speech detected through independent transcription of the original is 7.71–11.18 seconds, and the example input below uses those observed values. Do not replace the caption display interval and the observed speech interval with the same numbers in the record.

Review caption placement as well. If captions cover an error message or a button users need to select in the video, important visual information can be lost even while the sound is conveyed. Check long dialogue, small screens, and states where player controls are visible. Record the review of caption delivery separately from reviews of other success criteria, such as keyboard operation of the player.

<figure class="learning-figure"><a href="/images/accessibility/captions-prerecorded/en/fig-03-7a1cd9f570cb.svg"><img src="/images/accessibility/captions-prerecorded/en/fig-03-7a1cd9f570cb.svg" alt="The answer interval, based on the design, and Caption A are aligned at the same position from 7.6 to 11.6 seconds. Caption B is shifted to the right by 5 seconds, from 12.6 to 16.6 seconds, overlapping the security check result and recheck screens."></a><figcaption>Figure 03. The sentence is the same, but Caption B appears on the next screen. Horizontal position represents the difference in display timing; times and labels allow comparison without distinguishing the colors. <a href="/images/accessibility/captions-prerecorded/en/fig-03-7a1cd9f570cb.svg">View the original diagram</a></figcaption></figure>

## Distinguish HTML caption tracks from captions embedded in video

Captions users can turn on and off are called closed captions; captions always embedded in the video image are called open captions. Both methods are permitted under 1.2.2. If sufficient open captions are provided, marking a failure because there is no `<track>` would be an incorrect evaluation.

The following is an example of connecting closed captions to an HTML video. The code illustrates an implementation similar to this article's fictional guide video. Connecting the file alone does not verify actual caption quality.

```html
<video controls preload="metadata" playsinline
       aria-label="복구 코드 발급 안내"
       src="recovery-guide.mp4">
  <track kind="captions" src="recovery-guide.ko.vtt"
         srclang="ko" label="한국어 자막" default>
</video>
```

`kind="captions"` indicates a track that conveys dialogue and necessary sounds. `srclang` and `label` help users identify the language and track. `default` specifies the track to display by default, but browser and user settings can also affect the final display state. Check whether users can select and read it in the actual player.

A WebVTT cue is a block of captions combining start and end times with text. B1, A2, and SFX in this example are IDs used to find the cues again; they differ from Captions A/B, which distinguish the two display conditions in Figure 03. Record the speakers for the question and answer, and the meaningful warning sounds, separately.

```text
WEBVTT

B1
00:00:04.000 --> 00:00:07.000
User: Can I discard the old codes now?

A2
00:00:07.600 --> 00:00:11.600
Guide: No. Do not discard them before saving the new recovery codes.

SFX
00:00:12.200 --> 00:00:15.820
[Two warning sounds indicating a failed security check]
```

The original warning sounds occur twice at 12.20–12.82 seconds, but the caption remains until 15.82 seconds so users can read their meaning. The guide's next dialogue cue, A3, starts at 16.42 seconds; the actual speech start observed in the independent transcript is 16.47 seconds. This example provides reading time while maintaining the relationship with the sound. Mechanically matching every caption to the start and end of the sound is not sufficient by itself.

Even if the network request succeeds and the file syntax is valid, captions may not be selectable or may not appear on screen. Check the track's loaded and displayed state, the cues active at the current time, and the actual screen together. Conversely, if a file processing failure prevents the original from being read, do not turn that error into an accessibility finding that the content is insufficient.

## Apply the two prompts to the practice page

The following page presents a recovery code guide with dialogue between a guide and a user, plus warning sounds indicating a failed security check. The same original is paired with sufficient captions, captions with changed negation, captions missing the warning sounds, and mistimed captions. First, turn off the sound and compare whether the captions alone let you understand the answer to the question and the security check result.

<div class="caption-practice"><iframe src="/labs/accessibility/captions/en/complete.html" title="Recovery code guide practice: video with complete captions" loading="lazy" style="width:100%;height:760px;border:1px solid #deded9;border-radius:8px"></iframe><p><a href="/labs/accessibility/captions/en/complete.html">Open the complete captions practice page</a> · <a href="/labs/accessibility/captions/en/negation.html">Compare captions with changed negation</a> · <a href="/labs/accessibility/captions/en/sound-omitted.html">Compare captions missing the warning sounds</a> · <a href="/labs/accessibility/captions/en/shifted.html">Compare mistimed captions</a> · <a href="/labs/accessibility/captions/en/index.html">View all practice conditions</a></p></div>

Use the prompt in the [web accessibility overview](/en/series/accessibility/overview) first to establish the purpose of use and evaluation scope. In this practice, the scope is evaluating how users understand the guidance, not actually issuing codes for an account. Plan the materials needed to check the original speech and sounds, caption content and display state, and the exception for a media alternative for text. If you have not yet reviewed the original, do not present a plan as an execution result.

The actual overview prompt output distinguished planning from observation as follows. This is an excerpt from the returned plan.

> The `DISPLAY-C01-1~3` images in the materials were mentioned only by ID and were not attached for this condition, so they were not used as observational evidence.
>
> S2 display screens: Actually attach the DISPLAY-C01-1~3 PNGs for this evaluation condition, or collect screens again at the same times.

For the input concerning the public overview article with no target media, the output also identified a conflict: the scope wording pointed to one video, while the actual media inventory was empty. It recorded, “Confirmation is needed as to which is the intended scope.” Rather than claiming to have viewed an image because a material ID existed, or arbitrarily resolving a contradictory scope, the output created subsequent collection and clarification tasks. The keyboard operation and screen reader reviews included in this plan were not completed results.

The 1.2.2 prompt at the end of this article is used to compare collected materials and retain decisions and evidence for corrections. The model received a time-aligned transcript extracted separately from the actual MP4, processing records for the original sound intervals and speaker roles, caption cues and display state read in the browser, and actual screen PNGs. The candidate captions were not copied into the original transcript.

### Record what changed, not just whether captions exist

In the complete captions condition, the dialogue, off-screen speakers, warning sounds, and their meaning corresponded to the original. In the condition missing the warning sounds, the record retained **evidence that no caption corresponded to the original sound at 12.20–12.82 seconds**. The page's sound description helps interpret the meaning of the warning sounds, but it is not a caption that conveys the moment the warning occurs in synchronization with playback.

<figure class="learning-figure"><a href="/images/accessibility/captions-prerecorded/en/fig-04-bed21910baf0.svg"><img src="/images/accessibility/captions-prerecorded/en/fig-04-bed21910baf0.svg" alt="Two warning sounds from 12.20 to 12.82 seconds indicate a failed security check. The left side displays the warning sounds and their meaning during that interval; the right side retains only dialogue, leaving the interval empty."></a><figcaption>Figure 04. Captions that transcribe only dialogue can omit important sound information. The warning sound caption in this practice appears at 12.20–15.82 seconds. The on-screen instruction “Check the result and proceed to the next step” does not, by itself, tell users whether the security check failed. <a href="/images/accessibility/captions-prerecorded/en/fig-04-bed21910baf0.svg">View the original diagram</a></figcaption></figure>

In the changed-negation condition, the record noted **that the instruction in cue A2 had been reversed**. Rather than simply reporting “low accuracy,” it linked the original “Do not discard them before saving” to the caption “Discard them before saving” and explained the risk of users taking the wrong action. The correction was made specific: fix the meaning of that cue and recheck the same interval.

In the mistimed condition, the same A2 sentence was confirmed to appear **at 12.60–16.60 seconds instead of the designed 7.60–11.60-second interval**. Even with the sentence unchanged, users read the previous answer on the security check result and recheck screens, resulting in insufficient timing correspondence.

The following table shows representative results for correct, failing, exception, and insufficient-evidence conditions reviewed with the same prompt. “Pass” is a decision verified within the provided evaluation scope; it does not mean that the video or site conforms to other criteria.

| Condition checked | Decision | Supporting evidence |
| --- | --- | --- |
| Closed captions with all dialogue, speakers, and warning sounds | Pass | Original information, caption cues, and actual display correspond |
| Captions with reversed negation | Fail | A2's condition not to discard the codes becomes the opposite instruction |
| Captions omitting warning sounds | Fail | No cue corresponds to the sounds indicating a failed security check |
| Captions that do not identify necessary off-screen speakers | Fail | No indication allows the question and answer speakers to be identified without sound |
| Captions displayed 5 seconds late | Fail | The screen and time at which users read the captions differ from the original answer |
| Full transcript only | Fail | The ordinary caption requirement applies, and synchronized captions are absent |
| Captions always embedded in the video | Model decision: pass | Necessary information is visible in screens from 9 time points. Exact display start and end times were not measured |
| Condensed captions preserving meaning | Pass | Despite different wording, saving and the condition invalidating the old codes are preserved |
| An alternative for the full text, clearly labeled as such | Not applicable | Both no additional information and clear labeling were verified |
| Full text present, but not labeled as a media alternative | Fail | The labeling condition for the exception is not met, and there are no captions |
| Labeled as a media alternative, but a warning is conveyed only in the original | Fail | Additional information prevents the exception from applying, and there are no captions |
| Original materials supplied for only the first 8 seconds | Inconclusive | Correspondence between the later original content and captions cannot be established |
| Original file cannot be read or processed | Inconclusive | Actual errors are retained; the original is not inferred from caption metadata |
| No target media in the body of the public overview article | Not applicable | No target was found within the scope in which the media inventory for the entire body was checked |

The model returned pass for the open captions condition, but the display materials reviewed were PNGs from 9 time points, and the input did not include exact display start and end times for each caption. This result cannot establish timing correspondence for all captions embedded in the video. Delayed open captions were not tested. In actual use, additionally inspect the frames where each caption appears and disappears, and the screen during that interval. The model reviewing the samples also recorded a line break within a Korean word in a long caption, such as ‘없습니/다.’, and the caption band covering an in-video progress bar. It did not judge these observations as failures, based on evidence that the meaning and warnings were preserved and another progress indicator remained. Readability of line breaks and preservation of progress information are items to recheck separately in the actual display state.

The two insufficient-evidence conditions do not mean that the screen itself is always incomplete. In the first, the original materials supplied to the evaluation model were limited; in the second, the original file could not be loaded. Distinguish the actual practice screen from the model's input conditions to avoid interpreting the results as performance on different materials.

These results were checked with Claude Opus 5.5 High. After fixing the original materials and the two prompts, 14 conditions were reviewed in sequence in each of three new sessions. All 42 model scope decisions matched the predetermined reference answers. This number is a count of agreement in returned decisions, not evidence that unverified aspects, such as open caption display timing, were satisfied. These were not 42 independent runs with a separate session for each condition; conditions within a session could share context from previously processed conditions. The overview prompt was also applied three times each to the practice page and the public overview article without target media, to check whether it planned the evaluation scope and additional evidence.

The reference answers were fixed before execution and were not provided to the evaluation model. They were established during the same material creation and verification process, based on correspondence between the standard and the original, and were not reviewed by an independent accessibility expert. The agreement therefore demonstrates repeated consistency on these materials, not accuracy verified by an external expert or performance on videos in general.

Decision agreement and completeness of output records are also different. Of the 42 outputs, 6 had a recordkeeping warning: they listed an approximately 0.019-second interval at the end of the file as unreviewed while also marking a field indicating complete review. All 6 outputs returned pass. The party collecting the original separately measured that this tail contained no sound information, but this does not mean the evaluation model directly checked that interval. The prompt has no explicit rule for accounting for tiny differences between container duration and actual decoded duration, which can make records ambiguous. This is why unreviewed intervals and processing records, as well as returned decisions, must be checked against the original evidence.

Some outputs also placed caption cue times in fields intended for original speech times. For example, in the independent transcript, the answer corresponding to A2 begins at 7.71 seconds and the guidance corresponding to A3 at 16.47 seconds, but some records used the cue starts of 7.60 and 16.42 seconds. Even if the final decision is the same, this does not mean those values accurately reproduce the original observations. When communicating correction locations, check original speech times and caption display times separately against their source records.

This was not a test in which the evaluation model listened directly to the original or processed continuous video. The tested route compared an independent transcript, sound processing records, caption cues, and PNGs. Correspondence was checked using controlled materials consisting of approximately 31 seconds of synthetic speech, two fixed off-screen speaker roles, and one type of warning sound. Speaker roles were linked to separately recorded segments, correlation records with the original, and role descriptions. No measurements were made for noisy conversations, identification of arbitrary music or sound effects, fast-moving screens, general speaker diarization, or display states across all mobile players. For such content, add actual audio and video processing records, have a person compare important negation, speakers, and sound meanings with the original, and retain any unverified aspects.

## Teams should manage the relationship between caption files and originals

Speech recognition helps create drafts. Automatic transcription, however, can misrecognize negation or miss speakers and the meaning of sounds. Keep the caption creation process linked to the original used for review. If the video changes, recheck timing and omissions as well as caption sentences.

Correction requests should specify original intervals and cues rather than simply asking to “improve all captions.” For example, record: “Change A2's negation to match the original meaning, and recheck whether users reading without hearing the 7.71–11.18-second answer verified in the independent transcript understand that they must not discard the codes.” For an omitted warning sound, specify when it occurs, its meaning, the caption to add, and its display time together.

When storing model results, separate execution status from the accessibility decision. Even if an execution successfully read the materials, sufficiency cannot be determined if the later original content was not checked. Conversely, even if some intervals were not reviewed, a violation can be recorded when a reversed instruction is established in a checked interval. The key is not to fill unreviewed intervals with passes.

## Practical review checklist

- [ ] Record the page state, media inventory, and exclusions for the evaluation.
- [ ] Inspect the actual content and distinguish prerecorded synchronized media from audio-only content, silent video, and live media.
- [ ] Verify both no additional information and clear labeling for the media-alternative-for-text exception.
- [ ] Check necessary speaker changes and important sounds as well as dialogue.
- [ ] Preserve the meaning of negation, conditions, numbers, sequence, and warnings in captions.
- [ ] Do not fail meaning-preserving condensation solely because the characters differ.
- [ ] Actually select and display closed captions, or verify open captions on the actual screen.
- [ ] Connect the original interval, caption display interval, and effect on use.
- [ ] Ensure necessary content can be read with long captions, on small screens, and while controls are visible.
- [ ] Ensure captions do not cover important visual information.
- [ ] Retain limitations of transcripts, tools, and sample screens, along with unreviewed intervals and evidence conflicts.
- [ ] Link corrections and retesting methods to media IDs, times, cues, and evidence.

## Before using the evaluation prompt

Enter the evaluation scope and actual materials in the input section of the integrated prompt below. First check which of audio, video, and images the model can process directly, and whether it has tools to read browsers or files. If tools are unavailable, provide the collected transcripts, screens, and processing records, together with their limitations.

The prompt below is the **completed version for evaluating 1.2.2**. Fill the inputs with actual materials and compare the returned times, cues, and evidence with the original. Checking content omissions, timing differences, exceptions, and insufficient evidence, rather than repeatedly testing only one correct caption set, helps examine decision boundaries. Completing the prompt does not guarantee automated conformance decisions for all media. Even with the verified inputs, full open caption display timing required additional checking, and ambiguity remained in the output's processing interval records. Recheck these limitations first when applying the same conditions to new materials.

### Example of filling in the inputs

The following illustrates the input format needed to locate A2 again in the complete captions practice condition. Material IDs are file names or identifiers assigned in review records; link them so they refer to the same original. This excerpt alone cannot support a pass for the entire video.

```text
Scope: Recovery code guide M1 on the complete captions practice page.
Purpose: Understand the guidance. No actual account code issuance is performed.
Original: M1, prerecorded audio/video, container duration 31.208333 seconds.
  Decoded audio duration 31.189 seconds. The tail interval caused by the duration difference is recorded separately.
Material SOURCE-ASR: Time-aligned transcript extracted from M1 separately from the candidate captions.
  7.71–11.18 seconds / Guide: No. Do not discard them before saving the new recovery codes.
Material DELIVERY-C01: Caption cues and display records actually read in the browser.
  A2 / 7.60–11.60 seconds / Same answer, caption track showing.
Material DISPLAY-C01-1: Actual screen PNG at 9.4 seconds attached separately.
  Entering only the ID on this line does not attach the image.
Limitation: Only A2 is excerpted here. The remaining original, cues, and screens must be provided separately.
```

Calculate and attach the original file's hash from the final file. Include the same original hash, the tools used, and the processed intervals in the extracted transcript. Do not copy the transcript from the candidate captions. Process the original audio separately or write the transcript by listening directly, then compare negation and conditions again. Caption cues can be recorded by checking the `cues` of `video.textTracks` loaded in the actual player, including IDs, start and end times, and text. Seek to the same time to capture a screen PNG, and record the track's display state as well. Do not claim that a few screens establish the full display state.

To ask the model to evaluate the entire scope, provide all dialogue and important sounds, the full cue list, necessary display observations, and unreviewed intervals together. If claiming an exception, also provide the full associated text and the actual label. Output fields such as `direct_audio_review` are model self-reports and must be verified against actual tool execution records; a value of `true` alone does not establish direct listening. If the links from transcripts, cues, and PNGs to the original are unclear, supplement the materials first.

## Continue to the next article

This article examined how to convey sound content and speakers so users can read them alongside the visuals. The next article covers **1.2.3 Audio Description or Media Alternative**, addressing situations where listening to the sound does not reveal information shown only visually.

- [Previous: Prerecorded audio and silent video](https://jangwook.net/series/accessibility/audio-only-and-video-only-prerecorded)
- [Full learning sequence](https://jangwook.net/series/accessibility)
- [Next: Audio description or media alternative](https://jangwook.net/series/accessibility/audio-description-or-media-alternative-prerecorded)

## References

Official resources checked: 2026-10-09. The standard and explanatory documents provide the basis for the requirements. The fictional recovery code screens and controlled tests explain application methods and check the prompt's results.

- [WCAG 2.2 — Success Criterion 1.2.2 Captions (Prerecorded): requirements and exception](https://www.w3.org/TR/WCAG22/#captions-prerecorded)
- [W3C WAI — Understanding Captions (Prerecorded): dialogue, speakers, important sounds, and caption meaning](https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html)
- [W3C WAI — Captions/Subtitles: reviewing automatic captions and distinguishing transcripts from captions](https://www.w3.org/WAI/media/av/captions/)
- [W3C WAI — F8: captions omitting dialogue or important sounds, and meaning-preserving condensation](https://www.w3.org/WAI/WCAG22/Techniques/failures/F8)
- [W3C WAI — F75: failure involving the exception for media with more information than the text](https://www.w3.org/WAI/WCAG22/Techniques/failures/F75)
- [W3C WAI — G93: providing and reviewing open captions](https://www.w3.org/WAI/WCAG22/Techniques/general/G93)
- [W3C WAI — H95: providing captions through the HTML track element](https://www.w3.org/WAI/WCAG22/Techniques/html/H95)
- [WHATWG HTML — the track element and text track processing](https://html.spec.whatwg.org/multipage/media.html#the-track-element)
- [W3C — WebVTT: timing and caption cue format](https://www.w3.org/TR/webvtt1/)
