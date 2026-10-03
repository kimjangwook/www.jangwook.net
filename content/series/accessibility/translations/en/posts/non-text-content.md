## If you use the same photo in three places, should the alternative text be the same?

Think of a jacket photo in an online store. On the product detail page, it shows the jacket’s front and color. In the product listing, selecting the photo takes you to the detail page. On an information page, the same photo appears after text that already describes its color and front features.

The file is the same in all three places, but what users need to do is different. On the detail page, they need to understand the product’s features. In the listing, they need to know where the link goes. On the information page, they should be able to read the description in the body without having to hear the same information again unnecessarily. Saving one alternative text description with the photo file and reusing it everywhere may therefore not be enough.

This article covers WCAG 2.2 **1.1.1 Non-text Content, level A**. The product descriptions, wireframes, and example figures are fictional examples to aid understanding. Later, we also look at results from an actual run that applied the prompt to a published overview page.

<figure class="learning-figure"><a href="/images/accessibility/non-text-content/en/01-context-1a08a50d6144.svg" aria-label="View the full-size original wireframe diagram of image contexts"><img src="/images/accessibility/non-text-content/en/01-context-1a08a50d6144.svg" alt="Comparison of three screen wireframes. On the product detail page, the image conveys color and front features. In the product listing, an image-only link leads to the product details. The information page provides the same features in text, so the redundant image has an empty alternative."/></a><figcaption>Diagram 01. Even when the image file is the same, its role on the page changes. This is a fictional teaching example; an actual evaluation also checks the surrounding content and the names of controls. <a href="/images/accessibility/non-text-content/en/01-context-1a08a50d6144.svg">View the full-size original diagram</a></figcaption></figure>

## 1.1.1 requires a text alternative that serves the same purpose

The criterion requires non-text content presented to users to have a text alternative that serves an equivalent purpose. The scope can include not only photos and icons but also charts, SVGs, and meaningful background images. Reading it as a requirement merely for the presence of a particular HTML attribute makes it easy to miss its scope.

`alt` is a common way to provide an alternative for an HTML `img` element. Text alternatives give users who have difficulty seeing the screen a way to read or hear the information. For a control, its name must also communicate what action it performs. Different rendering technologies, such as SVG or canvas, require different implementations for connecting alternatives.

In practice, it helps to check two things separately. First, is the information or function conveyed by the image expressed in text? Second, is that text actually connected to the element and delivered to users? Even well-written text cannot serve as an alternative if the connection is broken. Conversely, even if an attribute is connected, a filename or an incorrect description does not convey the purpose.

W3C’s Understanding document and image tutorials explain how to make these judgments. Distinguish WCAG requirements from the implementation examples in the explanatory material. The case-by-case procedures below are suggestions for applying them to your team’s work.

## First, determine the image’s job

Imagine briefly hiding the image and looking at what remains. Record what would be lost for users trying to obtain information or complete a task. Do not classify an image as decorative simply because it looks attractive, or describe every visual detail simply because it contains information.

| Use case | What users need to retain | Approach to the alternative |
| --- | --- | --- |
| A photo showing product features | Features needed to distinguish the currently selected product | A brief, context-appropriate description |
| An information banner whose content appears only in the image | The actual wording, including promotion terms and dates | Provide the same information as readable text |
| A link whose only content is an image | The destination and purpose | Convey the purpose through the link’s name |
| An icon-only button | The action it performs | Provide an accessible name for the button |
| A graph, map, or flowchart | Essential information such as values, relationships, directions, and reading order | Connect a brief identifying description to a detailed alternative |
| An image that fully duplicates surrounding text | Preserve the information already provided while reducing repetition | Consider an empty `alt` or similar treatment if it has no other function |

The last row is conditional. A product name beside a photo does not necessarily provide the color or the features needed to distinguish the product. When hiding an image inside a link, also check that the link retains its name.

### Informative images: what must users identify or understand?

Here is an example from a product detail page where users check the color and front design.

```html
<h2>Classic jacket</h2>
<img src="jacket-front.jpg"
     alt="Front of a dark gray jacket with two buttons and flap pockets on both sides">
```

