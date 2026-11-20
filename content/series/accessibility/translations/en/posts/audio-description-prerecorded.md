Two alert beeps sound in the video. On screen, a message and a button appear showing that security verification failed and that re-authentication is required. A listener relying on audio alone can hear the error signal, but may miss what failed and how the walkthrough proceeds. Audio description is the method for conveying that on-screen meaning alongside the original audio.

## Criteria for Judging What Audio Alone Misses

WCAG 2.2 <strong>Success Criterion 1.2.5 (Audio Description (Prerecorded), Level AA)</strong> requires audio description to be provided for all prerecorded video content in synchronized media. Conformance for this criterion is determined by the success criterion requirements and the relevant glossary definitions. The accompanying W3C Understanding documents, Sufficient Techniques, and Failures are all non-normative reference materials. In practice, separating this boundary first prevents treating a single unmet technique as an automatic failure, or mistaking one technique for the only valid solution.

The difference between Level A <strong>SC 1.2.3 (Audio Description or Media Alternative)</strong> and Level AA <strong>SC 1.2.5</strong> is clear. Under SC 1.2.3, you may choose either a full text alternative for time-based media—capturing on-screen visuals, dialogue, important sounds, and necessary interactions—or audio description. Under Level AA SC 1.2.5, however, a general text alternative alone is not sufficient. Audio description that conveys visual information through sound becomes the baseline requirement.

That does not mean every video must carry a separate audio description track. If all important on-screen information is already conveyed in the main audio track (dialogue, narration, and sound effects), an additional audio description track is not needed. You must also distinguish the exclusion built into the definition of synchronized media: if a video presents no additional information beyond the body text or its text alternative, and is clearly labeled as a media alternative for text, it is excluded from SC 1.2.5 and the decision is `not_applicable`.

<figure class="learning-figure"><a href="/images/accessibility/audio-description-prerecorded-20261120/en/paths-c44342dead4c.svg" aria-label="Open full-size diagram"><img src="/images/accessibility/audio-description-prerecorded-20261120/en/paths-c44342dead4c.svg" alt="Comparison diagram with three cards. The first card shows SC 1.2.3 Level A allowing a choice between a text alternative or audio description; the second card shows SC 1.2.5 Level AA requiring audio description via paths such as G78 or G173 combined with G226; the third card shows G203 as a limited pass path permitted only when there is a single speaker, fixed background, and no important time-dependent visual information." loading="lazy" /></a><figcaption>Conceptual diagram comparing Level A and Level AA requirements alongside the narrow scope of G203.</figcaption></figure>

## Choosing an Implementation Path: G78, G173, G226, and the Limits of G203

Providing audio description is not locked to a single technical method. Depending on your production workflow and player support, you can consider the following sufficient techniques:

* <strong>G78 (Providing a second, user-selectable, audio track)</strong>: Provide a secondary audio track containing audio description in addition to the main audio, and allow users to enable it through content controls, the media player, or operating system (OS) settings.
* <strong>G173 (Providing a version of a movie with audio descriptions)</strong>: Provide a separate version of the video with audio description mixed in. This version must also be accessible, and if it is hosted on a separate page, verify that a link exists so users can easily find and reach it.
* <strong>G226 (Providing narration that includes audio description)</strong>: Weave key visual information naturally into the main narration starting at the scripting stage. Used in combination with G173, it is recognized as a sufficient technique, and no single technical delivery method is mandated.

One technique that requires caution is <strong>G203 (Using a static text alternative to describe a talking head video)</strong>. G203 is not a way to pass Level AA by attaching a text alternative to a general video. It is a narrowly scoped pass path that applies only when there is a single speaker against a fixed background, no important time-dependent visual information, and static details missing from the audio—such as setting context, speaker name, or credits—are provided in text programmatically associated with the video. G203 cannot be applied to tutorial videos where UI screens or error notices change.

## Dialogue Pauses, Preserving Alert Sounds, and Failure F113

