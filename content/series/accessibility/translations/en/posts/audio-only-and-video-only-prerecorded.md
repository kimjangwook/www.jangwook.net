## People must be able to get the same content without hearing the sound or seeing the screen

Suppose a product support page includes audio instructions and a silent demonstration video. The audio explains what users need to prepare for account recovery, while the video shows the sequence for generating recovery codes through the menus. The page contains only the title “Account Recovery Guide” and a short sentence: “Generate codes in Settings.”

Users who cannot hear the audio miss the prerequisites and precautions. Users who cannot see the screen have difficulty knowing which menu to open and what to check. Giving the play button a name does not solve this problem. A button name tells users which media it plays, but it does not convey the content within that media.

The preceding [article on text alternatives](/en/series/accessibility/non-text-content) covered how to convey the purpose of non-text content. This article looks at ways to provide content that unfolds over time through another path. The criterion is **WCAG 2.2, 1.2.1 Audio-only and Video-only (Prerecorded), Level A**. The educational diagrams and implementation examples are fictional scenarios. The prompt validation later in the article uses actual audio and silent video created as test fixtures, along with their processing records; it does not involve real accounts or recovery codes.

<figure class="learning-figure"><a href="/images/accessibility/audio-only-and-video-only-prerecorded/en/fig-01-b1ec9a594adc.svg"><img src="/images/accessibility/audio-only-and-video-only-prerecorded/en/fig-01-b1ec9a594adc.svg" alt="Beside the audio instruction interface is a complete transcript containing speakers and content. A silent code-generation video shows three screens: Settings, Security, and Generate Recovery Codes. A short summary omits the middle step and completion check, while a step-by-step description conveys the same sequence."></a><figcaption>Figure 01. A title or one-line summary cannot replace the content within media. This fictional support interface compares the additional information that a transcript and a step-by-step description need to convey. <a href="/images/accessibility/audio-only-and-video-only-prerecorded/en/fig-01-b1ec9a594adc.svg">View the original diagram</a></figcaption></figure>

## First, distinguish audio-only from video-only content

To apply the requirements of 1.2.1, first establish what you are examining. Deciding based only on an HTML tag name or file extension can lead to applying a criterion that does not match the actual content.

| Content identified | Alternative to review under 1.2.1 | Distinction from other criteria |
| --- | --- | --- |
| Prerecorded audio-only content | An alternative for time-based media that conveys the same information. In practice, this can be implemented as a transcript. | This is not a criterion that requires only captions synchronized with the audio on screen. |
| Prerecorded video-only content | An alternative for time-based media **or** an audio track that conveys the same information | A text description of the visual information or an audio description may be chosen. |
| Prerecorded media containing both video and audio | This does not fall within this criterion's audio-only or video-only classifications. | Review applicable criteria separately, such as 1.2.2 Captions (Prerecorded) and 1.2.3 Audio Description or Media Alternative (Prerecorded). |
| Audio or video conveying actual events in real time | Outside the scope of 1.2.1, which addresses prerecorded media | Check the applicability conditions of criteria such as 1.2.4 Captions (Live) and 1.2.9 Audio-only (Live). |

The table above is a guide to selecting the criterion to evaluate. A conclusion that some content is outside the scope of 1.2.1 must not be read as a finding that the site meets accessibility requirements. If a live broadcast is saved and made available again, evaluate the replay as prerecorded media.

Muting a video with sound in its player does not make it video-only content. Conversely, an `.mp4` file cannot be assumed to contain both video and meaningful audio merely because of its extension. Check both the original track information and the actual content. Do not declare an audio channel “empty” without listening to it. If audio instructions have a fixed cover image, also examine whether that image conveys separate information on screen.

Animations and sequences of images can also convey visual information over time. Do not exclude them merely because they are short GIFs or play on a loop. What needs to be reviewed depends on whether they are purely decorative or communicate a task sequence or a change in status. For media whose content branches according to user choices, define the scope to include branches and interactions; one playback path cannot be used to evaluate the whole. Distinguish ordinary play and pause buttons from branching within the content itself.

