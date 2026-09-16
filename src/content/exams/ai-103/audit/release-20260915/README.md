# AI-103 release evidence

This is an unofficial study-bank audit, not a Microsoft practice exam or a
claim of continuous freshness. The current objective map remains effective
April 16, 2026. Retrieval dates, source-review dates and independent question
review dates retain their separate meanings.

`selection.json` records the effective **116-question selection**, retaining the
original artifact locations and actual final reviewers. Its publication flag
describes staging; `publication.json` records canonical installation.
`prior-selection-117` and `history/release-117-before-quality-exception` preserve
the original 117 selection and publication evidence. `selection-exceptions.json`
withholds only the exact `g012` hash for a persistent answer-elimination and
difficulty concern. Its actual current 45-point review and earlier other-hash
43-point review remain unchanged; this curation decision is not a new score,
verdict or authoring pass. Every other selected hash and review is retained.
`final-qualification.json` records the effective canonical checks.
The ordinary package reports describe only the selected playable bank; excluded
attempts are not available coverage.

`dispositions.json` lists unselected reviewed reserves, pending author-only
attempts, withheld records and the two archived failed SDK generations.
`validation-results.json` summarizes release checks and remaining limitations.

`identity-evidence.json` records the current official offering assessment. It
uses the complete exam offering and corroborating catalog, not a scheduling
link alone, an invented beta flag or a guessed GA release date. Earlier identity
interpretations remain preserved.

## Exact historical artifacts

`artifact-index.json` maps original paths beneath `.grounding\ai103-release` to
SHA-256-addressed contents in `artifacts.jsonl.gz`. The compressed JSON Lines
archive preserves exact original UTF-8 bytes while avoiding duplicate copies.
It includes question generations, technical and adversarial reviews, every
observed verdict and rubric, source freezes, MCP/HTTP receipts, provenance,
source-impact holds and review-routing evidence. Repeated operational progress
reports and temporary assembly candidates are omitted as documented in the
index; the final selection reports are retained separately. The original 117
inputs and the revised 116 inputs remain separately under `frozen-release-117`
and `frozen-release-116`, with their assembly paths indexed as verified aliases.
Formatting readable canonical copies does not rewrite those frozen bytes.

Verify every archived content hash and indexed file:

```powershell
node scripts\verify-ai103-release-archive.mjs
```

Read one original artifact without extracting files or changing its content:

```powershell
node scripts\verify-ai103-release-archive.mjs --read "batches\planning\pass1\ai103-planning-b02-r01\verification-reviews-continuation-1.json"
```

Archive integrity is not semantic verification. Old positive verdicts, stale
source snapshots, unknown-provenance outputs and pending candidates remain
historical evidence, never approvals for the installed bank. In particular,
the earlier positive `rg-011` review is preserved alongside its same-reviewer
duplicate reconsideration; retained `rp-007` is not renamed or replaced.
Rejected/manual SDK attempts and reserved canonical identities remain
reportable without rebinding their old source or review dates.

The pre-release package and earlier objective/question history remain under
`history`. Git can normalize line endings in those readable copies.
`publication.json` records both original workspace-byte hashes and baseline Git
blob hashes; the exact workspace bytes are also retained at the indexed
`pre-release-package-bytes` paths. No persistence migration, history deletion,
telemetry or runtime AI generation accompanies this content release.