This description conveys features actually visible in the photo. It does not add material, waterproofing performance, or comfort claims that cannot be verified from the photo alone. Even if the product description specifies the material, distinguish what the image shows from facts confirmed through product information.

The alternative can vary with its use. On a color-selection screen, if the color name is adequately provided as text outside the image, there is no need to repeat the same wording automatically. In instructions comparing seam positions, describing differences in the seams may serve the purpose better than describing the color. A long `alt` and a sufficient `alt` are not the same thing.

Review the alternative again when the context changes. If you move the same image into an article and reuse the product-page description unchanged, it may not convey what readers need to understand in the article.

### Decoration and redundancy: an empty alternative is a deliberate omission

If all promotion terms appear in the body text and a background photo only adds atmosphere, you can handle it as follows.

```html
<img src="jacket-decoration.jpg" alt="">
<p>Fall jacket promotion: 10% off selected products through October 15</p>
```

An empty string, `alt=""`, is different from omitting the `alt` attribute altogether. An empty alternative expresses the intention that this image does not need to be read. If the attribute is missing, some screen readers may read the filename or similar information.

However, if the photo in this example contains additional discount terms, check whether those terms also appear in the body text. The decision to hide an image does not follow from its being attractive or small. You need evidence that it has no information to convey, or that the information is adequately provided through another route.

Do not automatically choose an empty alternative just because a caption exists, either. Check whether the caption only credits the source, whether it also provides the image’s essential information, and whether users can access that content. Consider both reducing repetition and avoiding information loss.

## Links and buttons convey the purpose of an action, not just their appearance

A link containing only a product photo needs a name that communicates its destination and purpose.

```html
<a href="/products/classic-jacket">
  <img src="jacket-front.jpg" alt="View classic jacket details">
</a>
```

For this link, the first thing users need to know is which product they will reach, rather than how many pockets the jacket has. If details in the photo itself are essential to a purchasing decision, consider also providing them in the surrounding product description or similar content.

The structure changes if the product name already appears as actual text inside the same link.

```html
<a href="/products/classic-jacket">
  <img src="jacket-front.jpg" alt="">
  <span>View classic jacket details</span>
</a>
```

This example assumes that the link text conveys the purpose and the image contains no additional information. If the image distinguishes a different color among products with the same name, that difference must be provided separately. It is also worth considering whether the image and text can be combined into one link, rather than repeating the same purpose in two separate links.

The same reasoning applies to icon-only buttons. Rather than a description of the magnifying glass’s shape, users need a name that tells them what search it performs.

```html
<!-- Before: assume the button has no other source for its name. -->
<button type="button">
  <img src="search.svg" alt="">
</button>

<!-- After: give the button a purpose and hide the redundant icon description. -->
<button type="button" aria-label="Search products">
  <img src="search.svg" alt="">
</button>
```

<figure class="learning-figure"><img src="/images/accessibility/non-text-content/en/02-button-name-df34764703e8.svg" alt="Before-and-after comparison of the same magnifying-glass button. Before the change, its accessible name is empty. After the change, the button’s aria-label provides the name Search products."/><figcaption>Diagram 02. The on-screen icon is the same, but the name conveying its purpose changes. The names shown are the intended results of the example code; verify the actual implementation in the browser’s accessibility tree.</figcaption></figure>

Other implementations can use the image’s `alt` as the button’s name. Rather than adding several naming methods redundantly, check that one method delivers the intended name. When `aria-label` or similar attributes are set, the computed result may differ from the visible text or image description. Check the final accessible name instead of simply listing strings from the DOM.

The button’s role, state, and keyboard operation are covered further by criteria such as 4.1.2 and 2.1.1. Correcting the name under this criterion does not constitute an evaluation of the button’s overall accessibility.

## A complex graph needs more than a one-sentence alt

Suppose a teaching graph shows 120 inquiries in January, 80 in February, and 160 in March. `alt="Monthly inquiries graph"` identifies what is plotted but does not convey the values or changes. Users who need to compare these values need detailed information.

A short alternative can identify the graph and point to the detailed description. The body text provides the main changes and a data table.