<figure class="learning-figure"><a href="/images/accessibility/audio-only-and-video-only-prerecorded/en/fig-02-70e5dc52b19a.svg"><img src="/images/accessibility/audio-only-and-video-only-prerecorded/en/fig-02-70e5dc52b19a.svg" alt="The evaluation flow checks, in order, whether the media is prerecorded, the original's audio and video composition, and whether it is an alternative to existing text. For audio-only content, compare a text alternative; for video-only content, compare a text alternative or audio description. If materials are unavailable, leave the decision inconclusive; route other media types to the applicable criteria."></a><figcaption>Figure 02. Establish the applicable branch before examining the quality of an alternative. Being out of scope, qualifying for an exception, and having insufficient evidence are different reasons; none automatically means “pass.” <a href="/images/accessibility/audio-only-and-video-only-prerecorded/en/fig-02-70e5dc52b19a.svg">View the original diagram</a></figcaption></figure>

## Audio transcripts include not only speech, but also sounds needed for understanding

When preparing a transcript, the final recording is the authoritative source. Posting a script prepared before recording without changes can omit conditions added by the presenter, questions and answers, or explanations retained after editing. Text produced by automatic speech recognition is also material to check against the original.

The following is a fictional 30-second account recovery guide.

| Information conveyed in the original | Insufficient alternative | Transcript supplemented to serve its purpose |
| --- | --- | --- |
| The presenter says, “You can generate recovery codes only while logged in on an existing device.” | “Generate recovery codes in Settings.” | Presenter: You can generate recovery codes only while logged in on an existing device. |
| A questioner asks, “What happens to the previous codes when I generate new ones?” and a representative answers, “The previous codes can no longer be used.” | Without the question or speakers: “Check the existing codes.” | Questioner: What happens to the previous codes when I generate new ones? Representative: The previous codes can no longer be used. |
| After a confirmation tone, the representative says, “When you hear this sound, generation is complete.” | “Generation is complete.” | [Short confirmation tone] Representative: When you hear this sound, generation is complete. |

The problem in this example is not that there are too few sentences. It is that the login prerequisite, invalidation of previous codes, and cue for recognizing completion have disappeared. Even when wording is made more concise, this information must remain so users can make the same decisions.

If several people speak, distinguish who asks and who answers. Describe laughter or background sounds when they affect understanding. Adding long descriptions to every sound can increase the reading burden, so it is better to first determine what meaning each sound conveys in the original.

Do not set a figure such as “98% transcription accuracy” as a passing threshold. If a missing negative changes “cannot be used” to “can be used,” important information is reversed even when most words are correct. It is useful to include separate editorial checks for accounts, amounts, dates, counts, conditions, and warning text. This is a review method proposed in this article, not a numerical threshold set by WCAG.

Timecodes help readers return to locations in the original and the alternative. However, 1.2.1 does not require timecodes for every sentence. Start with readable paragraphs and speaker identification, then add navigation aids as needed for long or complex recordings.

## Silent video must describe the sequence of actions and their results

A scene opening the Settings menu, a scene selecting an option, and a scene showing a completion message convey different information. A description attached to one representative frame cannot replace all three scenes.

If a fictional video shows the sequence “Settings → Security → Generate Recovery Codes → Save New Codes,” a text alternative can include the following information.

1. Open **Settings** in the account menu.
2. Select **Security** on the Settings screen.
3. Select the **Generate Recovery Codes** button. A notice appears stating that the existing codes will no longer be valid.
4. Save the new codes on the generation-complete screen. Confirm that the completion message and the new-code area appear.

This does not mean disclosing code values or real account information. Use safe example values in educational videos and alternatives, and explain the location and meaning of what actual users can check on their own screens.

The summary “Generate codes in Settings” lacks menu names, the warning about existing codes, and the completion check. Even if a description area exists beneath the video, the information alternative may be insufficient if users cannot obtain this content. W3C's G159 explains how to include important actions, scenes, and expressions from a video in an alternative. F67 shows that even a long description can fail if it does not convey the same information.