Failure <strong>F113</strong> addresses cases where important visual information appears on screen and suitable unused pauses exist between dialogue, yet no audio description is provided. Evaluating pauses does not rely on a fixed duration threshold (such as requiring at least 2 seconds). Instead, review three factors together:

1. <strong>Pause length and proximity to the scene</strong>: Check whether the available gap is close enough to the visual event and allows the description to be delivered at a comprehensible pace.
2. <strong>Preserving important sounds</strong>: Background music can be lowered in volume (ducking), but audio description must not cover up essential sound effects such as error alert beeps or audio cues indicating an action's result.
3. <strong>Evaluating insufficient pauses</strong>: A lack of dialogue pauses by itself does not automatically determine a Level AA pass or fail. <strong>Extended Audio Description</strong>, which pauses the video to insert descriptions, can also be used as a way to meet Level AA, whereas requiring extended audio description when pauses are insufficient is an additional obligation under Level AAA <strong>SC 1.2.7</strong>.

## Comparing Six Actual Scenes: Recovery Code Walkthrough Video

To apply these principles to an actual screen, six approximate time segments of the common lab's recovery code walkthrough video (`source.mp4`, approx. 31.21 seconds, Korean on-screen text and a single Korean audio stream) were compared against its visuals and main audio. The intervals below are approximate scene divisions rather than precision timecode measurements.

<figure class="learning-figure"><a href="/images/accessibility/audio-description-prerecorded-20261120/en/storyboard-a-aa34bac1a7db.svg" aria-label="Open full-size diagram"><img src="/images/accessibility/audio-description-prerecorded-20261120/en/storyboard-a-aa34bac1a7db.svg" alt="Storyboard listing six actual frames from 0s to 31s of the Korean recovery code walkthrough video in sequence. Displays each scene&#x27;s approximate time, screen stage, whether original audio covers it, and the omission points at the 12–15s failure notice and 20–26s training code notice." loading="lazy" /></a><figcaption>Six actual frames extracted from the original Korean MP4 (original extract) paired with approximate interval summaries of visuals and audio. (1/2)</figcaption></figure>

<figure class="learning-figure"><a href="/images/accessibility/audio-description-prerecorded-20261120/en/storyboard-b-5284866ce125.svg" aria-label="Open full-size diagram"><img src="/images/accessibility/audio-description-prerecorded-20261120/en/storyboard-b-5284866ce125.svg" alt="Storyboard listing six actual frames from 0s to 31s of the Korean recovery code walkthrough video in sequence. Displays each scene&#x27;s approximate time, screen stage, whether original audio covers it, and the omission points at the 12–15s failure notice and 20–26s training code notice." loading="lazy" /></a><figcaption>Six actual frames extracted from the original Korean MP4 (original extract) paired with approximate interval summaries of visuals and audio. (2/2)</figcaption></figure>

| Approx. Interval | Key On-Screen Information (Korean UI) | Main Audio (Original Korean) | Audio Description Review Point |
| :--- | :--- | :--- | :--- |
| <strong>0–6s</strong> | Security settings screen, path (Settings → Security → Recovery codes), “Issue new code” button | "Select Security in Settings," user asks "Can I discard the previous code now?" | Part of the menu path is spoken, but detailed screen structure should be checked |
| <strong>7–11s</strong> | Pre-issuance confirmation dialog, notice not to discard the previous code before saving the new one, '이전 코드 유지' (Keep previous code) button | "No, do not discard it before saving the new recovery code." | Core warning intent is in the audio, but the button label shown in the video's walkthrough screen appears only visually |
| <strong>12–15s</strong> | <strong>'보안 확인 실패'</strong> (Security verification failed) heading, <strong>'보안 확인에 실패했습니다. 다시 인증해 주세요.'</strong> (Security verification failed. Please authenticate again.) text, <strong>'보안 확인 다시 하기'</strong> (Retry security verification) button | Two alert beeps play, followed by no dialogue until 16s | <strong>Primary defect candidate</strong>: Alert beeps alone do not convey the security verification failure state or the re-authentication instruction |
| <strong>16–19s</strong> | Re-authentication complete screen, '발급 확인' (Confirm issuance) button | "After completing security verification again, confirm the issuance." | Re-authentication success and the next step are reflected in the main audio |
| <strong>20–26s</strong> | New recovery code screen, sample training code `R7K2-P9M4`, <strong>'이 화면의 코드는 실제 계정에서 사용할 수 없습니다.'</strong> (The code on this screen cannot be used on a real account.) notice, '코드 저장' (Save code) button | "Save the new code in a safe place. Once a new code is issued, the previous code can no longer be used." | Check whether the <strong>training-only / unusable on a real account</strong> meaning is omitted, rather than reading the entire dummy string |
| <strong>27–31s</strong> | Issuance complete screen, new code saved / previous code unusable status, '설정으로 돌아가기' (Return to settings) button | "Check the issuance complete screen." | Completion status is included in audio, though supplementary UI such as the final return button can be checked |