```html
<img src="inquiries.png"
     alt="Inquiries from January to March. Monthly values and trends are in the description and table below.">
<p>Inquiries fell from 120 in January to 80 in February,
   then rose to 160 in March.</p>
<table>
  <caption>Inquiries from January to March, measured in inquiries</caption>
  <tr><th scope="col">Month</th><th scope="col">Inquiries</th></tr>
  <tr><th scope="row">January</th><td>120</td></tr>
  <tr><th scope="row">February</th><td>80</td></tr>
  <tr><th scope="row">March</th><td>160</td></tr>
</table>
```

<figure class="learning-figure"><img src="/images/accessibility/non-text-content/en/03-chart-alternative-5d6f28a69444.svg" alt="A teaching graph of inquiries and its alternative. The graph and table both provide 120 inquiries for January, 80 for February, and 160 for March. A sentence explains the decrease in February followed by an increase in March."/><figcaption>Diagram 03. Instead of reproducing only the graph’s title, provide the values and trends users need to compare. These are fictional data for illustration.</figcaption></figure>

A table is not always the only alternative. For a flowchart, the essential information may be branch conditions and next steps; for a map, locations and routes; for an organization chart, relationships between departments. Assess whether the detailed alternative is sufficient by asking whether users can make the judgments required by the body content without seeing the image.

If values are difficult to read on screen, do not treat AI estimates as confirmed values. Request the source data or clearer material. The existence of a source table is also different from users being able to access it, so check the detailed-description link and where the connection is provided.

## Review formats beyond photos and the criterion’s exceptions

If meaningful information appears only in a CSS background image, inspecting a list of `img[alt]` elements will not find it. Instructions that appear only inside an image must be compared with the DOM text. Consider whether wording users need to read can be provided as actual text, and check whether wording presented as an image has an alternative. Adding `alt` does not also resolve the separate requirements for images of text under 1.4.5.

An SVG that contains information must have an alternative that is actually connected to that information. If an SVG inside an icon button is hidden as decorative, the button itself must retain its name. A clear screenshot is not enough for a chart drawn on canvas; check for usable alternatives such as text descriptions and data. Here, too, do not pass an element merely because one particular attribute has been added.

1.1.1 includes the following situation-specific requirements. Do not interpret the existence of exceptions as permission to omit all alternatives.

| Situation | What to check under 1.1.1 |
| --- | --- |
| Time-based media | At least a description identifying the content. Review detailed requirements such as captions and audio descriptions additionally under 1.2 |
| A test or exercise that would be invalid if presented in text | A description identifying the content. Verify that presenting it in text would actually undermine the test’s purpose |
| Content primarily intended to create a specific sensory experience | At least an identifying description. Do not use this condition to hide ordinary informative images |
| CAPTCHA | An alternative explaining the human-verification purpose, plus alternative forms using different sensory modalities. This does not mean revealing the answer is the alternative |
| Pure decoration, visual formatting, or content not presented to users | Implement it so that assistive technology can ignore it |

Content not visible on screen may still be presented to users in another way or appear in states such as an open menu. Do not apply the exception for content not presented to users based only on a single screenshot with everything closed. Record the state and user path being evaluated.

## Give multimodal AI images, code, and context tied to the same target

Checking for the presence of alternative text and evaluating its meaning are different tasks. Determining whether discount wording in an image is missing from its alternative, whether a photo description fits a link’s purpose, or whether a detailed table conveys the same content as a graph requires comparing the image and its context. You can design an evaluation that uses a multimodal model for this comparison.

In this design, evaluating whether the current alternative is sufficient for the user’s purpose comes before generating a description from the image alone. Review meaning that automated rule-based tools cannot check, while connecting the model’s responses to records of actual observation and interaction. The application example later in this article checks decisions and evidence using actual page materials and control conditions.

<figure class="learning-figure"><img src="/images/accessibility/non-text-content/en/04-evidence-flow-9845e0173737.svg" alt="An evaluation flow that connects an image, DOM, accessibility tree, and page context by element ID, then proceeds through semantic comparison, an evidence-based decision, improvement, and retesting in the same state."/><figcaption>Diagram 04. Inputs must be connected to the same element and state for comparison results to be verifiable. This is a proposed evaluation design, not a service implementing the entire flow or the results of an experiment.</figcaption></figure>