<figure class="learning-figure"><a href="/images/accessibility/audio-only-and-video-only-prerecorded/en/fig-03-85d418c578ac.svg"><img src="/images/accessibility/audio-only-and-video-only-prerecorded/en/fig-03-85d418c578ac.svg" alt="Five recovery-code screens are compared. The summary mentions settings and generation but omits the security menu, old-code invalidation warning, safe storage and completion result. The sufficient description conveys each screen’s actions, warnings and results."></a><figcaption>Figure 03. “Generate recovery codes in settings” does not tell you about the warning, safe storage or completion result. Compare the screens on the left with the omissions in the middle and the corresponding descriptions on the right. This is a fictional teaching example, not measured model output. <a href="/images/accessibility/audio-only-and-video-only-prerecorded/en/fig-03-85d418c578ac.svg">Open the original diagram</a></figcaption></figure>

### An audio description is also an option

For video-only media, another option is to provide an audio track conveying the visual information. Rather than a vague description such as “A menu opens,” it should identify the current location, the selected item, and the meaning of the screen change. One implementation to consider is a clear link beside the video, such as “Audio description of the recovery code generation video,” so users can recognize its relationship to the original.

When a sufficient audio alternative is chosen under 1.2.1, a text alternative does not also have to be provided to meet this criterion. The W3C Understanding document also explains that an audio description provided as an alternative to silent video does not require an additional, separate text alternative. However, a text path is useful to users who have difficulty using both sound and visuals, so it may be provided alongside the audio with the service's users in mind. Distinguish this recommendation for additional provision from the minimum requirements of 1.2.1.

## Check the exception conditions for media that reads existing text aloud

If a page already has complete instructions and adds an audio reading to provide that content in another form, the relationship is different. The criterion includes an exception for **media that is an alternative to existing text and is clearly labeled as such**.

Check both conditions together. First, the media must not contain information beyond the existing text. Second, users must be able to recognize that the media is an alternative to the text. A label such as “Audio reading of the instructions below” can explain that relationship.

The mere existence of a blog post on the same topic is not enough. If the text is a summary that omits questions and answers, or if a new warning appears only in the video, the media contains additional information. Simply adding the label “Audio version” cannot eliminate that difference.

Also record which is the original. When a transcript has been added to make audio content understandable, examine the provision of an alternative. When complete text has been provided in another format, examine the exception conditions above. Do not determine this relationship solely from file creation dates; check the role of the content and the correspondence of the actual information.

If the exception is verified, the result can state “Not applicable: media clearly provided as an alternative to existing text,” with the reason. If the original has not yet been opened or the completeness of the text is unknown, the result is “Inconclusive.” An exception is not a label for skipping verification.

## How to connect alternatives on the page

The following is an illustrative implementation example. The file paths are fictional and do not point to deployed materials.

```html
<section aria-labelledby="recovery-audio-title">
  <h2 id="recovery-audio-title">Account recovery audio guide</h2>
  <audio controls src="/media/recovery-guide.mp3"></audio>
  <p><a href="#recovery-transcript">Complete transcript of the account recovery guide</a></p>
  <div id="recovery-transcript">
    <h3>Complete transcript</h3>
    <p>Presenter: You can generate recovery codes only while
      logged in on an existing device.</p>
    <!-- Continue with all speakers, instructions, and necessary sounds, without omissions. -->
  </div>
</section>
```

This code shows only how to connect the alternative. It does not mean that the single paragraph above constitutes a complete transcript. On an actual page, include text matching the entire final recording, and check the player's own name and keyboard behavior under the relevant criteria.

Placing the transcript as text on the same page allows it to be read without playing the media. If it is provided as a separate document, make the link name specific about which content it transcribes, and check the actual body text at the destination. An HTTP 200 response alone is not enough. Also check whether a login prompt or error page is returned, or whether a different version of the document opens.

For video-only materials, the alternative's format can likewise be labeled, for example, “Step-by-step text description” or “Audio description of the video.” If instructions are supplied only as a PDF or image, review whether the document itself is in a readable format. This is an implementation judgment intended to avoid merely changing the format while locking the information away somewhere inaccessible again.

