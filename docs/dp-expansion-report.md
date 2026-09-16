# DP-800 / DP-420 expansion progress

## September 16 read-only DP-420 preview

DP-420 is now accessible through **Preview upcoming outline** on its card and
the refreshable `#/dungeons/dp-420/preview` route. This is an **unscored reference
preview, not an unsealed question bank**. It displays the preserved October 6,
2026 outline: 3 objective areas, 12 skills, 56 subskills, and published future
weight ranges of 40-45%, 30-35% and 20-25%. Native keyboard-accessible
disclosures expose the subskills. Official guide, credential and course links
use the existing safe external-link component.

The announced effective date and the snapshot's actual retrieval timestamp
(`2026-09-14T18:19:19.756Z`) are displayed separately. The October 6 disclaimer
remains visible. The credential's active status is unchanged; the current
objective version is still null and both scored modes remain locked. All
DP-420 candidate, technical-review, adversarial-review, verified, rejected,
manual-review, stale and playable counts remain zero. Reading coverage is not
verified question coverage. Preview navigation has no quiz, storage or credential
selection actions, and does not award scores or record completion.

The existing prospective JSON is imported only by the reference page, never
the gameplay package registry. The optional informational `examUpdateNotice`
field is synchronized into `schemas/credential.schema.json` using
`npm run questions:schemas` and the existing formatter. No question, source
allowlist, rubric, ledger, current map, threshold or completed-history format was
changed. The existing layout, palette, typography and components are reused.

