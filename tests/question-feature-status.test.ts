import { describe, expect, it } from 'vitest';
import {
  inspectContent,
  questionSchema,
} from '../src/features/grounding/schema';
import { validateDungeonPackage } from '../src/features/dungeons/validation';
import { questionFingerprint } from '../src/features/dungeons/review';
import { strictFixture } from './dungeon-three-pass-fixtures';
import { dungeonFixture } from './dungeon-fixtures';

describe('strict methodology feature-status representation', () => {
  it('represents non-feature methodology without inventing GA or Preview', () => {
    const { credential, raw } = strictFixture(25, 'training', 'Not applicable');
    raw.manifest.sources[0].featureStatus = 'Not applicable';
    const before = JSON.stringify(raw);
    const dungeon = validateDungeonPackage(credential, raw);
    expect(
      dungeon.findings.filter((finding) => finding.severity !== 'warning'),
    ).toEqual([]);
    expect(dungeon.questions).toHaveLength(25);
    expect(
      dungeon.questions.every(
        (question) => question.featureStatus === 'Not applicable',
      ),
    ).toBe(true);
    expect(JSON.stringify(raw)).toBe(before);
  });

  it.each(['Unknown', 'Unverified', 'Generally available?'])(
    'does not silently translate %s into a non-feature claim',
    (featureStatus) => {
      const { raw } = strictFixture();
      expect(
        questionSchema.safeParse({ ...raw.questions[0], featureStatus })
          .success,
      ).toBe(false);
    },
  );

  it('does not infer a question label from a Not applicable source label', () => {
    const { credential, raw } = strictFixture(25, 'training');
    raw.manifest.sources[0].featureStatus = 'Not applicable';
    const dungeon = validateDungeonPackage(credential, raw);
    expect(dungeon.questions).toHaveLength(25);
    expect(
      dungeon.questions.every((question) => question.featureStatus === 'GA'),
    ).toBe(true);
  });

  it('still requires Preview when any cited source is marked Preview', () => {
    const { credential, raw } = strictFixture(25, 'training', 'Not applicable');
    raw.manifest.sources[0].featureStatus = 'Preview';
    const dungeon = validateDungeonPackage(credential, raw);
    expect(dungeon.questions).toEqual([]);
    expect(
      dungeon.findings.some((finding) =>
        finding.message.includes('preview feature must be labelled'),
      ),
    ).toBe(true);
  });

  it.each(['technical', 'adversarial', 'feature-status-check'] as const)(
    'cannot bypass the independent %s requirement',
    (missing) => {
      const { credential, raw } = strictFixture(
        25,
        'training',
        'Not applicable',
      );
      const id = raw.questions[0].id;
      const stages = raw.validationMetadata.encounters[id];
      if (missing === 'technical') delete stages.technical;
      if (missing === 'adversarial') delete stages.adversarial;
      if (missing === 'feature-status-check')
        stages.technical!.review.checks.featureStatus = false;
      const dungeon = validateDungeonPackage(credential, raw);
      expect(
        dungeon.reviewedQuestions.some((question) => question.id === id),
      ).toBe(false);
      expect(dungeon.questions).toEqual([]);
    },
  );

  it('cannot relabel an already reviewed question without invalidating its exact bindings', () => {
    const { credential, raw } = strictFixture(25, 'training');
    const question = raw.questions[0];
    const oldHash = questionFingerprint(question);
    question.featureStatus = 'Not applicable';
    expect(questionFingerprint(question)).not.toBe(oldHash);
    const dungeon = validateDungeonPackage(credential, raw);
    expect(
      dungeon.reviewedQuestions.some((entry) => entry.id === question.id),
    ).toBe(false);
    expect(dungeon.questions).toEqual([]);
  });

  it('cannot use the label to override a valid technical hold on an actual SDK/API claim', () => {
    const { credential, raw } = strictFixture(26, 'training', 'Not applicable');
    raw.manifest.sources[0].featureStatus = 'Not applicable';
    const question = raw.questions[0];
    question.question =
      'Synthetic test: a Python service using azure-ai-projects 2.x reads response.usage from a Responses result. The admitted fixture evidence does not establish the lifecycle of this software contract. Select the artificial supporting option.';
    question.questionType = 'code';
    question.codeLanguage = 'python';
    question.codeSnippet =
      'response = client.responses.create(model="synthetic-deployment", input="synthetic")\nprint(response.usage)';
    const hash = questionFingerprint(question);
    const stages = raw.validationMetadata.encounters[question.id];
    const finalReview = raw.reviews.reviews.find(
      (review) => review.questionId === question.id,
    )!;
    // Rebind only synthetic test declarations so a stale hash cannot cause this denial.
    stages.generation.questionFingerprint = hash;
    stages.technical!.review.questionFingerprint = hash;
    stages.adversarial!.questionFingerprint = hash;
    raw.encounterMetadata.encounters[question.id].questionFingerprint = hash;
    finalReview.questionFingerprint = hash;
    stages.technical!.review.verdict = 'manual-review-required';
    stages.technical!.review.checks.featureStatus = false;
    stages.technical!.review.verificationNotes =
      'Synthetic technical hold: this is a named SDK/API contract, not methodology; the fixture evidence does not establish its lifecycle.';
    expect(question.verificationStatus).toBe('verified');
    expect(stages.adversarial!.verdict).toBe('verified');
    expect(finalReview.verdict).toBe('verified');

    const dungeon = validateDungeonPackage(credential, raw);
    expect(
      dungeon.reviewedQuestions.some((entry) => entry.id === question.id),
    ).toBe(false);
    expect(dungeon.reviewedQuestions).toHaveLength(25);
    expect(dungeon.questions).toEqual([]);
    expect(dungeon.readiness.study).toBe(false);
    expect(
      dungeon.findings.some((finding) =>
        finding.message.includes(
          'Technical pass did not approve this candidate.',
        ),
      ),
    ).toBe(true);
    expect(
      dungeon.findings.filter(
        (finding) =>
          finding.category === 'schema' ||
          /fingerprint|bind this candidate|same exact current content/i.test(
            finding.message,
          ),
      ),
    ).toEqual([]);
  });

  it('cannot gain an evidence role from the new label or a caller-supplied strict flag', () => {
    const { credential, raw } = strictFixture(1, 'training', 'Not applicable');
    const content = inspectContent(raw.questions, raw.manifest, raw.taxonomy, {
      ...credential,
      strictGuideLinked: true,
      validatedSupportingSourceIds: [],
    });
    expect(content.questions).toEqual([]);
    expect(
      content.findings.some((finding) =>
        finding.message.includes('validated training/doc provenance'),
      ),
    ).toBe(true);
  });

  it('preserves the legacy GA/Preview policy without a three-pass profile', () => {
    const { credential, raw } = dungeonFixture();
    raw.questions[0].featureStatus = 'Not applicable';
    const content = inspectContent(
      raw.questions,
      raw.manifest,
      raw.taxonomy,
      credential,
    );
    expect(content.questions).toEqual([]);
    expect(
      content.findings.some((finding) =>
        finding.message.includes('requires the three-pass-v1 review profile'),
      ),
    ).toBe(true);
  });

  it('cannot remove the strict package declaration to fall back to legacy admission', () => {
    const { credential, raw } = strictFixture(25, 'training', 'Not applicable');
    const { reviewPolicy, ...packageManifest } = raw.packageManifest;
    expect(reviewPolicy.version).toBe('three-pass-v1');
    const dungeon = validateDungeonPackage(credential, {
      ...raw,
      packageManifest,
    });
    expect(dungeon.questions).toEqual([]);
    expect(
      dungeon.findings.some((finding) =>
        finding.message.includes('requires the three-pass-v1 review profile'),
      ),
    ).toBe(true);
  });
});