For a service, it is advisable to manage media and its alternatives as a bundle. Linking the media ID, version, duration, alternative document, owner, and last comparison date can help reduce cases where a video is replaced but an outdated description remains. Also preserve the initial publication date separately from the content revision date.

## Provide multimodal AI with the original and the alternative independently

The question to automate for this criterion is not limited to “Is there a transcript link?” An evaluation can be designed to compare which information in the original corresponds to which sentence in the alternative, whether an important negative has been reversed, and whether an on-screen step has disappeared from the description. This evaluation method separates original observation from the alternative's input path and retains the processed scope as evidence. The validation later in this article explains the scope and limitations of applying this structure to actual test materials.

First, create a chronological information inventory from the original. For audio, record speech, speakers, and sounds needed for understanding; for video, record on-screen text, actions, changes, and results. Compare that inventory with the alternative and record corresponding locations and differences. Distinguishing facts verified in the sound or visuals from inferences based on context allows the person making revisions to return to the original and check them.

If a transcript generated by the same AI is copied into both the reference-answer and alternative inputs for comparison, it becomes difficult to detect errors relative to the original. To determine whether the alternative has omitted anything from the original, there must be a path to access the original. If only transcription-tool output is provided, the evaluation can go as far as a “comparison between derived transcripts”; it must not be recorded as a review of the entire audio.

Extracting a few frames from a video makes it possible to compare on-screen text and representative states. However, warnings that appear briefly or intermediate actions between the selected frames may be missed. A clear omission may be found from a subset of frames, but that alone cannot support a conclusion that all information throughout the video has been checked. Record both the processed time ranges and the gaps.

Before execution, also verify whether the model can actually process original audio or continuous video. Attaching a file, reading its metadata, and analyzing its content through to the end are different things. Materials that cannot be processed require connected tools or a separate review. Writing “Listen to it” in a prompt does not create that capability.

<figure class="learning-figure"><a href="/images/accessibility/audio-only-and-video-only-prerecorded/en/fig-04-b1e9dbbe42d9.svg"><img src="/images/accessibility/audio-only-and-video-only-prerecorded/en/fig-04-b1e9dbbe42d9.svg" alt="A time-based information inventory independently extracted from the final media is compared side by side with the alternative document on the actual page. The material IDs and versions from the two paths are linked; omissions and inaccuracies are recorded, revised, and checked again in the same segments. The alternative document is not reused as original observation material."></a><figcaption>Figure 04. An evaluation design that separates observation of the original from review of the alternative. After revisions, recheck not only the changed alternative but also the same original segments and the linked page. <a href="/images/accessibility/audio-only-and-video-only-prerecorded/en/fig-04-b1e9dbbe42d9.svg">View the original diagram</a></figcaption></figure>

### Minimum evaluation materials

| Example material ID | Materials to prepare | What they are intended to verify |
| --- | --- | --- |
| PAGE-01 | Evaluation page and state, media inventory, surrounding descriptions, DOM, and alternative link destinations | Which original each alternative is connected to, and whether it is actually provided |
| MEDIA-01 | Final media, version or hash, full duration, track information, and actually processed ranges | Audio/video type and information in the original |
| ALT-01 | Actual alternative text or audio alternative, and its version | Whether it conveys the same content rather than summarizing other material |
| OBS-01 | Timecodes, speakers, and screen states from observation of the original, tools used, and processing records | Information directly verified in the original and gaps in coverage |
| EXC-01 | Authoritative existing text and wording that identifies its relationship to the media | Whether both conditions are met when an exception is claimed |

This is not a standards requirement to prepare every material in the same format each time. It is a recordkeeping proposal for reproducing evaluations and recognizing missing inputs. Identify missing IDs and ranges first, so that AI does not fill gaps with guesses when necessary materials are unavailable.

## Read the decision and execution status separately

The following are the meanings of the decisions used in this evaluation.

| Decision | Conditions used in this article |
| --- | --- |
| Pass | For an applicable item, the required alternative is actually provided and conveys information equivalent to the entire original that was reviewed. For video-only content, one of the two permitted paths may be sufficient. |
| Fail | Applicability and the scope of the actual alternative have been verified, and evidence confirms that a required alternative is absent or that important information is missing or inaccurate. |
| Not applicable | There is no target media within the evaluation scope, the media is of another type, or the exception for media that is an alternative to existing text has been verified. Record the distinct reason. |
| Inconclusive | The original, alternative, classification, or processed ranges are insufficient to reach a conclusion. State the missing materials and the next checks. |

