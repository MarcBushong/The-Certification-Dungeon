import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { examId, loadDungeonPackage } from '../scripts/content-files';
import {
  credentials,
  filterCredentials,
} from '../src/features/dungeons/catalog';
import { buildContentReport } from '../src/features/grounding/report';
import {
  questionSchema,
  taxonomySchema,
} from '../src/features/grounding/schema';
import {
  objectiveFingerprint,
  questionFingerprint,
} from '../src/features/dungeons/review';
import { validationMetadataSchema } from '../src/features/dungeons/threePass';
import {
  buildContentStats,
  passesRealismRubric,
} from '../src/features/dungeons/readiness';
import { planDungeonSession } from '../src/features/quiz/dungeonRuntime';
import {
  eligibleQuestions,
  feedbackVisibility,
} from '../src/features/quiz/engine';
import { configSchema, defaultConfig } from '../src/features/quiz/types';

const read = (id: string, file: string): unknown =>
  JSON.parse(readFileSync(join('src', 'content', 'exams', id, file), 'utf8'));

describe.each(['ai-103', 'ai-200'])('%s installed strict package', (id) => {
  it('uses the existing canonical ID and independently required complete review policy', async () => {
    expect(examId(id.toUpperCase())).toBe(id);
    expect(
      credentials.filter((credential) => credential.credentialId === id),
    ).toHaveLength(1);
    const dungeon = await loadDungeonPackage(id);
    expect(dungeon.credential.requiredReviewPolicy).toEqual(
      dungeon.packageManifest.reviewPolicy,
    );
    expect(dungeon.packageManifest.reviewPolicy).toEqual({
      version: 'three-pass-v1',
      minimumRubricScore: 44,
      targetVerified: 150,
      sourcePolicy: 'guide-linked-official',
    });
    expect(
      dungeon.findings.filter((finding) => finding.severity !== 'warning'),
    ).toEqual([]);
  });

  it('binds every approved option, final rubric and all three independent passes to current facts', async () => {
    const dungeon = await loadDungeonPackage(id);
    const stages = validationMetadataSchema.parse(dungeon.validationMetadata);
    const authored = questionSchema.array().parse(read(id, 'questions.json'));
    const objectiveHash = objectiveFingerprint(dungeon.taxonomy);
    expect(dungeon.allQuestions).toHaveLength(authored.length);
    expect(dungeon.reviews.reviews).toHaveLength(authored.length);
    for (const question of dungeon.reviewedQuestions) {
      const pass = stages.encounters[question.id];
      const envelope = dungeon.encounterMetadata.encounters[question.id];
      const final = dungeon.reviews.reviews.find(
        (review) => review.questionId === question.id,
      )!;
      const hash = questionFingerprint(question);
      expect(pass.generation.questionFingerprint).toBe(hash);
      expect(pass.technical?.review.questionFingerprint).toBe(hash);
      expect(pass.adversarial?.questionFingerprint).toBe(hash);
      expect(
        new Set([
          pass.generation.authorId,
          pass.technical?.review.reviewerId,
          pass.adversarial?.reviewerId,
        ]).size,
      ).toBe(3);
      expect(pass.technical?.review.verdict).toBe('verified');
      expect(pass.adversarial?.verdict).toBe('verified');
      expect(pass.adversarial?.objectiveFingerprint).toBe(objectiveHash);
      expect(
        pass.adversarial?.optionChallenges
          .map((choice) => choice.choiceId)
          .sort(),
      ).toEqual(question.answerChoices.map((choice) => choice.id).sort());
      expect(final.reviewedAt).toBe(pass.adversarial?.reviewedAt);
      expect(envelope.rubric?.reviewedAt).toBe(final.reviewedAt);
      expect(envelope.rubric?.objectiveFingerprint).toBe(objectiveHash);
      expect(envelope.rubric?.version).toBe(2);
      expect(passesRealismRubric(envelope.rubric, 44)).toBe(true);
      expect(
        question.sourceUrls.every(
          (url) => new URL(url).hostname === 'learn.microsoft.com',
        ),
      ).toBe(true);
    }
  });

  it('releases 115-150 eligible reviewed encounters with both modes and complete skill breadth', async () => {
    const dungeon = await loadDungeonPackage(id);
    const report = buildContentReport(dungeon);
    const eligible = eligibleQuestions(dungeon.questions, {
      ...defaultConfig,
      credentialId: id,
    });
    expect(
      new Set(
        eligible.map((question) => question.conceptId.trim().toLowerCase()),
      ).size,
      'The full release bank must not count multiple representatives of one fact.',
    ).toBe(eligible.length);
    expect(eligible.length).toBeGreaterThanOrEqual(115);
    expect(eligible.length).toBeLessThanOrEqual(150);
    expect(eligible).toEqual(dungeon.reviewedQuestions);
    expect(dungeon.credential).toMatchObject({
      status: 'active',
      isVerified: true,
      contentReadiness: 'ready',
      verifiedQuestionCount: eligible.length,
    });
    expect(dungeon.credential.allowBetaPlay).not.toBe(true);
    expect(dungeon.credential.sealedReason).toBeUndefined();
    expect(dungeon.readiness).toMatchObject({ study: true, gauntlet: true });
    const stats = buildContentStats(
      eligible,
      dungeon.taxonomy,
      dungeon.objectiveVersion,
      [],
      dungeon.packageManifest.readinessThresholds,
    );
    expect(stats.coveredFloorCount).toBe(stats.majorFloorCount);
    expect(stats.coveredSkillCount).toBe(stats.skillCount);
    expect(stats.bossQuestionCount).toBeGreaterThan(0);
    expect(
      eligible.filter((question) => question.complexity !== 'concept-recall')
        .length / eligible.length,
    ).toBeGreaterThanOrEqual(0.4);
    expect(report.totalQuestions).toBe(dungeon.allQuestions.length);
    expect(report.reviewedVerifiedQuestions).toBe(eligible.length);
    expect(report.playableVerifiedQuestions).toBe(eligible.length);
    expect(
      filterCredentials(credentials, {
        heroClassId: 'wanderer',
        query: id.toUpperCase(),
      }).map((entry) => entry.credentialId),
    ).toEqual([id]);
    const availableIds = new Set(eligible.map((question) => question.id));
    for (const question of dungeon.allQuestions) {
      if (
        question.verificationStatus !== 'verified' ||
        question.requiresManualReview
      )
        expect(availableIds.has(question.id)).toBe(false);
    }
  });

  it('accepts persisted Study and Boss configurations without leaking Boss answers', async () => {
    const dungeon = await loadDungeonPackage(id);
    for (const mode of [
      { runMode: 'study', answerMode: 'immediate' },
      { runMode: 'gauntlet', answerMode: 'immediate' },
      { runMode: 'study', answerMode: 'exam' },
    ]) {
      const imported = configSchema.parse({
        ...defaultConfig,
        credentialId: id,
        questionCount: 50,
        ...mode,
      });
      const selection = planDungeonSession(
        [dungeon],
        imported,
        [],
        {},
        () => 0.5,
      );
      if (!selection.ok) throw new Error(selection.warnings.join(' '));
      const { plan } = selection;
      expect(plan.questions).toHaveLength(50);
      expect(new Set(plan.questions.map((question) => question.id)).size).toBe(
        50,
      );
      expect(
        new Set(
          plan.questions.map((question) =>
            question.conceptId.trim().toLowerCase(),
          ),
        ).size,
      ).toBe(50);
      expect(plan.objectiveSnapshots[id]).toEqual(dungeon.taxonomy);
      for (const question of plan.questions) {
        const original = dungeon.questions.find(
          (item) => item.id === question.id,
        );
        if (!original)
          throw new Error(`Unreviewed encounter selected: ${question.id}`);
        expect(question).toEqual({
          ...original,
          answerChoices: expect.arrayContaining(original.answerChoices),
        });
        expect(question.answerChoices).toHaveLength(
          original.answerChoices.length,
        );
        expect(plan.questionOrigins[question.id]).toMatchObject({
          credentialId: id,
          objectiveVersion: dungeon.objectiveVersion,
        });
      }
      const boss = mode.runMode === 'gauntlet' || mode.answerMode === 'exam';
      expect(plan.config.runMode).toBe(boss ? 'gauntlet' : 'study');
      expect(plan.config.answerMode).toBe(boss ? 'exam' : 'immediate');
      expect(feedbackVisibility(plan.config.answerMode, true).answer).toBe(
        !boss,
      );
      expect(feedbackVisibility(plan.config.answerMode, true).sources).toBe(
        !boss,
      );
      expect(
        feedbackVisibility(plan.config.answerMode, true, true).answer,
      ).toBe(true);
    }
  });

  it('still rejects unavailable identities through direct and raid configurations', async () => {
    const dungeon = await loadDungeonPackage(id);
    const dp700 = await loadDungeonPackage('dp-700');
    const unavailable = [
      { ...dungeon.credential, isVerified: false },
      ...(
        [
          'unverified',
          'announced',
          'beta',
          'retiring',
          'retired',
          'replaced',
        ] as const
      ).map((status) => ({
        ...dungeon.credential,
        status,
        allowBetaPlay: false,
      })),
    ];
    for (const credential of unavailable) {
      const locked = { ...dungeon, credential };
      for (const runMode of ['study', 'gauntlet', 'raid'] as const)
        expect(
          planDungeonSession([locked, dp700], {
            ...defaultConfig,
            credentialId: id,
            runMode,
            raidCredentialIds: [id, 'dp-700'],
          }).ok,
        ).toBe(false);
    }
  });
});