### What Alert Beeps Alone Do Not Convey: 12–15s Security Verification Failure

The clearest need for audio description in this video occurs at <strong>12–15s</strong>. On screen, the Korean heading for security verification failure appears along with instructions to authenticate again and the '보안 확인 다시 하기' (Retry security verification) button. In the main audio, however, only two alert beeps play, followed by silence with no dialogue until 16 seconds.

While the alert beeps signal that an error occurred, a listener cannot tell what failed or which button the walkthrough indicates for re-authentication. When the dialogue resumes abruptly at 16 seconds with "After completing security verification again," a user who cannot see the screen loses the context between the failure and the retry.

<figure class="learning-figure"><a href="/images/accessibility/audio-description-prerecorded-20261120/en/scene_compare-0e90376ebf3a.svg" aria-label="Open full-size diagram"><img src="/images/accessibility/audio-description-prerecorded-20261120/en/scene_compare-0e90376ebf3a.svg" alt="Three-column comparison diagram paired with the 14s Korean security verification failure frame, showing on-screen information, current audio, and a proposed example. The screen displays the security verification failure heading, re-authentication message, and retry button; the current audio has two alert beeps followed by silence; the proposed example is unproduced draft wording that preserves the beeps and then announces the failure and retry button." loading="lazy" /></a><figcaption>Compares the actual 14s frame (extracted from the original Korean video) and current original audio (observed) side by side with a proposed audio description example that preserves the alert beeps (proposed, not yet produced).</figcaption></figure>

Improving this segment requires two principles. First, the two essential alert beeps in the original audio must be preserved rather than covered by narration. Second, a brief description can be placed in the dialogue pause immediately after the beeps, but before actual recording and audio mixing, you must not assume that "the sentence will definitely fit within 4 seconds." The conceptual diagram below illustrates the relationship between preserving the alert beeps and placing the description in the pause; because the revised audio has not yet been produced or verified, speaking rate and duration must be re-measured during production.

<figure class="learning-figure"><a href="/images/accessibility/audio-description-prerecorded-20261120/en/timing-969db889cc19.svg" aria-label="Open full-size diagram"><img src="/images/accessibility/audio-description-prerecorded-20261120/en/timing-969db889cc19.svg" alt="Timeline conceptual diagram comparing the original track above and the proposed track below. The original plays two alert beeps around 12s followed by a silent pause before dialogue resumes at 16s; the proposed track preserves the two beeps without masking them, places audio description in the pause, and notes that duration must be re-measured so it does not overlap the 16s dialogue." loading="lazy" /></a><figcaption>Conceptual diagram showing description placement in the pause between two alert beeps and the next dialogue. Intervals are approximate and actual speech duration must be re-measured after production.</figcaption></figure>

### 20–26s Segment: Reading a String vs. Conveying Meaning

