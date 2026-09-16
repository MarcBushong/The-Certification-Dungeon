# AI-103 and AI-200 availability evidence

**The current official offering supports an active-identity determination for
AI-103 and AI-200.** This assessment was reviewed on **2026-09-15** against the
complete captured credential pages and public Microsoft Learn catalog, with
independent inspection by both credential content owners.

This is an identity assessment, not a claim that question reviews are complete
or that either gameplay mode is ready. It does not invent a general-availability
launch date, a `beta=false` API field, or a beta-play exception. The Certification
Dungeon remains an original, unofficial study aid, not a Microsoft practice exam.

## Actual retrievals

These source IDs identify identity receipts only. They do not approve a technical
source for either question bank.

| Source ID                        | Official source                                                                                                                                                                 | Retrieval method                                                | Retrieved (UTC)              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------- |
| `ai103-credential-html`          | [Microsoft Certified: Azure AI Apps and Agents Developer Associate](https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate/) | Public credential-page HTML                                     | 2026-09-15T19:18:12.3750747Z |
| `ai103-credential-mcp`           | [Microsoft Certified: Azure AI Apps and Agents Developer Associate](https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-apps-and-agents-developer-associate/) | Microsoft Learn MCP `microsoft_docs_fetch`                      | 2026-09-15T19:19:41.905Z     |
| `ai200-credential-html`          | [Microsoft Certified: Azure AI Cloud Developer Associate](https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-cloud-developer-associate/)                     | Public credential-page HTML                                     | 2026-09-15T19:18:12.5008107Z |
| `ai200-credential-mcp`           | [Microsoft Certified: Azure AI Cloud Developer Associate](https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-cloud-developer-associate/)                     | Microsoft Learn MCP `microsoft_docs_fetch`                      | 2026-09-15T19:19:41.794Z     |
| `ai-release-official-catalog`    | [Microsoft Learn Catalog API](https://learn.microsoft.com/api/catalog/)                                                                                                         | Public, unauthenticated, credential-filtered JSON request below | 2026-09-15T19:19:39.2832927Z |
| `official-catalog-reference-mcp` | [Microsoft Learn Catalog API developer reference](https://learn.microsoft.com/en-us/training/support/catalog-api-developer-reference)                                           | Microsoft Learn MCP `microsoft_docs_fetch`                      | 2026-09-15T20:25:15.834Z     |

The exact catalog request was:

```text
https://learn.microsoft.com/api/catalog/?locale=en-us&type=mergedCertifications,certifications,exams&uid=certification.azure-ai-apps-and-agents-developer-associate,certification.azure-ai-cloud-developer-associate,exam.AI-103,exam.AI-200,exam.ai-103,exam.ai-200
```

No authenticated profile, booking, exam sandbox, practice assessment, or
assessment-question content was accessed.

## What the captured offering establishes

The full credential pages publish a current **Take the exam** section, assessed
skills, offered exam languages, preparation material, and ordinary exam/retake
information. The public catalog's `mergedCertifications` records independently
bind those details to the exact credential identities:

| Captured field                   | AI-103                                                            | AI-200                                                  |
| -------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------- |
| Credential UID                   | `certification.azure-ai-apps-and-agents-developer-associate`      | `certification.azure-ai-cloud-developer-associate`      |
| Current title                    | Microsoft Certified: Azure AI Apps and Agents Developer Associate | Microsoft Certified: Azure AI Cloud Developer Associate |
| Preparation UID in `study_guide` | `course.ai-103t00`                                                | `course.ai-200t00`                                      |
| Exam UID in the provider URL     | `exam.AI-103`                                                     | `exam.AI-200`                                           |
| `exam_duration_in_minutes`       | `120`                                                             | `120`                                                   |
| Offered exam locales             | 10                                                                | 13                                                      |
| Listed assessed skill areas      | 5                                                                 | 4                                                       |

The API reference explicitly describes `mergedCertifications` as published
certifications merged with exams and identifies this representation for
single-exam certifications. The captured response supplies the exam details
there even though its separate `exams` array is empty. The older hierarchy exam
requests returned HTTP 204. Neither an empty legacy array nor that empty
hierarchy response is sufficient evidence that the current credential is
unavailable.

The complete current offering corroborates the user's availability confirmation.
This conclusion is **not** based on a scheduling link alone, language counts or
duration alone, or the absence of a literal beta label. The response does not
publish a `beta=false` field or a GA launch date, and neither is inferred.

The AI-103 overview separately reports that a Practice Assessment is available
on AI Skills Navigator; the assessment itself was not opened. AI-200's generic
explanation that Practice Assessments usually follow general availability does
not state that AI-200 is currently beta. Neither paragraph substitutes for the
complete offering and current objective evidence.

## Identity is separate from content admission

Each credential still requires its own current objective map, independently
grounded through its [AI-103 guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-103)
or [AI-200 guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ai-200).
The full provenance, technical-source approvals, source snapshots, exact-content
bindings and three distinct review contexts remain credential-scoped.

The release acceptance checks require **115-150 actual eligible encounters per
credential**, both Study and Boss readiness, verified skill breadth and the
existing applied-reasoning requirement. Merely changing catalog identity or
count fields cannot satisfy those checks. Candidate, manual, rejected, stale,
incomplete, unsupported and insufficiently reviewed records remain excluded.
The normal shared source, rubric, freshness, objective and mode gates are not
lowered to obtain the requested count.

Neither AI credential uses `allowBetaPlay` as a workaround. The separate
[GH-600 beta authorization](gh600-beta-availability.md) and every other
credential's existing availability rules remain unchanged. Source-feature
Preview labels also remain distinct from credential identity.

Prior identity interpretations and completed local history must remain
preserved; this assessment does not rewrite old question reviews or objective
snapshots. It describes the captured evidence, not perpetual freshness.
See [the AI three-pass workflow](ai-three-pass-workflow.md) and
[source policy](source-policy.md).

## Receipt integrity

Complete HTTP/MCP receipt objects are retained in local session artifacts, not
shipped as copied documentation bodies. The following hashes identify those
exact receipt files; hashes establish binding, not the truth of an interpretation.

| Receipt file                          | SHA-256                                                            |
| ------------------------------------- | ------------------------------------------------------------------ |
| `ai103-credential-html.json`          | `c10d50e8c5985690764f4cd744a49fe081e7b25f39d6b3e8a45a7bf5182b5275` |
| `ai103-credential-mcp.json`           | `1641c986293b24ef74ffeb299381814040ceafd78780a999a8e87ebb7f016604` |
| `ai200-credential-html.json`          | `7c8cc94473903d3235de1c110e4236326f0d704c975efbab6afb314cbe554fd6` |
| `ai200-credential-mcp.json`           | `57999fbb1a55c3c67f6eebca9fdb3a85697522560b518ef008136315dadeea03` |
| `ai-release-official-catalog.json`    | `40e3ccd29ce51d5d44a0ceeb262844f6bb890d22651baa6104c795eff4dd68b3` |
| `official-catalog-reference-mcp.json` | `6294d437153a14522ba30d8d114270cdd03f52c084a99c949c64823b4540b020` |