Prepare evaluation materials as follows.

1. **Page and task**: Record the URL, language, user goal, and states to check. Treat the product listing and detail page as separate states.
2. **Visual materials**: Provide a full-page screenshot, enlarged views of the target image, and the original image or graph data. Make both the overall context and the details available.
3. **DOM**: Include not just the target element, but also its parent link or button, surrounding text, and elements referenced for its name and description. The coverage needs to allow checks for missing images, `aria-label`, and similar information.
4. **Accessibility materials**: Collect the role, final computed name and description, and hidden status. Distinguish the name expected from the DOM from the result exposed by the browser.
5. **State mapping**: Attach element IDs, collection times, viewport and login conditions, and similar details. Mixing screenshots and DOM from different states misaligns the evidence for a decision.

For example, if `E03` is the ID of the product search button, you can connect `E03-screen` to its screen view, `E03-dom` to its code, `E03-ax` to its accessibility tree, and `E03-action` to a record of its actual behavior. Do not assume that writing a file path means the model has read the file. Attach the file or provide the results from a tool that reads it.

The judgments you can make also depend on the inputs. With only a screenshot, you can identify visual information and potential issues, but it is difficult to verify actual names or hiding behavior. With only the DOM, you can inspect attributes but have difficulty identifying information omitted from a photo’s alternative. If an agent with tools can collect additional materials, it can expand the evaluation scope with observational evidence. Insufficient input need not be treated as a permanent limitation of AI capability.

### Request AI results as records that support correction

If the model only answers “Appropriate,” the person responsible for the fix will have difficulty checking the basis for that judgment. Request the current alternative, the reason for the role classification, missing information, actual evidence IDs, user impact, proposed fixes, and retest methods together.

Separate the decision from the execution status as well. If materials have not arrived, the status is **not run**; if image downloading or a browser tool fails, it is an **execution error**. Even after the materials have been read, leave the decision **inconclusive** if there is insufficient evidence to determine intent or context. For fully observed targets, distinguish **pass and fail**. If the target is outside the scope, record it as **not applicable** with the reason.

A result showing that a decorative image is correctly hidden confirms the relevant implementation. Automatically marking it not applicable makes it impossible to tell whether the required hiding behavior was checked. Avoid both errors: passing an image solely because its `alt` is empty, and treating an empty `alt` as a violation simply because it is empty.

For images whose classification is unclear, you can request the author’s intended use as additional evidence. However, there is no need to make handing every conclusion back to a person the default procedure. Evaluate items that can be judged from sufficient context and observations, provide the evidence, and clearly identify only what is missing.

## We applied two prompts to the overview page