Execution status is divided into not run, complete, partial, error, and blocked. If the full original could not be processed, execution is partial. If decoding the original file failed, it is an error. If the destination could not be accessed because permission was unavailable, it is blocked. Do not turn these situations into “No alternative” or “Not applicable.”

If one clear failure has been verified, a fail can be recorded for that item. If other ranges remain unreviewed, record both the failure location and the unreviewed ranges. Conversely, do not award a pass to the entire item merely because no problems were found in some ranges. Nor should failure be concluded solely because video-only content lacks a text description. Check whether a sufficient audio alternative is provided.

### Example of transferring a validation result into a revision record

A case in which the transcript of the test audio reverses whether previous codes can be used can be recorded as follows. The original and alternative sentences were rendered in Korean by meaning in the source article; the time locations are utterance ranges from the independent speech recognition record.

```text
Target: M-A / Test recovery guide fixture-v1
Location: 8–19-second range in OBS-A / Two corresponding sentences in ALT-A
Original meaning: Creating new codes makes the previous codes unusable.
                  The previous codes can no longer be used after completion either.
Alternative meaning: The previous codes can be used and can continue to be used.
Difference and impact: Two negative meanings are reversed, leading users to rely on invalid codes.
Verified decision: Fail / Evidence OBS-A, ALT-A
Proposed revision: Restore the condition and negative meanings to match the original.
Retest plan: Compare the same original range, the entire alternative, and the version actually provided.
```

The verified result in this record extends only to the inaccuracy and the fail decision. Revision and retesting are proposals and are not marked as completed work. Evaluators should communicate the location, original, alternative, difference, and user impact, and the person responsible for revisions should be able to use that record to find the problem again.

## Results of evaluating the practice pages with the prompt

The two practice pages below use the same silent video and different text alternatives. K63 describes all five steps; K25 omits the Security screen and the warning and confirmation before creating a new code. Compare the original with each alternative, then inspect the actual prompt results. This is a fictional recovery-code guide with no real accounts or codes.

The original audio is approximately 19 seconds of clear instructions from a single synthetic speaker. Speech recognition was performed separately on the original WAV to check conditions, procedures, negatives, and completion information. Neither the transcript under evaluation nor the production script was entered into the speech recognition tool. The silent video is approximately 20 seconds long and presents five screens in sequence: account settings, security, a pre-generation warning, storage, and completion. All 239 frames were actually decoded and mapped to five groups of identical frames, and the screen content was reviewed using PNGs extracted from each group.

The overview's evaluation planning prompt and this article's criterion-specific prompt were used without changing their instructions; only the actual input fields were filled in. After establishing the expected decisions and required evidence in advance, the following 10 cases were run using **Claude Opus 5.5, high effort**.

The following public page provides a silent video and a sufficient step-by-step description. The text includes the sign-in condition, menu choices, warning, storage and completion information shown on the five screens.

The embedded views are localized teaching views of the source fixtures; they were not evaluated separately. The source pages and alternatives actually evaluated are linked below each view. The recorded results use observations collected from those source pages.

<!-- media-practice-K63 -->

The evaluated K63 source page linked below the view supplied collection records, independent source observations and its text alternative to the overview planning prompt and the criterion prompt. The actual result was <strong>pass</strong>. The output connected the five original screens to steps 1–5 of the alternative, recording equivalent choices and order.

The next public page uses the same video but omits two middle steps from its alternative. It has both a video and a description, yet the Security screen and the warning and confirmation before creating a code are missing.

<!-- media-practice-K25 -->

Using the same prompt with the evaluated K25 source page’s collection records, independent source observations and text alternative produced <strong>fail</strong>. The result identified the missing Security screen in FRAME-2 and the pre-action warning and confirmation in FRAME-3. A working page with an existing description does not establish equivalent information. The table below shows the screen-by-screen correspondence recorded in the actual run.

