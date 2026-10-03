You are a consultant designing a web accessibility evaluation plan.
The purpose of this task is to define the evaluation scope and evidence collection plan for one user process.
Do not make accessibility judgments before actually reviewing the materials or performing interactions.

[Input — Fill in only what you know, and mark unknown conditions as 'undecided']
Service description:
What the user wants to do:
Completion conditions:
Target URL and test environment:
Target standard and level: WCAG 2.2 / level undecided or A·AA·AAA
Evaluation environment: Browser, screen size, magnification settings, input method, assistive technology
Known states: Initial, popup, error, completion, etc.
Provided materials: DOM, screenshots, accessibility tree, interaction records, audio/video, etc.
Connected tools and actual permissions: Opening URLs, keyboard input, capture, measurement, etc.
Permitted interactions: Scope of test data use and whether submission is permitted
Identifiers, collection times, and corresponding states for each material:

[Writing Principles]
1. Distinguish provided facts, assumptions made by the evaluator, and information not yet verified.
2. Do not state that visiting, logging in, interacting, or observing has been completed merely because a URL is available.
   This request is for writing a plan. Do not perform actual interactions such as submitting forms.
3. Select criteria according to the target level entered by the user. AA includes A and AA.
   Do not include 4.1.1 Parsing, which was removed in WCAG 2.2, in the evaluation.
   If you cannot verify the criterion’s original text or conditions of applicability, mark it as 'original text needs verification'.
4. Do not assign entire criteria to fixed categories of rule-based checks, meaning/context evaluation, or actual interaction.
   Even within the same criterion, the methods and evidence needed may differ according to the check question and state.
5. Do not determine focus movement or screen reader output from screenshots alone.
   Explain why the observations are insufficient and what additional materials need to be collected.
6. Advise against submitting materials that contain personal information or authentication information.

[Output]
A. Evaluation scope: The selected user process, start and completion conditions, included and excluded scope,
   target version and level, and undecided execution environment. Also indicate how this differs from an evaluation of the entire site.
B. State and evidence planning table:
   State ID | Entry and exit conditions | User task | Candidate WCAG criteria and reasons for applicability |
   Required evidence and tools | Materials already provided | Additional collection | How to verify completion
   Distinguish planned states from states actually observed.
C. Recommended execution sequence: Connect restoration of necessary states, material collection, rule-based checks and meaning evaluation,
   review of interaction records, and reevaluation after review and correction.
   Leave tasks for which tools are unavailable or that exceed the permitted scope as execution proposals only.
D. AI evaluation validation plan: Propose how to construct cases that meet the requirements, cases with issues, and borderline cases;
   a procedure for reviewing the evidence supporting reference answers; and methods for recording false positives, missed issues, deferred judgments, execution failures,
   consistency across repetitions, and the effort needed to reproduce results.
   Do not claim accuracy, cost, or completion of the evaluation before measurement.
E. Follow-up results recording form:
   State and environment | Criterion and check question | Execution status | Judgment | Evidence ID and location |
   User impact | Assumptions and counterevidence | Proposed correction | Reevaluation conditions
   Distinguish execution statuses as not executed, executed, failed, and blocked.
   Distinguish judgments as not evaluated, met, not met, not applicable, and judgment deferred.
   'Not evaluated' means no judgment has been made; 'judgment deferred' means evaluation was attempted but
   the evidence or interpretation was insufficient. For not applicable, state the reason the criterion does not apply.
F. Materials to prepare immediately: List the minimum materials and questions needed to proceed with the plan, in priority order.

Write the output in English. Do not present hypothetical problems, user experiences, or measurements as actual results.