We evaluated the diagrams and links to their originals on the published [Web Accessibility Overview](https://jangwook.net/series/accessibility/overview) using **GPT-6.1 Sol**. The evaluation-planning prompt from the first installment organized the scope and required evidence, and this article’s 1.1.1 prompt compared the images’ meaning with their current alternatives. We used the prompt instructions unchanged and filled the input fields with actual page materials.

The supplied materials included screenshots of each diagram, rendered images of the originals, the DOM of the relevant elements and parent links, the browser accessibility tree, and the body text and captions. The initial questions concerned the relationships, sequences, and comparisons conveyed by the 4 diagrams in the body, and the names of the links to their originals. We distinguished the actual DOM’s functionality from the fictional sign-up and delivery-tracking UI drawn in the diagrams, so that the latter would not be treated as having been operated.

| Stage | Results checked |
| --- | --- |
| First-installment prompt — evaluation planning | Organized the reading task’s start and completion conditions, included and excluded scope, available materials and additional evidence needed, and the sequence of review, correction, and reevaluation. |
| Second-installment prompt — criterion decision | Compared the actual images and the meaning of their alternatives, recording the images’ own names separately from their parent links’ names. Each decision included evidence IDs and a retest method under the same conditions. |

We repeated the same input to check the final prompt’s decisions, role classifications, and computed names.

| Diagram | Essential information compared with the alternative | Results across 3 repetitions |
| --- | --- | --- |
| WCAG structure | The relationship of principles → guidelines → success criteria, and the cumulative nature of A, AA, and AAA | Pass in all runs |
| Sign-up states | The sequence of input → terms → error → correction → completion, and observations for each state | Pass in all runs |
| Image context | The difference between decorative A and functional B, and the purpose of the actual link to the original | Pass in all runs |
| Evidence flow | Collection, review, decision, and retesting; the distinction between insufficient evidence and execution errors | Pass in all runs |

In addition to the normal input, we evaluated local control materials made from the original page. One omitted the materials for the last diagram. Another changed the comparison diagram’s alternative to “Image” and removed the detailed description. We did not modify the published page itself.

| Control condition | Expected judgment | Execution result |
| --- | --- | --- |
| A diagram is listed, but the required evidence is missing | Do not pass a target that could not be checked | Recorded an inconclusive decision and partial execution, and requested the missing materials. |
| No alternative conveys the comparison diagram’s meaning | Distinguish the link’s name from the image’s inadequate alternative | Recorded fail for the image and the scope result. Separately recorded pass for the parent link’s name, which conveyed viewing the original. |

Under these conditions, we checked the **required output structure, per-element evidence connections, decisions, computed names of images and parent links, and consistency across repetitions**. The decisions are limited to 1.1.1 for the diagrams and image links in the body. When evaluating additional behavior or other criteria, prepare the states and evidence needed for those questions separately.

## When broadening the cases, check consistency of judgment rather than one correct sentence

When applying this to your own site, prepare cases suited to its context. The following table provides criteria for selecting additional validation cases.

| Case | Result to check |
| --- | --- |
| An informative image whose actual alternative includes the required product features | Does it avoid inventing omissions? |
| An informative image with only a filename as its alternative | Does it identify the lack of essential information? |
| An image that is purely decorative in context and correctly hidden | Does it avoid falsely flagging the empty alternative as an error? |
| An icon button with an empty alternative and no other name | Does it identify the missing action purpose? |
| The same icon, but with a correctly named button | Does it avoid failing the button based only on the image attribute? |
| A graph whose values differ from the detailed table | Does it identify the mismatch and provide the supporting values? |
| The same photo reused for information, a link, and decoration | Does its judgment change with the context? |
| A blurry graph, missing DOM, or incorrectly matched state materials | Does it request the necessary materials rather than passing on estimated values? |

Have an evaluator who understands the criterion prepare reference answers with supporting evidence, then compare the model’s false positives, missed issues, and inconclusive decisions. Producing one well-written `alt` does not validate the entire evaluation. Also record whether role classifications or decisions vary when the same input is repeated.

Separating runs with screenshots alone, screenshots plus DOM, and screenshots plus DOM and accessibility materials lets you examine how additional inputs contribute to decisions. Record the model version, tools, prompt version, input bundle, execution timestamp, and cost. Do not combine runs with different input conditions into a single accuracy figure.

## Manage images by where they are used, not just by file

A default description stored in a CMS image library can be a starting point. However, it must be possible to review that description according to whether the actual use is informative, a link, or redundant with other text. Set things up so that editors can choose decorative treatment or a context-appropriate alternative, and developers can output that intent as correct code.

Responsibilities can be divided so that product editors check required product features and wording, designers check what the image is intended to convey, and developers check names, descriptions, and hiding behavior. The original author updates descriptions and data for complex charts together. These are suggestions to adapt to each organization’s roles, not a requirement for every team to have the same job structure.

If the same component appears on multiple screens, check samples of its other contexts to see whether its name is conveyed correctly, rather than only changing an attribute in one place. Also check for cases where an image or graph has changed but its old alternative remains. The operational standard is not whether an alternative was entered initially, but whether it continues to match the current screen.

## Practical review checklist

The checks below record that **the review of an item has been completed**. Checking a box does not mean its conditions have been met. Record the decision and evidence separately beside each item.

- [ ] **C01 Scope**: Recorded the page, language, state, and user goal, and created a list of elements actually checked. Did not generalize one state to the entire site.
- [ ] **C02 Target collection**: Checked for meaningful SVGs, canvas content, background images, and text within images, in addition to `img`.
- [ ] **C03 Role**: Distinguished information, function, complex information, decoration, and redundancy through context, and flagged unclear purposes for further confirmation.
- [ ] **C04 Informative alternatives**: Compared whether the alternative conveys the necessary information in the current photo or image. Did not invent performance or material details that are not visible.
- [ ] **C05 Action purpose**: Checked the final accessible names of image links and icon buttons. Did not substitute appearance descriptions for purpose.
- [ ] **C06 Empty alternatives**: Checked the grounds for omitting decorative or redundant images and their hiding behavior. Ensured that the only name for a control did not also disappear.
- [ ] **C07 Complex information**: Checked the connection between the short description and detailed alternative, as well as values, units, relationships, and sequence. Did not estimate unclear values.
- [ ] **C08 Special conditions**: Checked situation-specific requirements for media, tests, sensory experiences, and CAPTCHA. Recorded reasons for conditions not applied.
- [ ] **C09 Matching evidence**: Compared screen, DOM, and accessibility materials for the same element, collection time, and state. Distinguished missing materials from execution errors.
- [ ] **C10 Decision evidence**: Recorded pass, fail, not applicable, or inconclusive separately from execution status. Did not present model guesses as direct observations.
- [ ] **C11 Retesting**: Checked again after the fix using the same user goal and state. Also checked other uses of shared components.
- [ ] **C12 Operations**: Assigned responsibility and review triggers for updating alternatives when images or languages change. Did not mark review complete without actual materials.

A record template can start with `Element ID / Page and state / Role / Current alternative / Decision / Evidence ID / User impact / Fix owner / Proposed fix / Retest result`. This template and the prompt support recording and evaluation; they are not programs that run checks by themselves.

## Before using the evaluation prompt

Add the page and materials to be evaluated to the integrated prompt below. First check whether the model supports image inputs and whether it has tools that actually read files or access a browser. Do not merely enter example names; connect each piece of evidence so that it is included in the actual input.

The prompt below is the **complete version for a 1.1.1 evaluation**. Fill the input fields with actual materials, then compare the returned decisions and evidence with the originals. When evaluating the same page repeatedly, keep the model settings and material bundle unchanged.

## Continue to the next article

This article connected the purpose of non-text content with its alternatives. The next article, **1.2.1 Audio-only and Video-only (Prerecorded)**, covers ways to provide time-based content through another route.

- [Previous: Web Accessibility Overview](https://jangwook.net/series/accessibility/overview)
- [Complete learning sequence](https://jangwook.net/series/accessibility)
- [Next: Audio-only and Video-only (Prerecorded) — currently in preparation](https://jangwook.net/series/accessibility/audio-only-and-video-only-prerecorded)

## References

Official sources checked: 2026-10-03. This article is based on the standards and explanatory materials below. The product and inquiry-count examples, and the AI evaluation and operational procedures, are fictional illustrations or proposals.

- [WCAG 2.2 — Success Criterion 1.1.1 Non-text Content: requirements and situation-specific conditions](https://www.w3.org/TR/WCAG22/#non-text-content)
- [W3C WAI — Understanding Non-text Content: the criterion’s intent and implementation examples](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)
- [W3C WAI — An alt Decision Tree: choosing alternatives by image context](https://www.w3.org/WAI/tutorials/images/decision-tree/)
- [W3C WAI — Informative Images: conveying the meaning of informative images](https://www.w3.org/WAI/tutorials/images/informative/)
- [W3C WAI — Decorative Images: empty alternatives and redundant information](https://www.w3.org/WAI/tutorials/images/decorative/)
- [W3C WAI — Functional Images: conveying the purpose of links and buttons](https://www.w3.org/WAI/tutorials/images/functional/)
- [W3C WAI — Complex Images: connecting detailed descriptions and data](https://www.w3.org/WAI/tutorials/images/complex/)
- [W3C WAI — Images of Text: alternatives for wording within images](https://www.w3.org/WAI/tutorials/images/textual/)
- [W3C — Accessible Name and Description Computation 1.2: how names and descriptions are computed](https://www.w3.org/TR/accname-1.2/)