### Why the same video received different decisions

| Observed original range | Screen information | K63 alternative and actual result | K25 alternative and actual result |
| --- | --- | --- | --- |
| 0–3.9167 s · FRAME-1 | Sign-in condition, Account settings, Open Security | Step 1 corresponds · equivalent | Step 1 corresponds · equivalent |
| 3.9167–7.9167 s · FRAME-2 | Choose Create recovery code in Security | Step 2 corresponds · equivalent | Step absent · missing |
| 7.9167–11.9167 s · FRAME-3 | Warning that a new code invalidates the old one; confirmation | Step 3 corresponds · equivalent | Pre-action warning and confirmation absent · missing |
| 11.9167–15.9167 s · FRAME-4 | Safe storage and storage confirmation | Step 4 corresponds · equivalent | Step 4 corresponds · equivalent |
| 15.9167–19.9167 s · FRAME-5 | Completion, old code unusable, return to settings | Step 5 corresponds · equivalent | Step 5 corresponds · equivalent |

<strong>K63 received pass; K25 received fail.</strong> K25's final sentence also says that the old code is invalid, but the warning and confirmation required before the action are missing. Repeating the same words at the end does not preserve the information and its order. Restore the two omitted steps in their proper places, then compare the whole original and alternative again. This is a recommendation, not a completed correction or retest.

[K63 actual input](/lab-fixtures/media-1.2.1/results/inputs/K63.txt) · [K63 result JSON](/lab-fixtures/media-1.2.1/results/claude-K63-r3.json) · [K25 actual input](/lab-fixtures/media-1.2.1/results/inputs/K25.txt) · [K25 result JSON](/lab-fixtures/media-1.2.1/results/claude-K25-r3.json)

### Results across sufficient, missing, exception and incomplete-evidence cases

| Actual input condition | Verified decision | What was verified in the result |
| --- | --- | --- |
| [K17 · Page body with no target media](/en/labs/accessibility/media-alternatives/K17) | Not applicable | Distinguished static diagrams from time-based media and limited the scope to the article body. [Result](/lab-fixtures/media-1.2.1/results/claude-K17-r3.json) |
| [K42 · Original audio and a sufficient transcript](/en/labs/accessibility/media-alternatives/K42) | Pass | The login condition, steps, invalidation of previous codes, storage, and completion corresponded. [Result](/lab-fixtures/media-1.2.1/results/claude-K42-r3.json) |
| [K08 · Negative meanings reversed in the transcript of the same audio](/en/labs/accessibility/media-alternatives/K08) | Fail | Found the two locations where the usability of previous codes was reversed. [Result](/lab-fixtures/media-1.2.1/results/claude-K08-r3.json) |
| [K63 · Silent video and a sufficient step-by-step description](/en/labs/accessibility/media-alternatives/K63) | Pass | The meaning of the five screens, the selection targets, and their sequence corresponded. [Result](/lab-fixtures/media-1.2.1/results/claude-K63-r3.json) |
| [K25 · Two middle steps removed from the description of the same video](/en/labs/accessibility/media-alternatives/K25) | Fail | Found the omissions of the Security screen and the pre-generation warning and confirmation step. [Result](/lab-fixtures/media-1.2.1/results/claude-K25-r3.json) |
| [K91 · Only a sufficient audio alternative provided for the silent video](/en/labs/accessibility/media-alternatives/K91) | Pass | Did not require additional, separate text. [Result](/lab-fixtures/media-1.2.1/results/claude-K91-r3.json) |
| [K34 · Video provided as an alternative to complete existing text, with the relationship clearly labeled](/en/labs/accessibility/media-alternatives/K34) | Not applicable | Verified both the no-additional-information condition and the labeling condition. [Result](/lab-fixtures/media-1.2.1/results/claude-K34-r3.json) |
| [K56 · Only summary text provided, with an alternative-relationship label added](/en/labs/accessibility/media-alternatives/K56) | Fail | Did not accept the exception based on the label alone. [Result](/lab-fixtures/media-1.2.1/results/claude-K56-r3.json) |
| [K79 · Original file decoding failed](/en/labs/accessibility/media-alternatives/K79) | Inconclusive | Recorded the execution error and did not infer the original from the alternative's content. [Result](/lab-fixtures/media-1.2.1/results/claude-K79-r3.json) |
| [K03 · Only the first and last screens provided, with the middle range missing](/en/labs/accessibility/media-alternatives/K03) | Inconclusive | Did not extend equivalence in some ranges into a pass for the whole. [Result](/lab-fixtures/media-1.2.1/results/claude-K03-r3.json) |

