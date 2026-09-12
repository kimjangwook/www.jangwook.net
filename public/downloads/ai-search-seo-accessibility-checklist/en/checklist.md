# Checklist

Version: 2026-09-12

Article: [SEO and Accessibility Checks and Answer Verification for AI Search Optimization](https://jangwook.net/en/blog/en/ai-search-seo-accessibility-checklist/)

## Page Inspection Checklist

The following list can be copied into a working document and used for each page. A check mark indicates that the item’s review is complete. Record the result separately as one of “No issue found,” “Fix required,” “Review required,” “Not applicable,” or “Unable to verify,” and retain the supporting evidence. Include a reason for “Not applicable” or “Unable to verify.”

Beside each item, **Automated** identifies work to be checked with scripts or testing tools, **LLM** identifies semantic review using supplied materials, and **Manual** identifies checks of operational intent or on-screen appearance and behavior. Carry out the actual checks using the tools and procedures described earlier. Where multiple methods are listed, examine the scope covered by each. “Priority” is a suggestion for an initial inspection, not a severity level defined by a standard.

### Access and Topic

- [ ] **A1. URL access consistent with intended public availability** (Automated · Manual · Priority)

  Record the final HTTP status, redirects, and authentication and CDN restrictions, and compare them with the intended public availability. Do not treat restrictions imposed by a private-content policy as failures.

- [ ] **A2. Topic alignment between title and main heading** (Automated · LLM · Priority)

  Extract whether the elements exist and their current values, then review whether they describe the same topic. Do not judge them as mismatched simply because they share no words.

- [ ] **A3. A description that accurately captures the main body content** (Automated · LLM)

  Record whether it is missing and its length, then read it to check whether it accurately describes the main body content. Do not use a particular character count as an absolute criterion for search visibility.

- [ ] **A4. canonical, lang, and viewport consistent with page intent** (Automated · Manual)

  Check the preferred URL, actual language, and mobile display settings. The presence of a tag alone does not establish that its value is correct.

- [ ] **A5. Robots meta directives and response headers consistent with the publication policy** (Automated · Manual · Priority)

  Check noindex, nosnippet, max-snippet, and X-Robots-Tag against the publication policy. Do not automatically remove intentionally configured restrictions.

### Structured Data

- [ ] **B1. Structured data selection based on page purpose** (Automated · Manual)

  Record the features needed on the page and the specification adopted. Do not mark every page as failing simply because it lacks JSON-LD.

- [ ] **B2. Valid JSON-LD syntax and fulfillment of the chosen type’s requirements** (Automated · Priority)

  Record parsing results, @context, @type, and the required properties for that type. Mark pages that do not use JSON-LD as not applicable.

- [ ] **B3. Factual consistency between visible content and structured data** (Automated · LLM · Priority)

  Normalize the representations and units of titles, dates, prices, and similar information, then compare the values and sources. Distinguish exact wording matches from factual consistency.

- [ ] **B4. Types and descriptions that reflect the page’s actual purpose** (LLM · Manual)

  Review whether the type and description fit the page’s purpose, and do not arbitrarily add unrelated types or facts that are not visible. Do not conclude that a date was manipulated simply because it is not shown on screen.

- [ ] **B5. Management sources and responsibility for updating duplicated information** (Automated · Manual)

  Record where the information is generated—whether in the CMS, static HTML, or a shared template—and who is responsible for updating it. Do not claim a search penalty merely because information is duplicated across multiple formats.

### Document and Content

- [ ] **C1. Main headings and subheadings that describe the document hierarchy** (Automated · LLM · Priority)

  Check the number of h1 elements, heading levels, and the markup of visual headings. Judge the appropriateness of detected patterns against the context and the team’s authoring rules.

- [ ] **C2. A page purpose that can be understood from the opening content** (LLM · Priority)

  Examine whether the title and first paragraph explain the service, intended audience, and purpose. Do not assume a fixed amount of reading time is needed for understanding.

- [ ] **C3. Relationships in lists, definitions, and data tables expressed in HTML** (Automated · LLM)

  Consider an appropriate list for content enumerated with br, and dl or a table for key-value relationships. Do not force the same tags onto all content.

- [ ] **C4. Understandable table titles and header relationships** (Automated · Manual)

  Check for a caption or equivalent context, and the relationships established through th and scope/headers. For complex tables, review whether associations are appropriate to the structure.

- [ ] **C5. Subjects, units, conditions, and reference dates retained alongside important numbers** (LLM · Priority)

  Select facts about prices, performance, or quantities where a misunderstanding could affect a user’s decision, and check their context. Do not require unnecessary dates for fixed facts with sufficient context.

- [ ] **C6. Dates that machines and people read with the same meaning** (Automated · LLM)

  If time is used, check the validity of its datetime value and compare it with the displayed value. Do not require time for every date.

### Accessibility and Information Delivery

- [ ] **D1. alt appropriate to each image’s role** (Automated · LLM · Priority)

  Check missing alt attributes separately from the quality of descriptions. An empty alt may be appropriate for a decorative image. If the image is not provided, mark the accuracy of its description as unable to verify.

- [ ] **D2. Text that conveys important information in images** (LLM · Manual · Priority)

  Examine whether the figures and relationships in graphs, pricing tables, and informational images can also be understood through text. Compare the on-screen image with its description.

- [ ] **D3. Link and button purposes that are clear in context** (Automated · LLM · Priority)

  Extract phrases such as “here” or “read more” as candidates for review. Do not judge them by wording alone; check the accessible name and surrounding context together.

- [ ] **D4. Keyboard interaction and focus checks for key functionality** (Automated · Manual · Priority)

  Use actual Tab and Enter interactions to check the behavior and focus of menus, forms, and dialogs. Do not award a pass based only on a review of HTML text.

- [ ] **D5. Contrast, form labels, and error messages that support use** (Automated · Manual · Priority)

  Supplement automated accessibility test results with on-screen checks and review of actual interactions. Do not interpret a tool’s passing result as full WCAG conformance.

- [ ] **D6. Main content verified through the target retrieval path** (Automated · LLM · Priority)

  Distinguish initial HTML from the document after rendering, and compare headings, body content, and key facts. Do not treat the use of JavaScript itself as a reason for failure.

### Site Operations

- [ ] **E1. Review of robots.txt policies by service and purpose** (Automated · Manual · Priority)

  Record purposes such as training and search, the target bots, the scope of permission, and the person responsible. Do not try to resolve issues by allowing all bots indiscriminately.

- [ ] **E2. Discovery of key public URLs through sitemaps and internal links** (Automated · Manual)

  Check whether the sitemap contains the intended preferred URLs, and inspect internal links. Do not require all private or duplicate URLs to be included.

- [ ] **E3. Working internal links and assets** (Automated · Manual)

  Compare the directory listing with actual links, and distinguish intentional deletions from false positives. Open images and PDFs directly as well to verify that they work.

- [ ] **E4. Records of rule scope and exceptions** (Automated · Manual)

  Record whether the site is new or already in operation, the inspection version, and the person responsible. For deferred items, include the reason and a review date.

### Extraction Evaluation

- [ ] **F1. Measurement that distinguishes recovered reference facts from omissions** (Automated · LLM · Manual)

  Have a person establish the correct answers, then evaluate with the model, questions, and extraction conditions held constant. Include each fact’s subject, unit, and reference date in scoring.

- [ ] **F2. Checks for generated facts absent from the document** (Automated · LLM · Manual)

  Ask about information not in the document and distinguish unsupported answers from responses that acknowledge the information is unknown. Repeat under identical conditions, and interpret these results separately from actual citation performance.

### A Format for Recording Inspection Results

For items where a problem is found, recording the location, evidence, and next action makes it easier for the person responsible for the fix to check it again. Before recording issues raised by automated tests or an LLM, compare them with the source and actual behavior. The number of checked items alone cannot establish overall accessibility conformance or whether the page is cited in AI search.
```text
Inspection URL:
Inspection date / Reviewer:
Materials inspected: Initial HTML / Rendered DOM / Screen / Response headers, etc.

Item ID:
Result: No issue found / Fix required / Review required / Not applicable / Unable to verify
Location checked and source text or values:
Reason for judgment:
Required changes / Person responsible:
Verification method after changes:
```

## References

- [Google’s guide to generative AI search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google’s guide to AI search features](https://developers.google.com/search/docs/appearance/ai-features)
- [W3C’s guide to page structure](https://www.w3.org/WAI/tutorials/page-structure/)
- [Guide to creating tables](https://www.w3.org/WAI/tutorials/tables/)
- [web.dev’s guide to sites for AI agents](https://web.dev/articles/ai-agent-site-ux)
- [Google’s guide to JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google’s structured data quality guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [W3C’s guide to decorative images](https://www.w3.org/WAI/tutorials/images/decorative/)
- [W3C’s guide to selecting accessibility evaluation tools](https://www.w3.org/WAI/test-evaluate/tools/selecting/)
- [Bing’s introduction to AI Performance](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)