In the 20–26s segment, the sample training code `R7K2-P9M4` appears alongside the Korean notice stating that "The code on this screen cannot be used on a real account." The main audio explains only the procedure of saving the code in a safe place and does not mention that the on-screen code is a training example unusable on a real account. Here, the goal of audio description is not to mechanically read out all eight characters of the dummy string, but to address the <strong>omission of core meaning</strong>—that the displayed code is a training sample that cannot be used on a real account.

## What Was Confirmed in the Lab and What Remains Unjudged

In real media audits, separating observed facts from the final conformance decision is essential. This record is limited to evidence collected from the initial state (`variant=a`/`base`, `state=initial`) of Common Lab 1.0.2 rendered on a local server.

* <strong>Media file and DOM check</strong>: `source.mp4` (approx. 31.21s) contains a single audio stream. The DOM `<track>` element includes only `captions`, and no link to an audio-described version was found within the observed area.
* <strong>Avoiding technical misjudgments</strong>: The fact that Chromium-based browsers do not expose the `audioTracks` API does not by itself prove that an audio description track is absent. Likewise, successfully playing a video continuously to the end while muted in a browser is not evidence of listening to the audio.
* <strong>Limits of observed scope</strong>: Native audio processing, approximate 1-second interval frame observation, and extraction of 6 representative frames identified visual omission candidates at 12–15s and 20–26s. However, these results do not replace continuous frame-by-frame review, expert listening, or a full production audit. Other states of the live page, links to alternative versions on separate pages, OS-level track selection paths, and revised audio have not yet been reviewed.

Therefore, while candidate defects where important visual information is missing from the main audio can be clearly explained within the current observed scope, the overall final decision (`actual_decision`) for the lab target remains <strong>`inconclusive`</strong> rather than a confirmed failure. Separating confirmed facts (single audio stream, no description link found in the observed area, alert beeps without dialogue at 12–15s) from items requiring further checks (whether an alternative version exists via another path, live environment states) is necessary for an accurate accessibility audit.

<section class="lesson-result"><h3>Exercise findings and scope</h3><p><strong>Overall decision: inconclusive</strong></p><ul><li>Approximately 12–15s: the failure message and reauthentication control are visible; the native-audio observation reports only two beeps.</li><li>Approximately 20–26s: the fictional-code and unusable-in-real-accounts notice is visible but absent from the reported original speech.</li></ul><p>Limited to the current-checkout exercise initial state, original-audio processing, roughly one-second video samples and representative decoded frames. Production pages, other states, OS selection routes and corrected audio remain unreviewed. Three independent reviews of this evidence also remained inconclusive; these were not three original-audio listening runs.</p></section>

## Inspecting the Common Lab Target

The embedded lab below links to the live path where readers can inspect the player and video directly. Because the DOM and frame observation evidence recorded in this article was collected from the initial state (`variant=a`/`base`, `state=initial`) of the lab environment, check whether the screen layout and track state match when you inspect it. Both the original audio and the on-screen text in the video are in Korean.

<iframe src="/labs/accessibility/common/target?lang=en&variant=a&state=initial#lab-recorded-video" title="Common Lab: Recovery code walkthrough video for checking audio description" loading="lazy" style="width:100%;min-height:720px;border:1px solid #888;"></iframe>