The decisions for all 10 cases matched the reference answers established in advance. **Each of the 10 cases was run a total of 3 times with the same inputs, and the decisions in all 30 runs matched the reference answers.** The overview plan was also run 3 times each for cases with and without media, checking whether it organized the scope, required materials, and unverified status without making an actual evaluation decision. Each repetition forked from prior context that contained no results for this criterion, and the cases were processed sequentially within each fork.

In the audio case with reversed negatives, the original's 8–19-second utterance range was linked to the corresponding sentences in the alternative. In the video case with missing middle steps, screen IDs and their time ranges were recorded. In the partial-input case, even short gaps where the processing ranges in the collection record did not align with the boundaries of the actually supplied frames were recorded as unreviewed. This checked both whether the decisions were correct and whether the record made it possible to find the locations needing revision again.

**These results are validation on a limited set of prepared test fixtures.** The evaluation model did not directly listen to WAV files or play MP4 files continuously. Its inputs were transcripts, PNGs, and processing records independently extracted from the actual files. Results for one clear speaker and five static screens cannot be generalized to all media with noise, overlapping dialogue, important sound effects, or rapid visual changes. If only a few frames are sampled from an arbitrary video, the full-frame verification evidence from this exercise cannot be applied.

This test is a comparison against reference answers prepared during drafting, not a conformance certification by an independent accessibility expert. A model name alone cannot guarantee the same results.

This prompt is structured to compare originals and alternatives with a fixed scope and material pathway. When connecting a new model, tool, or media type, retest normal, omission, exception, and processing-failure cases, and do not include materials that were not actually processed as evidence for a pass.


## Practical checklist

A check mark means that the review was performed. Checking every box does not mean the criterion has been met. Record the decision, evidence IDs, time locations, and unreviewed scope separately for each item.

- [ ] **C01 Applicability**: Checked the media inventory for the page and necessary states, and distinguished prerecorded audio-only, video-only, and other types based on actual content. Media that could not be opened was retained as unreviewed rather than excluded.
- [ ] **C02 Version matching**: Linked the final original's version and full duration to the alternative's version. Did not use a draft script or a different edit as the original.
- [ ] **C03 Audio information**: Checked whether speech, conditions, negatives, speakers, and sounds needed for understanding in applicable audio-only content correspond to the transcript. If no such media exists, recorded the reason.
- [ ] **C04 Video information**: Compared the text, actions, sequence, changes, and results in applicable video-only content with the alternative. If only some frames were reviewed, recorded the gaps in time coverage.
- [ ] **C05 Permitted alternative**: Verified one sufficient text or audio alternative for video-only content. Did not treat both paths as failures merely because text was absent.
- [ ] **C06 Actual provision**: Actually checked the alternative link, body text, or audio file, and checked that an error screen, summary, or different version was not returned instead.
- [ ] **C07 Exception evidence**: If the exception for an alternative to existing text was applied, verified that there was no additional information absent from the text and that the alternative relationship was clearly labeled.
- [ ] **C08 Independent observation**: Did not copy the alternative document into the original observation materials. If relying on derived transcripts or frames, recorded that path and the scope of verification.
- [ ] **C09 Execution record**: Recorded the materials, time ranges, and tools actually processed, along with failures, blocked access, and unreviewed scope. Did not mark materials supplied only as URLs as having been read.
- [ ] **C10 Evidence-based decision**: Distinguished pass, fail, not applicable, and inconclusive, and explained important differences using locations in the original and alternative. Did not present unverified model confidence figures as accuracy.
- [ ] **C11 Revision and retesting**: Recorded a plan to recheck the same original ranges, all remaining content, and the actual delivery page after correcting omissions and inaccuracies.
- [ ] **C12 Scope distinction**: Did not expand this criterion's result into overall WCAG conformance. Captions, player keyboard operation, and accessibility issues in the document itself are managed separately under the relevant criteria.