Before implementation, this feature branch fast-forwarded with its local work
preserved to `608d01130dd7af5c50bfce5e0312b8f04fb3076f` (merged PR #10), retaining
the new AI-103 release as well as DP-800, DP-700 and GH-600 beta behavior.
Before final acceptance it incorporated
`57a46824c5b3fbed0c7425f1eb14aa9b1a29a026`, including the AI-200 and joint AI
releases. The overlapping browser-test import was resolved by retaining the
upstream `loadTestDungeonPackage` helper alongside the new preview tests. All
credential packages, review ledgers and existing readiness fields remain
unchanged relative to that latest base.
The fresh guide/credential receipts captured earlier on September 16 still
describe October 6 as upcoming; no additional research or question authoring
was performed for this preview.

### Verified preview after the renewed PR request

**The complete local verification now passes for this read-only preview.**
The earlier failed runs below remain historical evidence, not current failures
and not approvals of DP-420 question content.

| Stock check                                                                                                                    | Final result                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:coverage`                                                                                                        | **761/761 passed**, 40 files; 97.35% statements/lines, 91.83% branches, 99.4% functions under the existing coverage configuration                  |
| `npm run test:e2e`                                                                                                             | **98/98 passed**, desktop/mobile, including all ten DP journeys, accessibility, persistence, answer visibility and actual official-tome navigation |
| `format:check`, `lint`, `typecheck`                                                                                            | Passed                                                                                                                                             |
| `credentials:validate`, `content:validate-all`, `content:status`                                                               | Passed                                                                                                                                             |
| `questions:validate`, `validate:sources`, `questions:duplicates`, `questions:verify`, `questions:coverage`, `questions:report` | Passed                                                                                                                                             |
| Production build                                                                                                               | Passed through the stock browser server's `npm run build`                                                                                          |

The passing coverage run completed at **2026-09-16T14:25:14.5624765Z**; its log
SHA-256 is
`1281e7902c0c69ec4da3f314ea51fcf0c71e0412d888cf6bcff5e3c0be0bf268`.
The passing full browser run completed at **2026-09-16T14:53:54.2607611Z**; its
log SHA-256 is
`19bc254c540c0e7d2525258f2a824c78f3d3016db248b1d342d2817538e7542b`.
Exact command metadata and outputs remain in ignored
`.grounding\dp-420-preview-checks\pr-*-results.json` and `pr-*.log`.

The corrections are limited to test setup and navigation. AI package fixtures
are loaded once through the unchanged real loader, including registry-collision
validation, in ordinary `beforeAll` hooks. Each test receives a `structuredClone`;
a new regression verifies that mutations cannot leak between tests. No
production cache, validator or eligibility check was changed. All original
assertions remain in their original tests.

Browser initial/reload navigation now waits for dynamic application loading
before the existing visible-state assertions. The DP-800 trace identified a
redundant full reload costing about seven seconds at the final return to the
map; that return now uses the actual **Dungeon map** navigation link. The same
score, history, source and cross-dungeon checks remain, and dedicated reload
tests still run. No test time limit, runner default, assertion or axe check was
relaxed. Two targeted eight-case browser runs passed. An intermediate full run
passed 94/98 and exposed the additional startup boundaries before the final
98/98 run; its trace and output are preserved.

A separate read-only review covered these final test-only changes and reported
no remaining high-confidence correctness issue. These passing gates authorize
the scoped preview PR, **not Study/Boss gameplay or a completed DP-420 bank**.
The prospective map, zero-question counts and missing current-map prerequisite
remain unchanged. A pull request is not a deployment.

### Historical development and blocked handoff

Targeted development checks before the final latest-main integration:

- `npm run typecheck`: passed.
- `npm run test -- tests\interface.test.tsx tests\dp-exams.test.ts tests\dungeon-catalog.test.ts tests\dungeon-readiness.test.ts tests\beta-availability.test.tsx --reporter=dot`: **114/114 passed**. Tests exercise the actual complete preview, active-run boundaries and unchanged availability contracts.
- `npm run test:e2e -- dp-exams.spec.ts --grep "DP-420 upcoming preview" --reporter=list`: **2/2 passed**, desktop/mobile. Checks cover keyboard disclosures, all 56 subskills, safe links, no viewport overflow, zero axe violations, direct refresh, an October 6 clock and unchanged seeded saved history/configuration/recent-question data. Seeded history is a storage-test fixture, not production question content.
- The stock browser server's production build and content validation passed.

Initial acceptance attempts on `57a46824c5b3fbed0c7425f1eb14aa9b1a29a026`:

- Stock `format:check`, `lint`, `typecheck`, `credentials:validate` and
  `content:validate-all` passed.
- The first full `npm run test:coverage` attempt passed 757/760 tests; three
  unchanged AI-package cases exceeded the stock five-second timeout. The same
  AI suite passed 13/13 under coverage when run in isolation. One bounded full
  retry passed 755/760 with five AI-package timeouts; all other 39 files and all
  59 interface tests passed. This is **not a passing full unit/coverage gate**.
  No timeout, runner default, assertion or unrelated implementation was changed,
  and no further retry was made before the stopped handoff.
- Stock `npm run test:e2e` passed **93/98** cases. Five unchanged AI, beta and
  hosting cases failed while waiting for visible UI elements; this is **not a
  passing full browser gate**. All ten DP browser cases passed, including the
  six desktop/mobile DP-420 disclaimer, persisted-lock and preview cases.
  The run completed at `2026-09-16T13:51:32.7971313Z`; its log SHA-256 is
  `130c9a46bbcac6d4e90a6dc8c0af8bac24a1e3b79dbc401819fcbe402d0a4c68`.
  No full browser retry or unrelated optimization was attempted before that handoff.
- Exact outputs, timestamps and hashes are retained locally under ignored
  `.grounding\dp-420-preview-checks`. The two full attempts remain distinct
  from the diagnostic result; successful targeted checks do not replace full
  acceptance.

The checkout initially contained CRLF text while the stock formatter expects
LF. The existing formatter normalized 760 tracked files only after each output
was confirmed to differ solely by line endings; the complete Git diff stayed
identical. No Git/formatter configuration or untracked user files were changed.
A 911-byte untracked design-hook cache identifying only this session's edits
was removed, not committed. The stock formatting gate then passed.

At that stopped handoff, the preview remained local and unpublished because
full acceptance was incomplete; no commit, feature push, PR, merge or deployment
had been made. The later successful verification is recorded above.
A separate bounded read-only review covered the notice, preview, route/card,
schema synchronization and browser assertions. Its nullable-weight and
persisted-state findings were corrected; no remaining high-confidence
correctness issue was reported in that scope. This was a preview-code review,
not question-bank approval or a replacement for the failed full gates.

The missing entry/route assertions initially failed as intended. TypeScript then
caught nullable shared-schema weights and a test-only reference to a nonexistent
persisted `active` field; the view now explicitly reports missing weights
without inventing values, and the browser compares actual saved fields. Active
in-memory sessions are covered separately by the interface test. No runner
timeouts, assertions, accessibility requirements or readiness defaults were
weakened. A proposed decorative side border was removed in favor of the
existing restrained typography.

The original roughly 150-verified-question goal is still unmet. Playable
DP-420 requires an independently established complete current official map and
the unchanged independent content-review and coverage gates. The preview is a
useful interim reading experience, not completion of that bank or a deployment.

## September 15 exam-update disclaimer follow-up

After the blocked recheck below, an informational disclaimer was added to the
DP-420 dungeon card, setup and forge at the user's request. It names the
**October 6, 2026** upcoming update, distinguishes it from the unverified current
outline, and links safely to the official study guide. The notice uses the
existing warning presentation and is not a readiness flag or date-triggered
unlock. No questions, objective maps, source approvals or reviews were changed.
Both modes remain locked with zero playable encounters; the request to make the
bank available remains blocked on a verified current map and reviewed content.
Other credentials retain their existing behavior and availability.

Notice validation: the targeted interface, DP integration, catalog, readiness
and beta-availability Vitest suites passed **111/111** tests. `npm run lint`,
`npm run typecheck` and `npm run credentials:validate` passed. Running
`npm run test:e2e -- dp-exams.spec.ts --grep "DP-420 (shows|cannot)" --reporter=list`
passed **4/4** desktop/mobile cases, including safe links, no horizontal
overflow, zero axe violations on the card, persisted configuration and an
October 6 clock that does not unlock gameplay. The stock browser server also
completed the production build and its content validation.

The new notice assertions first reproduced the absent notice. A test-only
unsupported Testing Library option was removed after TypeScript rejected it.
An initial Windows path selector matched no browser tests; the basename
selector above corrected it. An overloaded browser case initially timed out;
the accessibility/screenshot and persisted-configuration journeys were
separated and now wait for application loading without changing runner limits
or dropping assertions. Full-suite results below remain historical, not new
DP-420 acceptance evidence.

## September 15 DP-420 current-map recheck: blocked, no bank delivered

The new DP-420 request reached the first grounding gate, not content delivery.
The bounded official retrieval still did **not establish a complete currently
effective English objective map**. The isolated branch
`anuraagr-dp-420-study-dungeon` started from fetched `origin/main` commit
`2b1015ae9932aeaf14da73b3baa12ca2bd543a54`, which includes merged PR #9.
There are no gameplay, catalog, question, review-ledger, or source-policy changes.

Actual Microsoft Learn MCP fetches on **September 15, 2026**:

| Official source                                                                                                                                                         | Retrieval time (UTC) | Current-map finding                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------- |
| [DP-420 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-420)                                                        | 18:42:51.713Z        | Complete outline only under October 6, 2026; prior change-log rows omit weights and full subskills. |
| [Azure Cosmos DB Developer Specialty credential](https://learn.microsoft.com/en-us/credentials/certifications/azure-cosmos-db-developer-specialty/)                     | 18:42:51.609Z        | Explicitly calls the October 6 update upcoming; July 21 page metadata is not an objective version.  |
| [DP-420T00 course](https://learn.microsoft.com/en-us/training/courses/dp-420t00)                                                                                        | 18:42:51.715Z        | Preparation overview, not a complete dated and weighted blueprint.                                  |
| [Exact guide-linked exam/preparation path](https://learn.microsoft.com/en-us/credentials/certifications/exams/dp-420)                                                   | 18:45:44.987Z        | Returns the same credential body and upcoming-update notice, not another outline.                   |
| [Connect to Azure Cosmos DB for NoSQL with the SDK](https://learn.microsoft.com/en-us/training/paths/connect-to-azure-cosmos-db-sql-api-sdk/)                           | 20:09:05.304Z        | Two-module training overview, without exam weights or an effective objective date.                  |
| [Execute queries and build a Generative AI application with Azure Cosmos DB](https://learn.microsoft.com/en-us/training/paths/execute-queries-azure-cosmos-db-sql-api/) | 20:09:05.152Z        | Three-module training overview, not a complete current exam map.                                    |

One bounded current-outline MCP search at **18:45:45.278Z** returned seven
sections of the same DP-420 guide and three unrelated credential results, which
were excluded. A preparation-link lookup at **20:06:04.447Z** resolved the two
sampled training paths against explicit course HTML UIDs. The credential HTML
references `course.dp-420t00`; course HTML references thirteen training paths.
Only those two path overviews were fetched, not the other eleven paths or their
child modules. No search excerpt or training topic was promoted to exam-map
evidence. This bounded finding does not claim no current official outline exists
elsewhere.

All eight actual MCP responses and two HTML captures remain local under ignored
`.grounding\dp-420-2026-09-15`. The append-only `followUpChecks` entry in
[`dp-420-grounding-status.json`](dp-420-grounding-status.json) preserves exact
queries, URLs, titles, timestamps, MCP receipt hashes, observations and
limitations. It retains the September 14 evidence unchanged, including that
earlier research context's missing raw receipts. Initially missing MCP SDK
dependencies were restored from the lockfile; failed commands were not recorded
as successful retrievals.

**DP-420 counts remain zero:** candidates, technical reviews, adversarial reviews,
verified, rejected, manual-review, stale and playable records. Objective and
subskill coverage, difficulty, complexity and answer-position distributions
cannot be reported for a nonexistent current-mapped bank. Both modes remain
locked with `objectiveVersion: null` and `isVerified: false`. The prospective
October 6 snapshot, completed local history, and all other credentials are
unchanged. The approximately 150-verified target remains unmet; a sealed card is
not a delivered bank.

**Resume prerequisite:** obtain and independently establish a complete, currently
effective English DP-420 outline from the official guide or a permitted exact
guide/credential-linked version or download, with its explicit effective date,
every domain weight range, skills and subskills. Retrieve it through Learn MCP.
Neither training coverage nor the future date arriving automatically establishes
a current map. Only then can grounded authoring and the unchanged independent
technical/adversarial reviews begin.

This follow-up is documentation/evidence only. The receipt-integrity check
matched all eight saved MCP inputs, timestamps and SHA-256 hashes, preserved the
September 14 JSON record, and confirmed that only these two documentation paths
changed. The initial formatting check reported issues; the grounding JSON and
new report section were formatted without reformatting historical report
content. No full-suite formatting, build, unit, browser, content-acceptance or CI
pass is claimed, and no feature push or PR was made for this blocked bank.

The sections below retain the earlier DP-800 release and historical evidence.
Their acceptance results are not September 15 DP-420 validation results.

## Final local acceptance

**All required local gates now pass for the frozen limited DP-800 Study
release: 719/719 stock unit/integration tests and 78/78 stock desktop/mobile
browser tests.** Lint, strict TypeScript, formatting, full coverage,
credential/content/source/attestation checks and the production build also pass.
The content scope remains **39 verified playable questions**, two excluded
manual-review records and 61 deferred candidates; the original approximately
150 verified target is still short by 111. DP-420 content remains deferred.

The startup correction reuses SHA-256 digests only for **identical canonical
content strings**, with a bounded LRU of 2,048 entries and 2,097,152 retained
UTF-16 characters. It does not cache object identity, review verdicts, freshness
or readiness. Every call still derives the current authored payload, so an
in-place question or objective edit changes the key. Oversized payloads are not
retained. Browser profiling found repeated hashing to be the hottest
non-system function (5,847 ms across 16 captured profiles); avoiding repeated
identical work reduces startup validation cost without skipping a gate.

Tests first reproduced two redundant-hashing failures; six new regression
tests cover exact copies, authored mutations, review-only metadata, same-version
objective edits, eviction and oversized inputs. The complete before/after
validation report is **identical across all eight packages and 866 records**,
apart from its generated timestamp. The new code received an independent review
with no significant issues.

The full coverage run initially had five existing AI-package five-second
timeouts. The unchanged affected suite passed in isolation, followed by a
passing stock full-coverage run performed alone. That history is retained;
neither diagnostic success nor the earlier browser failures are erased or
relabeled. No timeouts, assertions, axe coverage or runner defaults were changed.
See [`dp-800-validation-results.json`](dp-800-validation-results.json) for
actual command results and log hashes.

## Frozen scope and historical acceptance blockers

The prioritized deliverable is a **limited DP-800 Study bank**, not completion
of the original approximately 150-question target. New authoring stopped at
**102 unique original question IDs**. The frozen gameplay package contains
**39 verified, playable questions and 2 excluded manual-review records**.
The other **61 candidates are outside the gameplay package**. Their original
snapshots and the actual partial technical/adversarial outputs are committed
under [`authoring-archive`](../src/content/exams/dp-800/authoring-archive/).
Missing reviews are not approvals or rejection verdicts.

The **111-question verified shortfall is the requested delivery-priority
cutoff**, not a claimed lack of official documentation. Study is open; Boss
remains sealed under the unchanged 75-question minimum and quality/breadth
gates. **DP-420 content and further research are deferred**: its null current
objective version and October 6 prospective evidence remain separate, and both
modes stay locked. This contribution does not deliver a DP-420 question bank.

### Frozen content and evidence

| Measure                             | Actual result                                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| DP-800 current objective map        | March 12, 2026; 3 domains, 11 skills, 73 subskills                                                    |
| Verified domain counts              | Design 19; security/optimization/deployment 10; AI 10                                                 |
| Sampled verified coverage           | 3/3 domains, 11/11 skills, 28/73 subskills                                                            |
| Difficulty                          | 10 beginner, 25 intermediate, 4 advanced, 0 expert                                                    |
| Complexity                          | 10 recall, 18 implementation, 7 scenario, 3 troubleshooting, 1 architecture                           |
| Applied reasoning                   | 29/39, 74.36%; Advanced/Expert 4/39, 10.26%                                                           |
| Formats                             | 17 scenario, 13 code, 7 single-select, 1 true/false, 1 multi-select                                   |
| Correct-choice ID occurrences       | a 12, b 9, c 10, d 9; 40 occurrences because one item has two correct choices                         |
| Verified rubric totals              | 44: 4 items; 45: 14; 46: 13; 47: 8; no threshold changes                                              |
| Source registry                     | 76 canonical sources with credential-scoped provenance                                                |
| Latest source retrieval             | 2026-09-15T06:42:29.174Z                                                                              |
| Latest independent final review     | 2026-09-15T15:38:13.797Z                                                                              |
| Online source availability          | All 79 URLs passed at 2026-09-15T16:24:41.831Z: 76 sources plus 3 exactly bound training targets      |
| Cross-bank deterministic duplicates | No warnings or blocking findings against all latest-upstream banks                                    |
| Current manual-review records       | 036: 43/48, weak append construction; 049: 43/48, inflated difficulty and repetitive SQL presentation |

The bank does not meet the desired 15/35/35/15 difficulty mix or mature-bank
weighting/depth goals. Domain coverage is not exhaustive subskill coverage or an
official exam-readiness guarantee. Independent reviewers performed bounded
source and semantic-overlap analysis; deterministic duplicate checks are not
represented as a new semantic model review of the entire corpus.

Earlier reviewed failures remain immutable in `review-history`: two rejected
versions and five manual-review versions subsequently replaced only after fresh
generation and both independent passes. The authoring archive separately retains
the failed doc-to-doc provenance generation, two technical manual-review
outcomes, and the actual technical rejection of malformed DAB configuration
item 056. These are distinct from the current package's two final manual items.
Raw Microsoft Learn article bodies stay local; committed artifacts contain
original questions, paraphrased evidence, exact source metadata and real reviews.

### Latest upstream and parity

The original baseline was `d9a1e39dbc755448f38584ecca692b9e20e35eb6`.
The latest fetched default branch is
**`4d44febf7364122913f280fe6004ff5893e43ff7`**. Its AI-bank and explicit GH-600
beta-access changes are preserved, not overwritten to match the older baseline.
The seven actual merge conflicts were resolved by retaining both source-policy
behaviors and both sets of real evidence.

The integrated ledger has **866 attestations: all 825 upstream records
unchanged plus 41 DP-800 records**. The parity check at
**2026-09-15T17:11:20.453Z** found no additional baseline-record changes
introduced by this work. Upstream itself replaced the 30 original AI-103
attestations during its audited three-pass migration; those changes are not
misreported as a DP-800 regression. The other original 526 attestations remain
unchanged. No existing upstream credential package has a content diff, including
DP-700's 162 playable questions. Scoring, storage keys and completed history
formats are unchanged.

### Actual closeout checks

| Command                                                                                                                                    | Result                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `npm run credentials:validate`                                                                                                             | Passed                                                                                                                |
| `npm run content:validate-all`                                                                                                             | Passed; all eight installed packages and consolidated ledger                                                          |
| `npm run content:status`                                                                                                                   | Passed                                                                                                                |
| `npm run questions:validate -- --exam dp-800`                                                                                              | Passed: 41 records, 39 playable, 2 excluded                                                                           |
| `npm run questions:verify -- --exam dp-800`                                                                                                | Passed exact real attestation bindings                                                                                |
| `npm run sources:validate -- --exam dp-800 --online`                                                                                       | Passed all 79 allowed URLs; not claim review                                                                          |
| `npm run questions:duplicates -- --exam dp-800 --cross-exam dp-700,github-copilot,github-agentic-ai-developer,az-104,sc-200,ai-103,ai-200` | Passed; no cross-exam warning                                                                                         |
| `npm run questions:coverage -- --exam dp-800`                                                                                              | Passed, retaining the gaps above                                                                                      |
| `npm run questions:report -- --exam dp-800 --write`                                                                                        | Passed                                                                                                                |
| Default DP-700 `questions:validate`, `validate:sources`, `questions:verify`                                                                | Passed                                                                                                                |
| `npm run lint`                                                                                                                             | Passed                                                                                                                |
| `npm run typecheck`                                                                                                                        | Passed                                                                                                                |
| `npm run test`                                                                                                                             | 713/713 passed after correcting two new exact-allowlist test fixtures; first merged attempt was 711 passed / 2 failed |
| `npm run test:coverage`                                                                                                                    | Passed                                                                                                                |
| `npm run build`                                                                                                                            | Passed; existing Zod annotation and large-bundle warnings remain                                                      |
| Final independent code review                                                                                                              | No significant issues; question facts were not part of this code review                                               |
| `npm run test:e2e` first post-merge run                                                                                                    | 74 passed / 4 failed                                                                                                  |
| Affected stock-configured browser journeys after the upstream GH-600 setup-locator correction                                              | 8/8 passed                                                                                                            |
| Latest complete `npm run test:e2e`                                                                                                         | **72 passed / 6 failed; acceptance blocked**                                                                          |

The latest six failures are desktop `/about` accessibility, imported beta
study/exam, imported beta raid/immediate, the original challenge journey, the
DP-800 Boss lock, and the DP-420 lock journey. Their snapshots show the
application startup status instead of ready content within the existing
five-second assertions. All traces and exact logs are retained locally. This is
not claimed to be purely environmental: some App requests remained incomplete
at the deadline, while others completed and initialization was still pending.

An instrumented earlier run of the existing harness passed 6/6 and recorded 57
HTTP requests; its slowest App response took 1,514 ms. Post-merge profiling of the
exact 17.1 MB App bundle in four two-context starts measured ready times of
2,651-2,910 ms. Those bounded diagnostics did not reproduce the failing delay
and do not establish full-suite readiness. No speculative startup rewrite,
timeout increase, skipped assertion, reduced axe coverage or runner-default
change was used. The actual GH map-to-setup strict-locator races were corrected
with route waits and setup-form scoping, including the newly merged beta entry.

At this historical checkpoint, remote delivery was blocked by full-browser
acceptance. The final local acceptance section above records the later green
result. No deployment or merge to main is authorized. The baseline failures and
intermediate results below remain part of the audit trail.

## Historical verified Study checkpoint, September 15, 2026

**DP-800 Study is genuinely open with 27 verified original questions. Target
expansion and final delivery are still in progress; nothing has been pushed.**
The current records all completed distinct generation, technical and adversarial
contexts, including independent option countercontexts and a twelve-dimension
rubric of at least 44/48 with unchanged critical gates. The effective objective
map remains **March 12, 2026**, not the retrieval or review date.

| Exam   | Current records | Verified/playable | Candidate/rejected/manual/stale | Study  | Boss                  | Target shortfall |
| ------ | --------------: | ----------------: | ------------------------------- | ------ | --------------------- | ---------------: |
| DP-800 |              27 |                27 | 0 / 0 / 0 / 0                   | Open   | Locked: fewer than 75 |              123 |
| DP-420 |               0 |                 0 | 0 / 0 / 0 / 0                   | Locked | Locked                |              150 |

DP-420's complete currently effective objective map is still unestablished from
the allowed official evidence. Its current identity remains Azure Cosmos DB
Developer Specialty. The October 6, 2026 outline remains prospective, outside
gameplay; sealed-state tests are not a delivered DP-420 bank.

The reviewed DP-800 cohort covers **3/3 domains, 11/11 skills and 25/73
subskills**, with domain counts **10 / 10 / 7**. Published domain weight ranges
remain 35-40%, 35-40%, 25-30%. Difficulty is **8 beginner, 15 intermediate,
4 advanced, 0 expert**. Complexity is **8 recall, 11 implementation, 7 scenario,
1 troubleshooting**: 19/27, or **70.37%**, are non-recall; no Expert labels were
invented. There are 14 scenario, 7 single-select, 4 code, 1 true/false and
1 multi-select items. Stored correct-choice ID occurrences are **a: 8, b: 7,
c: 7, d: 6** (28 occurrences because one item has two correct choices).
Gameplay shuffling preserves choice IDs and answer mappings.

Only four distinct Advanced questions currently qualify. The existing selector
honestly caps a five-question Advanced request to four and displays that cap.
The real browser journey verifies the actual planned, answered, completed and
objective-scored count, not a fixture bank or a weakened 25-item Study threshold.

The package currently contains **57 canonical sources** with finite
guide/training provenance and actual MCP retrieval receipts. The latest source
retrieval is **2026-09-14T23:41:04.566Z**. Current independent final reviews span
**2026-09-15T02:12:36.732Z to 2026-09-15T04:27:57.227Z**. The most recent full
online check covered all **57 canonical sources plus 3 recorded training
targets** at **2026-09-15T05:28:02.294Z**. Availability alone is not factual
verification, and new candidate-only sources do not inherit this result.

### New candidate-only expansion

There are now **52 unique originally authored question IDs**, with **25 new
candidates outside gameplay**: 11 JSON questions in immutable `batch-04r1`
(generated **2026-09-15T06:30:44.841Z**) and 14 model, vector and chunking
questions in `batch-05` (generated **2026-09-15T06:57:02.666Z**). Their actual
MCP receipts are preserved locally. Both snapshots pass the unchanged source
graph/schema check; neither has a claimed independent approval yet.

The first `batch-04` snapshot failed the strict prohibition on immediate
doc-to-doc ancestry and remains excluded. The replacement records actual direct
named-function references in training, including the separate JSON-column unit's
explicit use of JSON_MODIFY. It does not invent URL links in the training or
weaken the validator. New generation and source fingerprints require fresh
technical and adversarial passes.

The vector-search candidates explicitly distinguish Preview, region and index
version. Current product documentation qualifies or contradicts some training
generalizations about post-filtering, read-only tables and legacy TOP_N syntax;
those generalizations are not adopted as universal facts. An inconsistent
embedding-function return-type paragraph is also excluded as a tested claim.
The additional 25 candidates do not reduce the **123 verified-question
shortfall** until genuine independent reviews succeed.

Seven superseded reviewed versions remain under `review-history`: **2 rejected
and 5 manual-review-required**. Their exact verdicts, source evidence, stage
bindings and scores remain unchanged. Reasons include missing named-distractor
support, incomplete permission baselines, invalid literal countercontexts,
answer disclosure and inflated difficulty. Each current replacement has a new
authored fingerprint and fresh technical/adversarial passes. Earlier
technical-only failures and immutable candidate snapshots remain in the local
grounding workspace. The queue reports distinguish current records from old
versions instead of making historical failures disappear.

The consolidated ledger has **583 actual attestations**: all **556 baseline
records compared unchanged** at **2026-09-15T05:21:08.024Z**, plus 27 matching
DP-800 records. Existing DP-700 and other credential banks, storage identifiers
and completed history are preserved. No second engine or migration was added.

### Actual checkpoint commands

| Command                                                 | Actual intermediate result                                                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `npm run questions:verify -- --exam dp-800`             | Passed exact current review bindings                                                                               |
| `npm run test -- tests\dp-exams.test.ts --maxWorkers=2` | 13 passed, including real production-content gates                                                                 |
| `npm run test:e2e -- dp-exams.spec.ts`                  | 6 passed, desktop/mobile; actual Study, exact tome, explanations, scores, isolation, DP-700 and sealed DP-420/Boss |
| `npm run test`                                          | Stock suite: 625 passed in 31 files, 24.01 seconds                                                                 |
| `npm run lint`                                          | Passed                                                                                                             |
| `npm run typecheck`                                     | Passed                                                                                                             |
| `npm run test:e2e`                                      | Stock suite: 65 passed, 1 failed, 5.2 minutes                                                                      |
| `npm run test:e2e -- github-exams.spec.ts`              | After test-only synchronization repair: 2 passed, desktop/mobile, 56.6 seconds                                     |

The next complete stock browser run finished **62 passed / 4 failed**. The GH
repair held. The new DP journey's final DP-700 transition also needed its button
scoped to the setup form: the hash can change before React replaces the map.
The other three failures showed the existing startup status instead of the
expected content within the five-second assertion deadline.

The subsequent affected-journey run used:

```powershell
npm run test:e2e -- --grep 'DP-800 Advanced|GH-300 three-pass|accessible local-only /setup page|accessible local-only /forge page|configure, answer'
```

It finished **9 passed / 1 failed**. Both synchronized DP and GH journeys
passed, but mobile setup still failed during startup. Its preserved trace records
the App module request as pending with no response at the deadline. An isolated
production CPU diagnostic loaded the app in **1,945 ms**; that sample does not
prove the stock suite meets its deadline or establish the delay's cause.
No further shared-code performance change, longer timeout, removed assertion or
reduced accessibility coverage was used. **62/66 remains the latest full-suite
result; required browser acceptance is not complete.**

The full-browser failure was the existing GH journey's final DP-700 navigation:
its global Descend locator ran while six map buttons were still mounted. The
trace and error context were preserved. The test now waits for `#/setup` and
scopes Descend to `form.setup-layout`. No `.first()`, forced click, arbitrary
sleep, longer timeout, dropped assertion or GH production change was used.
The exact journey passes on both browser projects. These checkpoint outcomes
are **not final acceptance after further content expansion**.

Initial local RED checkpoints `54cf3b8` and `f779152`, the source-fix checkpoint
`eab1c07`, and the first eight-item review checkpoint `1c8ba03` preserve the
actual progression. Final checks, upstream comparison, commit/push and remote
verification still have to run on the eventual deliverable.

## Historical stopped handoff, September 14, 2026

The following subsections preserve the earlier blocked state and direct baseline
results. Their empty-bank and no-review statements apply **only to that stopped
handoff**, not to the current Study checkpoint above. Subsequent recovered raw
MCP receipts and direct original authoring superseded the stalled bulk-author
workflow; the user explicitly requested continued autonomous completion.

**The requested question banks and end-to-end delivery are not complete.**
This local branch contains integration and source-grounding work, not a new
playable DP bank. No feature-branch commit, push, pull request, merge or deployment
was made. Do not interpret successful empty-package validation as content approval.

This independent learning experience is not an official GitHub or Microsoft
exam, practice assessment, endorsement, or source of real exam questions.
Encounters are original study questions grounded in publicly available official
documentation.

### Historical delivery state

| Exam   |                   Planned candidates | Received candidates | Pass 2 | Pass 3 | Verified | Rejected | Manual review | Stale | Playable |
| ------ | -----------------------------------: | ------------------: | -----: | -----: | -------: | -------: | ------------: | ----: | -------: |
| DP-800 |                                  165 |                   0 |      0 |      0 |        0 |        0 |             0 |     0 |        0 |
| DP-420 | Not started: current map unavailable |                   0 |      0 |      0 |        0 |        0 |             0 |     0 |        0 |

The development target remains **150 verified per exam**: a shortfall of 150
for each, 300 combined. No question-generation output, independent option review,
adversarial challenge or rubric was received. Zero rejections means no completed
candidate review, not that every proposed question succeeded.

Three DP-800 authoring contexts were assigned bounded, separate domains with
targets of 60, 60 and 45 candidates. At the actual **2026-09-14T21:09:23.363Z**
artifact inspection, none of their assigned output directories existed. Their
reported running state did not supply usable work. Stop-and-handoff requests were
sent; cessation was not confirmed. No replacement authoring scopes were launched.
The final filesystem check at **2026-09-14T21:51:02.994Z** still found no author
directories or generation outputs and confirmed the installed DP-800 bank was
empty.
This is a **stalled authoring/handoff blocker**, not evidence that DP-800's
documentation cannot support the target.

The separate technical and adversarial stages never began. Required custom
planner, TDD and reviewer tools failed before execution because their configured
`opus`/`sonnet` aliases were unavailable; no model overrides were supplied.
Direct architecture investigation and tests-first work proceeded. A read-only
code-review fallback had not returned a completed review before its
stop-and-handoff request. Its subsequent handoff reported **no significant
issues** in the earlier shared provenance, duplicate-cache and scaffolder changes,
and in the additional classifier-allocation optimization, and confirmed that
review work had stopped. This scoped code review produced no candidates or
independent question reviews. A final review covering the later online-transport
and DP browser-test changes is not claimed.

### Objective evidence captured before the stopped handoff

| Exam   | Established current identity                             | Current objective version | Current-map result                                         |
| ------ | -------------------------------------------------------- | ------------------------- | ---------------------------------------------------------- |
| DP-800 | Microsoft Certified: SQL AI Developer Associate          | March 12, 2026            | Current guide captured; 3 domains, 11 skills, 73 subskills |
| DP-420 | Microsoft Certified: Azure Cosmos DB Developer Specialty | `null`                    | Complete current English map not established               |

DP-800's verbatim detailed map retains published ranges **35-40%, 35-40%,
25-30%**. The actual guide retrieval was **2026-09-14T18:19:19.493Z** and its
objective fingerprint is
`8d3bf9feb9d1fc5d0ad345e11957d92f5e7e7ac2ca89c4ab7a513ecc81958191`.

DP-420's fetched guide supplies a complete outline only for **October 6, 2026**.
The current credential explicitly calls that update upcoming. Its change log
lists prior domains and skill-group names but not complete prior subskills or
weights. A bounded independent search used three actual Learn MCP searches and
one guide-linked exam-page fetch; it did not establish a permitted complete
current map. Search snippets were not used as objective evidence.

The future outline is preserved in
[`dp-420-prospective-objectives.json`](dp-420-prospective-objectives.json), outside
the gameplay registry. The current catalog version remains null and both modes
remain locked. The accompanying
[`dp-420-grounding-status.json`](dp-420-grounding-status.json) records exact
queries, source URLs, observations and limitations. The research context did not
save its additional raw responses; its disclosed summary is retained without
reconstructing those responses. Parent-fetched guide, credential and course
receipts are preserved locally.

### Initial approved curriculum roots and actual evidence

DP-800 has four curated canonical curriculum sources, **not four independently
verified question-evidence packets**:

| Source                                                                                                                                            | Actual MCP retrieval (UTC, September 14, 2026) |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [DP-800 guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-800)                                        | 18:19:19.493Z                                  |
| [Design and develop database solutions](https://learn.microsoft.com/en-us/training/paths/design-develop-database-solutions/)                      | 18:31:14.910Z                                  |
| [Secure, optimize, and deploy database solutions](https://learn.microsoft.com/en-us/training/paths/secure-optimize-deploy-database-solutions/)    | 18:31:15.108Z                                  |
| [Implement AI capabilities in database solutions](https://learn.microsoft.com/en-us/training/paths/implement-ai-capabilities-database-solutions/) | 18:31:14.994Z                                  |

The [credential](https://learn.microsoft.com/en-us/credentials/certifications/developing-ai-enabled-database-solutions/)
and [course](https://learn.microsoft.com/en-us/training/courses/dp-800t00) were
also actually retrieved at **18:19:19.510Z** and **18:19:19.466Z**. The official
credential's rendered preparation links were captured at **18:31:24.010Z**.
The registry preserves their observed locale-neutral targets and English
canonical destinations; separate HTTP redirect receipts were captured later.
Curriculum curation is recorded at **18:47:06.310Z**. No candidate-specific
implementation source curation was returned by the authoring contexts.

All four canonical URLs and three recorded training-link targets passed bounded
online checks at **2026-09-14T21:38:43.670Z**. These seven checked URLs represent
four sources, not seven sources or any verified questions. URL availability is
not claim review and did not change source-curation or question-review dates.

DP-420's parent guide, credential and course receipts were captured at
**18:19:19.756Z**, **18:19:19.682Z**, and **18:19:19.499Z**, respectively.
Their current-map limitation prevents technical question authoring under a
verified current blueprint.

Raw public MCP responses, rendered-link receipts, redirect observations and
generation requests remain in ignored `.grounding/dp-expansion`. Original
summaries, exact URLs, objective mappings and provenance are in the package
and catalog. No assessment, dump, community quiz, internal source or other
question bank supplied new questions; no new questions were produced.

### Baseline and original preservation check

Initial and latest fetched `origin/main`, and this branch's unchanged HEAD:
**`d9a1e39dbc755448f38584ecca692b9e20e35eb6`**.

Local branch: **`anuraagr-dp-800-and-dp-420-modules`**. A remote branch with
that name was not present at the final lookup. Changes remain uncommitted.
No completed mergeability assessment of the uncommitted work or claim about
future conflict freedom is made.

DP-700 retains **162 verified questions**, 54 per domain, all 10 skills and
54 sampled subskills. Its difficulty distribution is 30 beginner, 42
intermediate, 54 advanced, 36 expert; complexity is 21 recall, 54 implementation,
22 scenario, 30 troubleshooting, 35 architecture. Its 124 nonblocking quality
warnings remain visible. Exact factual-file hashes and per-subskill counts
were captured before tracked edits.

The other 16 catalog records are unchanged. Existing question banks, objectives,
source manifests, question attestations and the consolidated ledger were not
rewritten. The local-storage key, scoring engine, selection engine, historical
snapshots and existing credential IDs are unchanged. Only DP-800 discovery
memberships were added to relevant generic classes.
The final preservation check matched all six captured DP-700 file hashes and
found no diff in the other five installed content packages or consolidated ledger.

Primary evidence is the direct command output captured by the integration
context. Secondary baseline-helper summaries are retained locally, but their
incorrect DP-420 current-map/readiness statements and inconsistent timing
labels are not used as source or acceptance evidence.

### Original scaffold surfaces

- DP-only catalog metadata, exact source allowlists, pinned three-pass policies,
  generic discovery mappings, and truthful sealed reasons.
- DP-800 manifest, current objective map, four curriculum sources/provenance,
  empty question/ledger/envelope/pass files, and honest coverage/verification
  reports. Empty files do not contain fabricated approvals.
- Generic strict generation/technical/adversarial prompts; existing GitHub and
  legacy prompt selection remains intact.
- Locale-neutral direct Learn training receipts across schema, provenance and
  online transport. Canonical source permissions remain unchanged; unbound,
  unapproved or mismatched targets fail closed.
- Cached per-candidate duplicate shapes and allocation-free set comparisons.
  Existing classifier decisions, thresholds, operator handling and warning
  severity are unchanged.
- DP identity/policy/selection/persistence/production-content acceptance tests
  and real browser journeys. DP-420 engine fixtures are explicitly synthetic
  and never imported by the application.
- Maintainer documentation and separate prospective DP-420 evidence.

The substantive file changes are:

| Area                      | Files                                                                                                                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shared checks and tooling | `src/features/dungeons/duplicateReview.ts`, `src/features/dungeons/provenance.ts`, `src/features/grounding/quality.ts`, `scripts/generate-questions.ts`, `scripts/validate-sources.ts`                                                                       |
| Catalog/discovery         | `src/content/credentials/credentials.json`, `src/content/credentials/hero-classes.json`                                                                                                                                                                      |
| DP-800 scaffold           | `manifest.json`, `objectives.json`, `sources.json`, `source-registry.json`, empty `questions.json`, `verification-reviews.json`, `encounter-metadata.json`, `validation-metadata.json`, coverage/verification/queue reports under `src/content/exams/dp-800` |
| Tests                     | `tests/dungeon-provenance.test.ts`, `tests/dungeon-strict-tooling.test.ts`, `tests/source-redirects.test.ts`, `tests/dp-exams.test.ts`, `tests/e2e/dp-exams.spec.ts`                                                                                         |
| Prompts/instructions      | Three generic strict prompts under `.github/prompts`, `.github/copilot-instructions.md`                                                                                                                                                                      |
| Documentation/evidence    | `README.md`, `docs/source-policy.md`, `docs/gh-three-pass-workflow.md`, `docs/dp-content-maintenance.md`, this report, and the two DP-420 evidence JSON files                                                                                                |

Measured on one synthetic 150-record fixture, scenario normalization changed
from about 228 ms to 3 ms and package validation from about 360 ms to 123 ms.
Exact baseline-versus-new duplicate outputs matched every existing bank and
the combined **556-record** corpus. The combined single-run comparison was
about 885 ms versus 121 ms. These are bounded measurements, not general
performance guarantees or independent semantic duplicate review.

### Baseline and stopped-handoff command results

| Command/check                                                                                                                                            | Actual result                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial `npm run grounding:retrieve` attempts                                                                                                            | Failed: missing MCP SDK; no failed response recorded as evidence                                                                                  |
| `npm ci --no-audit --no-fund`                                                                                                                            | Passed; 409 locked packages restored; manifest/lockfile unchanged                                                                                 |
| Direct HTTPS Learn MCP fallback; subsequent existing MCP CLI                                                                                             | Actual root retrievals succeeded                                                                                                                  |
| Baseline `npm run lint`, `npm run typecheck`                                                                                                             | Passed                                                                                                                                            |
| Baseline `npm run credentials:validate`, `npm run content:validate-all`                                                                                  | Passed                                                                                                                                            |
| Baseline DP-700 `questions:validate`, `validate:sources`, `questions:verify`, `questions:duplicates`, `questions:coverage`, `questions:report -- --json` | Passed; structural/recorded-evidence checks, not new factual review                                                                               |
| Baseline `npm run test`, first attempt                                                                                                                   | Failed: 584 passed, 1 existing strict beta-bank test exceeded 5000 ms; 61.67 s                                                                    |
| Unchanged parent-side isolated `npm run test`                                                                                                            | Same failure: 584 passed, 1 timed out; 61.77 s; complete machine isolation was not established                                                    |
| `npm run test -- --maxWorkers=2`                                                                                                                         | Diagnostic passed: 585/585, 31.39 s; not a stock-command pass                                                                                     |
| Baseline `npm run build`                                                                                                                                 | Passed; existing Zod annotation and large-chunk warnings                                                                                          |
| Baseline `npm run test:e2e`                                                                                                                              | Failed: 57 passed, 3 failed, 4.9 min                                                                                                              |
| Tests-first compatibility checks                                                                                                                         | Initially 4 failed/50 passed; after implementation 111 targeted tests passed                                                                      |
| Stock `npm run test` after first duplicate optimization                                                                                                  | Passed: 600/600, 21.35 s; runner defaults/timeouts/assertions unchanged                                                                           |
| Grounding/duplicate regression selection after second optimization                                                                                       | Passed: 113 tests                                                                                                                                 |
| Targeted unchanged browser failures after first optimization                                                                                             | 5 passed/1 failed; desktop challenge exceeded its overall 30000 ms budget                                                                         |
| New DP production-content tests                                                                                                                          | Unmet: the scaffold has no real playable questions; assertions remain present                                                                     |
| `npm run test -- tests\dp-exams.test.ts -t "DP credential integration" --maxWorkers=2`                                                                   | Passed: 6 selected tests; 7 production-content cases not selected, not claimed passed                                                             |
| New DP-420 browser test, initial attempts                                                                                                                | Failed first on Node JSON-import handling, then on an incorrect assumption that fresh preferences were already stored; both test defects repaired |
| `npm run test:e2e -- --grep "DP-420 cannot"` after repairs                                                                                               | Passed: 2/2, desktop and mobile, 17.8 s; real sealed-state behavior, not playable DP-420 content                                                  |
| DP-800 scoped validate/verify/duplicates/coverage/report chain                                                                                           | Passed for **zero candidate records**; does not meet content acceptance                                                                           |
| `npm run objectives:refresh -- --exam dp-800` and `--exam dp-420` with output paths                                                                      | Passed as request scaffolding only                                                                                                                |
| DP-800 `questions:generate --target-verified 150 --count 165` with request ID/output                                                                     | Passed as request scaffolding only; no questions generated                                                                                        |
| DP-420 `questions:generate --target-verified 150 --count 165`                                                                                            | Failed on missing current `objectives.json`; prospective evidence was not substituted                                                             |
| DP-800 online source check before transport handoff fix                                                                                                  | Failed on the recorded locale-neutral training target                                                                                             |
| Focused transport/source regression checks after fix                                                                                                     | Passed: 109 tests, including unchanged SQL/GitHub source restrictions                                                                             |
| `npm run sources:validate -- --exam dp-800 --online` after fix                                                                                           | Passed: 4 canonical sources plus 3 exactly bound training redirects                                                                               |
| Final partial `npm run typecheck`, `npm run lint`, `npm run content:validate-all`                                                                        | Passed after the target/canonical handoff fix; these do not satisfy the missing production-content tests                                          |
| Independent technical/adversarial question review, realism scoring, semantic duplicate review                                                            | **Not performed: no candidate handoff**                                                                                                           |
| Final full stock unit/E2E acceptance after content integration                                                                                           | **Not run/completable: content integration is blocked**                                                                                           |
| Push and remote CI                                                                                                                                       | **Not performed**                                                                                                                                 |

The three direct baseline browser failures were desktop
`challenge.spec.ts`'s configure/answer/export/review/retry journey, desktop
`github-exams.spec.ts`'s GH-300/GH-600/DP-700 journey, and mobile
`accessibility.spec.ts`'s root page. Exact logs and the three available trace
archives were preserved in session artifacts before reruns. A later trace
identified an approximately 8.5-second axe-injection action; the remaining
journey timing failure is not attributed solely to app startup. Axe coverage,
test assertions, timeouts and runner defaults were not weakened.

Exact scoped commands used for the partial DP-800 reports were:

```powershell
npm run questions:validate -- --exam dp-800
npm run questions:verify -- --exam dp-800
npm run questions:duplicates -- --exam dp-800 --cross-exam dp-700,github-copilot,github-agentic-ai-developer,az-104,sc-200,ai-103
npm run questions:coverage -- --exam dp-800
npm run questions:report -- --exam dp-800 --write
npm run sources:validate -- --exam dp-800 --online
npm run objectives:refresh -- --exam dp-800 --output .grounding\dp-expansion\dp800-refresh-request.json
npm run objectives:refresh -- --exam dp-420 --output .grounding\dp-expansion\dp420-refresh-request.json
npm run questions:generate -- --exam dp-800 --target-verified 150 --count 165 --id dp800-grounded-expansion --author copilot-dp-expansion-integration --output .grounding\dp-expansion\generation-request
npm run questions:generate -- --exam dp-420 --target-verified 150 --count 165 --id dp420-current-map-blocked --output .grounding\dp-expansion\dp420-blocked-request
```

The last command failed on the missing current map. The successful generation
and refresh commands only wrote requests. Focused validation used:

```powershell
npm run test -- tests\dungeon-provenance.test.ts tests\dungeon-strict-tooling.test.ts --maxWorkers=2
npm run test -- tests\dungeon-provenance.test.ts tests\dungeon-strict-tooling.test.ts tests\dungeon-three-pass.test.ts --maxWorkers=2
npm run test -- tests\dungeon-strict-tooling.test.ts tests\grounding.test.ts tests\grounding-tooling.test.ts --maxWorkers=2
npm run test -- tests\dp-exams.test.ts --maxWorkers=2
npm run test -- tests\dp-exams.test.ts -t "DP credential integration" --maxWorkers=2
npm run test:e2e -- --grep "configure, answer|GH-300 three-pass|accessible local-only / page"
npm run test:e2e -- --grep "DP-420 cannot"
npm run test -- tests\source-redirects.test.ts --maxWorkers=2
npm run test -- tests\source-redirects.test.ts tests\dungeon-provenance.test.ts tests\github-source-markdown.test.ts tests\grounding.test.ts --maxWorkers=2
```

These selections are not a claim that the final full suite passed. Expected-red
test results, unsuccessful browser attempts and the repaired focused results
remain in the session logs. Workflow schemas were regenerated with
`npm run questions:schemas`; after repository formatting there was no semantic
JSON-schema diff because the relevant cross-field URL restrictions execute in
TypeScript.

### Historical zero-coverage resumption blocker

DP-800 playable and reviewed coverage is **0/3 domains, 0/11 skills, 0/73
subskills**. Every difficulty/complexity count is zero; applied-reasoning share,
boss-tier share, answer-position distribution and rubric distribution have no
question denominator. No correct answer, distractor or unsupported-claim
assessment was completed. Empty-bank duplicate checks do not establish
semantic originality of a future bank.

DP-420 current coverage cannot be measured against an unestablished current
map. Its prospective map is not used as a denominator or gameplay taxonomy.
Both Study and Boss remain locked for both DP entries in this partial state.

To resume, obtain a real, immutable, source-grounded candidate handoff in small
auditable batches and complete genuinely separate technical and adversarial
reviews. Only then populate matching per-package/consolidated attestations,
score rubrics, resolve duplicates, recompute readiness and satisfy the retained
production-content and full regression tests. A complete current official
DP-420 outline is an additional prerequisite for its bank. Until those
prerequisites and acceptance checks are met, **do not push this partial branch**.