[Open Common Lab](/labs/accessibility/common/target?lang=en&variant=a&state=initial#lab-recorded-video)

## Practical Inspection Checklist

Use the following items when reviewing prerecorded video for SC 1.2.5 conformance. Checking an item indicates that the review step was performed; record whether the criterion is met separately.

- [ ] <strong>Gather input materials</strong>: Prepare the original video file (or stream), main audio track, caption file, and the full DOM and surrounding link information of the page containing the video.
- [ ] <strong>Check for definitional exclusion</strong>: Verify whether the video provides no additional information beyond the page text or its text alternative and is clearly labeled as a media alternative for text, to determine `not_applicable` first.
- [ ] <strong>Compare original audio against visuals</strong>: Compare key scene transitions, error messages, button and state changes, and notices segment by segment to see whether they are already conveyed in the main audio.
- [ ] <strong>Verify alternative activation paths</strong>: Check whether a path exists for users to actually enable or reach audio description, such as G78 (player, content, or OS track selection) or G173 (link to and accessibility of a separate version).
- [ ] <strong>Evaluate the relevance of description content</strong>: Confirm that descriptions convey meaning essential for understanding the next step or warnings, rather than decorative details or meaningless character strings.
- [ ] <strong>Check dialogue pauses and sound preservation</strong>: Review pause length and scene proximity, and confirm that essential sound effects such as alert beeps are not masked (background music may be lowered). Do not apply a fixed second-based threshold.
- [ ] <strong>Verify conditions for the limited technique (G203)</strong>: If attempting to pass with a static text alternative alone, strictly confirm that all conditions are met: single speaker, fixed background, and no important time-dependent visual information.
- [ ] <strong>Record evidence and retest under the same conditions</strong>: Document the observed environment (URL, state, file version) separately from unreviewed scope, and after adding or revising audio description, re-measure audio overlap and speech duration under the same conditions.

## Preparing Inputs and Reading Decisions for the Reusable Evaluation Prompt

When using an evaluation prompt for accessibility checks, do not submit only the video file; clearly provide the <strong>scope of input materials</strong> alongside it. Structuring the input with the presence or absence of alternative version links on the page, the player track list, the video's purpose (whether it is a media alternative for text), and segment-by-segment visual and audio observations helps reduce unsupported assumptions.

Read the output decision across four states:

* <strong>`pass`</strong>: All key visual information is already included in the main audio, or an accessible audio description (G78/G173/G226) or strictly verified G203 has been confirmed.
* <strong>`fail`</strong>: A violation is confirmed in an in-scope video—for example, key visual information is missing, no sufficient alternative path exists, and no description is provided despite suitable pauses.
* <strong>`not_applicable`</strong>: The video is clearly labeled as a media alternative for text under the synchronized media definition and adds no new visual information.
* <strong>`inconclusive`</strong>: Even if defect candidates appear, key verification scope remains open—such as links to a described version on another page, OS track settings, or full audio listening—so a definitive ruling cannot be made. Complete the missing checks and re-evaluate.

## Series Navigation and Official References

* Previous: [Captions (Live) (SC 1.2.4)](/en/series/accessibility/captions-live)
* Series index: [Accessibility Series Home](/en/series/accessibility)
* Next: [Sign Language (Prerecorded) (SC 1.2.6)](/en/series/accessibility/sign-language-prerecorded)

<strong>Official Reference Documents</strong>

* [WCAG 2.2 SC 1.2.5 Audio Description (Prerecorded) Normative Specification](https://www.w3.org/TR/WCAG22/#audio-description-prerecorded)
* [Understanding SC 1.2.5: Audio Description (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/audio-description-prerecorded.html)
* [Understanding SC 1.2.7: Extended Audio Description (Prerecorded)](https://www.w3.org/WAI/WCAG22/Understanding/extended-audio-description-prerecorded.html)
* [G78: Providing a second, user-selectable, audio track that includes audio descriptions](https://www.w3.org/WAI/WCAG22/Techniques/general/G78)
* [G173: Providing a version of a movie with audio descriptions](https://www.w3.org/WAI/WCAG22/Techniques/general/G173)
* [G226: Providing audio descriptions by incorporating narration in the soundtrack](https://www.w3.org/WAI/WCAG22/Techniques/general/G226)
* [G203: Using a static text alternative to describe a talking head video](https://www.w3.org/WAI/WCAG22/Techniques/general/G203)
* [F113: Failure of Success Criterion 1.2.5 due to not using available pauses in dialogue to provide audio descriptions of important visual content](https://www.w3.org/WAI/WCAG22/Techniques/failures/F113)

<!-- evaluation-prompt -->