## Before using the evaluation prompt

The prompt below is for connecting and comparing originals and alternatives. First define the scope using the evaluation planning prompt in the [series overview](/en/series/accessibility/overview), then supply the actual materials needed for this criterion. Do not expect collection, playback, and comparison to be complete merely by entering a URL.

When incorporating the prompt into a team's evaluation process, it is advisable to first compare cases with a complete alternative, a missing important condition, a video with only an audio alternative, the exception for media alternatives to text, and an original that cannot be processed. In particular, check whether an audio alternative is incorrectly failed or insufficient evidence is treated as a pass. Retest the same cases when the model or input path changes.

This article's prompt receives the material inventory, original observations, alternatives, exception claims, and processing errors as separate inputs. Verified ranges are recorded numerically, and if the collection record and the scope of actual content review differ, only their verified intersection is used. The duration of an audio alternative is not mixed into the review coverage of the original video, and gaps remain as grounds for an inconclusive decision.

The following criterion prompt preserves the instructions actually used for these cases. Use the [overview planning prompt](/en/series/accessibility/overview#evaluation-prompt) to define the target and collection scope, then supply actual inputs and independently observed source evidence. The case input files illustrate the required material. A URL alone is insufficient; do not reuse the alternative as an observation of the original. The instructions include evidence recording and branches for pass, fail, exceptions, missing evidence and processing errors. They are the final instructions for the validated scope, not a guarantee of accuracy for every video or whole-site WCAG conformance.

## Continue to the next article

This article distinguished transcripts for audio-only content from text and audio alternatives for video-only content. The next article, **1.2.2 Captions (Prerecorded)**, covers how to deliver dialogue and important sounds at the right playback times when video and audio are combined.

- [Previous: Non-text Content](https://jangwook.net/series/accessibility/non-text-content)
- [Complete learning sequence](https://jangwook.net/series/accessibility)
- [Next: Captions (Prerecorded)](https://jangwook.net/series/accessibility/captions-prerecorded)

## References

- [WCAG 2.2, Success Criterion 1.2.1: Audio-only and Video-only (Prerecorded)](https://www.w3.org/TR/WCAG22/#audio-only-and-video-only-prerecorded) - The authoritative text for the requirements and scope of applicability.
- [W3C Understanding 1.2.1](https://www.w3.org/WAI/WCAG22/Understanding/audio-only-and-video-only-prerecorded.html) - Explanation of applicability conditions, the exception for media alternatives to text, and audio alternatives for video.
- [W3C G158: Providing an alternative for time-based media for audio-only content](https://www.w3.org/WAI/WCAG22/Techniques/general/G158) - Methods for comparing transcripts with final recordings, speakers, and content.
- [W3C G159: Providing an alternative for time-based media for video-only content](https://www.w3.org/WAI/WCAG22/Techniques/general/G159) - How to provide visual information and sequence in text.
- [W3C G166: Providing audio that describes the important video content](https://www.w3.org/WAI/WCAG22/Techniques/general/G166) - Implementation methods for connecting an audio alternative to the original.
- [W3C F67: Long descriptions that do not serve the same purpose or present the same information](https://www.w3.org/WAI/WCAG22/Techniques/failures/F67) - Failure explanation distinguishing the existence of a description from the provision of equivalent information.
- [W3C WAI: Transcripts](https://www.w3.org/WAI/media/av/transcripts/) - Transcript formats, reading structure, navigation, and placement.
- [W3C WAI: Planning Audio and Video Media](https://www.w3.org/WAI/media/av/planning/) - Accessibility requirements by media type and production planning.

Official sources checked on: 2026-10-04. Techniques and Understanding are reference materials for understanding and implementing the criterion; use of any one specific technique is not itself mandatory. The examples, material IDs, comparison tables, and prompt in this article are educational and evaluation designs for applying the requirements.
