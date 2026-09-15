# AI-200 reviewed release

The Application Forge is an original, unofficial study aid, not a Microsoft
practice exam. It uses a versioned, build-time-grounded bank; there is no runtime
question-generation service, telemetry, or browser API key.

## Published content and availability

AI-200 publishes **150 playable questions**, with both **Study** and **Boss
Gauntlet** enabled. The current package contains 156 records: 150 verified,
3 manual-review-required, and 3 rejected. Every current record has a matching
independently authored final attestation.

The complete reviewed release pool contains 160 approved questions. Ten approved
records are retained in the
[publication reserve](../src/content/exams/ai-200/audit/release-20260915/publication-reserve.json),
not relabeled as rejected or counted as additional playable questions.
[Selection metadata](../src/content/exams/ai-200/audit/release-20260915/release-selection.json)
records the actual selected IDs, input versions, and domain quotas. Selection
preserves every covered subskill and the ordinary per-skill minimum, then prefers
independently classified applied questions, authentic difficulty, and rubric
quality within the published domain weighting.

| Current domain                                               | Official weight | Playable questions |
| ------------------------------------------------------------ | --------------- | -----------------: |
| Develop containerized solutions on Azure                     | 20-25%          |                 36 |
| Develop AI solutions by using Azure data management services | 25-30%          |                 43 |
| Connect to and consume Azure services                        | 20-25%          |                 36 |
| Secure, monitor, and troubleshoot Azure solutions            | 20-25%          |                 35 |

All **9 skills and 27 subskills** have reviewed coverage. There are 123 genuinely
applied questions (82%), with 28 Beginner, 107 Intermediate, 15 Advanced, and
0 Expert questions. The Advanced/Expert share is **10%**, below the unchanged
40% editorial target. No difficulty label was inflated to satisfy that target;
this release does not claim the optional strict-coverage aspiration was met.
Normal Study/Boss requirements and the strict question-review gates are met.

The [current official credential page](https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-cloud-developer-associate/)
and the public Learn merged-certification catalog corroborate the current
AI-200 offering, exact course reference, 120-minute assessment, and thirteen
offered languages. This is fuller evidence than a scheduling link alone.
The [identity audit](../src/content/exams/ai-200/audit/release-identity-20260915.json)
preserves actual retrieval times and the earlier unverified interpretations.
No GA date or nonexistent `beta=false` API field was invented. Credential
availability remains separate from question quality.

## Current grounding and independent review

Actual Microsoft Learn MCP retrievals on September 15, 2026:

| Primary source                                                                                                                         | Retrieval (UTC) |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| [AI-200 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-200)                       | 19:16:48.603    |
| [Azure AI Cloud Developer Associate](https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-cloud-developer-associate/) | 19:16:50.226    |
| [AI-200T00 course](https://learn.microsoft.com/en-us/training/courses/ai-200t00)                                                       | 19:16:52.324    |

The current guide remains undated. Its four domains, nine skills, 27 subskills,
and weights match the previously captured outline. The original undated
content identity is retained, while the actual new retrieval time is recorded.
The objective fingerprint remains
`8b8b077fe5d64a56b329ec16658c08b3b1a3cc51194c0693e0df793e47f2f42e`.
No retrieval date is presented as an official effective date.

The current manifest has 97 source records and a complete 130-node provenance
registry. Actual credential/course HTML receipts preserve the
credential -> exact course UID -> path UID -> module -> unit chain. The course
is ancestry-only. Technical evidence remains credential-scoped Microsoft Learn
material; no withdrawn article, unapproved FAQ, or other credential's approval
was admitted.

Four author contexts, four separate technical contexts, and four distinct
adversarial contexts completed the work. Authored repairs restarted generation
and both independent stages. Every option has sourced context/counterexample
analysis, and each final rubric independently scores all twelve 0-4 criteria.
Published scores range from 44 to 48, with all mandated critical scores.
The catalog-bound `three-pass-v1` policy, 44/48 minimum, target of 150, and
ordinary mode thresholds are unchanged.

The [review archive](../src/content/exams/ai-200/audit/release-20260915/archive-index.json)
preserves 163 original parsed authoring, source, technical, adversarial, and
final-review artifacts, including superseded holds. JSON whitespace is formatted
for repository CI; original and archived byte hashes are recorded separately.
Facts, reviewer identities, review clocks, verdicts, scores, and content bindings
were not changed. Raw MCP article bodies remain in ignored grounding workspaces.

The timer repair reuses the original frozen App Configuration source records.
A fresh retrieval produced byte-identical article bodies; its research-only
source versions were not installed as new authoritative snapshots. The
[comparison](../src/content/exams/ai-200/audit/release-20260915/unchanged-app-configuration-source-comparison.json)
documents this distinction, without renewing ten other questions' source reviews.

## Excluded records and preserved history

| Record          | Current status | Reason                                                                                    |
| --------------- | -------------- | ----------------------------------------------------------------------------------------- |
| `ai200-d-003`   | Manual review  | Same decisive parameter-binding choice as retained `ai200-d-017`.                         |
| `ai200-s-025`   | Manual review  | Exact Python log sampled-flag feature-maturity evidence remains insufficient.             |
| `ai200-r-s-007` | Manual review  | Exact fixed-percentage sampler feature-maturity evidence remains insufficient.            |
| `ai200-r-i-008` | Rejected       | SDK-lifetime reuse duplicates retained `ai200-d-001`.                                     |
| `ai200-r-s-003` | Rejected       | The same SDK-lifetime choice; extra cleanup wording was not independently discriminating. |
| `ai200-r-s-008` | Rejected       | Preaggregation decision duplicates existing `dp700-ingest-036`.                           |

The [manual](../src/content/exams/ai-200/manual-review.json) and
[rejected](../src/content/exams/ai-200/rejected-candidates.json) reports copy the
actual final reasons and reviews. Semantic comparisons are question- and
hash-specific, not blanket rules against similar APIs. Older cache entries
involving superseded AI-200 fingerprints were removed; all 39 foreign-only
entries remain unchanged. New detailed comparisons are preserved in the release
audit and per-question reviews, not manufactured as fresh cache approvals.

The original 150-record package, including the earlier c-002 rejection and
c-003/c-004/c-006 continuation outcomes, remains in
[pre-release history](../src/content/exams/ai-200/audit/pre-release-20260915/).
Canonical IDs, completed local runs, stored answer snapshots, scoring, and
objective history are preserved. No AI-103, DP-700, DP-800, GitHub package, shared
validator, readiness threshold, or persistence implementation was changed by
this workstream.

## Maintenance and verification

Use the unchanged [AI three-pass workflow](ai-three-pass-workflow.md) and
[source policy](source-policy.md) for later changes. Source freshness is relative
to the checked-in evidence, not a promise of perpetual currency. New future
AI-103 candidates require their own exact-hash cross-bank comparison; an earlier
comparison does not clear a later rewrite.

The package and consolidated ledger contain matching copies of actual
independent attestations. `reviews:sync` only copies those records. Current
[coverage](../src/content/exams/ai-200/content-coverage.md),
[verification](../src/content/exams/ai-200/verification-report.json), and
[question-bank diagnostics](../src/content/exams/ai-200/question-bank-report.json)
separate playable coverage, excluded records, editorial targets, warnings,
source dates, and semantic-review limitations.

The release checks passed with **725 unit tests in 38 files** and **78 desktop
and mobile browser tests**. Coverage is 97.24% of lines, 91.76% of branches, and
99.4% of functions. The full browser run exercised current AI-200 Study/Boss
behavior, answer visibility, scoring, local history, accessibility, and the
unchanged DP-700, GH-600, and DP-800 paths. Online source validation checked
135 unique URLs. Lint, typecheck, the production build, default mandatory-ledger
verification, and the complete installed-content gate passed.

This Windows checkout has `core.autocrlf=true`: the ordinary working-tree
`format:check` flags unchanged CRLF files against Prettier's default LF output.
That failure is recorded, not relabeled as success. Native-EOL checking passed
without rewriting foreign files. The
[repeatable Git-index checker](../src/content/exams/ai-200/audit/release-20260915/check-git-index-format.mjs)
also checks the actual staged blobs with the default repository Prettier rules,
without an EOL override, matching the content used by Linux CI:

```powershell
node src\content\exams\ai-200\audit\release-20260915\check-git-index-format.mjs
```

Its receipt is written under `.grounding\ai200-release\validation\`.
The [release validation receipt](../src/content/exams/ai-200/audit/release-20260915/validation-receipt.json)
preserves the actual command outcomes and the checkout-only formatting
distinction. The build still emits the existing Rollup annotation and large
static-chunk warnings; review evidence was not discarded to hide those warnings.