it('excludes the held AI-103 workflow-resume revision from the release', async () => {
  const dungeon = await loadDungeonPackage('ai-103');
  expect(dungeon.questions.map(questionFingerprint)).not.toContain(
    'd1b43fda08dd9389f2f7070efdaa153ad239629f591b820442256ee2b06a79a8',
  );
});

it('balances both released AI dungeons and DP-700 in an imported raid', async () => {
  const ids = ['ai-103', 'ai-200', 'dp-700'];
  const dungeons = await Promise.all(ids.map((id) => loadDungeonPackage(id)));
  for (const answerMode of ['immediate', 'exam'] as const) {
    const selection = planDungeonSession(
      dungeons,
      configSchema.parse({
        ...defaultConfig,
        credentialId: 'ai-103',
        runMode: 'raid',
        raidCredentialIds: ids,
        questionCount: 30,
        answerMode,
      }),
      [],
      {},
      () => 0.5,
    );
    if (!selection.ok) throw new Error(selection.warnings.join(' '));
    expect(selection.plan.questions).toHaveLength(30);
    for (const dungeon of dungeons) {
      const id = dungeon.credential.credentialId;
      const origins = Object.entries(selection.plan.questionOrigins).filter(
        ([, origin]) => origin.credentialId === id,
      );
      expect(origins).toHaveLength(10);
      const availableIds = new Set(
        dungeon.questions.map((question) => question.id),
      );
      expect(
        origins.every(([questionId]) => availableIds.has(questionId)),
      ).toBe(true);
      expect(selection.plan.objectiveSnapshots[id]).toEqual(dungeon.taxonomy);
    }
    expect(
      new Set(
        selection.plan.questions.map((question) =>
          question.conceptId.trim().toLowerCase(),
        ),
      ).size,
    ).toBe(30);
    expect(
      feedbackVisibility(selection.plan.config.answerMode, true).answer,
    ).toBe(answerMode !== 'exam');
  }
});

it('preserves legacy AI-103 objective and question identities without inheriting old review approval', () => {
  const oldMap = taxonomySchema.parse(
    read('ai-103', join('history', 'pre-three-pass', 'objectives.json')),
  );
  const currentMap = taxonomySchema.parse(read('ai-103', 'objectives.json'));
  expect(objectiveFingerprint(currentMap)).toBe(objectiveFingerprint(oldMap));
  expect(Date.parse(currentMap.retrievedAt)).toBeGreaterThan(
    Date.parse(oldMap.retrievedAt),
  );
  const oldQuestions = questionSchema
    .array()
    .parse(read('ai-103', join('history', 'pre-three-pass', 'questions.json')));
  const current = questionSchema
    .array()
    .parse(read('ai-103', 'questions.json'));
  expect(oldQuestions).toHaveLength(30);
  for (const prior of oldQuestions) {
    const regenerated = current.find((question) => question.id === prior.id);
    if (!regenerated) continue;
    expect(regenerated.conceptId).toBe(prior.conceptId);
    expect(regenerated.generatedAt).not.toBe(prior.generatedAt);
    expect(questionFingerprint(regenerated)).not.toBe(
      questionFingerprint(prior),
    );
  }
});
