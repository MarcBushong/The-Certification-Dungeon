import { beforeAll, describe, expect, it } from 'vitest';
import { loadDungeonPackage } from '../scripts/content-files';
import type { DungeonPackage } from '../src/features/dungeons/validation';
import { planDungeonSession } from '../src/features/quiz/dungeonRuntime';
import { defaultConfig } from '../src/features/quiz/types';

describe('AI-200 reviewed release', () => {
  let dungeon: DungeonPackage;

  beforeAll(async () => {
    dungeon = await loadDungeonPackage('ai-200');
  });

  it('opens the current identity only with the requested reviewed bank and both modes ready', () => {
    expect(dungeon.credential).toMatchObject({
      credentialId: 'ai-200',
      status: 'active',
      isVerified: true,
      verifiedQuestionCount: dungeon.questions.length,
    });
    expect(dungeon.questions.length).toBeGreaterThanOrEqual(115);
    expect(dungeon.questions.length).toBeLessThanOrEqual(150);
    expect(dungeon.reviewedQuestions).toHaveLength(dungeon.questions.length);
    expect(dungeon.readiness).toEqual({
      study: true,
      gauntlet: true,
      reasons: [],
    });
    expect(
      dungeon.findings.filter((finding) => finding.severity !== 'warning'),
    ).toEqual([]);
  });

  it('retains reviewed coverage of every current skill and subskill', () => {
    expect(dungeon.taxonomy.domains).toHaveLength(4);
    for (const domain of dungeon.taxonomy.domains) {
      for (const skill of domain.skills) {
        const questions = dungeon.questions.filter(
          (question) =>
            question.objectiveDomain === domain.id &&
            question.skill === skill.id,
        );
        expect(questions.length).toBeGreaterThanOrEqual(
          dungeon.packageManifest.readinessThresholds.minimumQuestionsPerSkill,
        );
        for (const subskill of skill.subskills)
          expect(
            questions.some((question) => question.subskill === subskill),
          ).toBe(true);
      }
    }
  });

  it.each(['study', 'gauntlet'] as const)(
    'plans %s runs from verified records while preserving the answer policy',
    (runMode) => {
      const result = planDungeonSession(
        [dungeon],
        {
          ...defaultConfig,
          credentialId: 'ai-200',
          questionCount: 5,
          runMode,
        },
        [],
        {},
        () => 0.5,
      );
      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error(result.warnings.join('\n'));
      expect(result.plan.questions).toHaveLength(5);
      expect(
        result.plan.questions.every(
          (question) =>
            question.verificationStatus === 'verified' &&
            !question.requiresManualReview,
        ),
      ).toBe(true);
      if (runMode === 'gauntlet')
        expect(result.plan.config.answerMode).toBe('exam');
    },
  );

  it('does not retry current manual or rejected candidates', () => {
    const excluded = dungeon.allQuestions.filter(
      (question) => question.verificationStatus !== 'verified',
    );
    expect(excluded.map((question) => question.verificationStatus)).toEqual(
      expect.arrayContaining(['manual-review-required', 'rejected']),
    );
    const result = planDungeonSession(
      [{ ...dungeon, questions: dungeon.allQuestions }],
      { ...defaultConfig, credentialId: 'ai-200', questionCount: 5 },
      [],
      {},
      () => 0.5,
      new Set(excluded.map((question) => question.id)),
    );
    expect(result.ok).toBe(false);
  });

  it('fails closed when source snapshots become newer than the recorded question reviews', () => {
    // Synthetic runtime input only; no source review or production record is changed.
    const newer = new Date(
      Math.max(
        ...dungeon.manifest.sources.map((source) =>
          Date.parse(source.lastReviewedAt),
        ),
      ) + 1,
    ).toISOString();
    const result = planDungeonSession(
      [
        {
          ...dungeon,
          manifest: {
            ...dungeon.manifest,
            sources: dungeon.manifest.sources.map((source) => ({
              ...source,
              lastReviewedAt: newer,
            })),
          },
        },
      ],
      { ...defaultConfig, credentialId: 'ai-200', questionCount: 5 },
    );
    expect(result.ok).toBe(false);
  });
});
