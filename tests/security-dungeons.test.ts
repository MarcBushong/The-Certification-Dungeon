import { beforeEach, describe, expect, it } from 'vitest';
import consolidatedReviews from '../src/data/verification-reviews.json';
import {
  getDungeonPackage,
  listDungeons,
} from '../src/features/dungeons/packages';
import {
  objectiveFingerprint,
  questionFingerprint,
} from '../src/features/dungeons/review';
import { passesRealismRubric } from '../src/features/dungeons/readiness';
import { planDungeonSession } from '../src/features/quiz/dungeonRuntime';
import { feedbackVisibility } from '../src/features/quiz/engine';
import {
  defaultConfig,
  sessionResultSchema,
  type QuizConfig,
} from '../src/features/quiz/types';
import { scoreSession } from '../src/features/results/scoring';
import {
  addResult,
  freshData,
  loadData,
  rememberQuestion,
  saveData,
} from '../src/services/storage';

const securityIds = ['sc-200', 'sc-500'] as const;

function dungeon(id: string) {
  const value = getDungeonPackage(id);
  if (!value) throw new Error(`Missing installed dungeon: ${id}`);
  return value;
}

function plan(id: string, overrides: Partial<QuizConfig> = {}) {
  const selection = planDungeonSession(
    [dungeon(id)],
    { ...defaultConfig, credentialId: id, questionCount: 50, ...overrides },
    [],
    {},
    () => 0.5,
  );
  if (!selection.ok) throw new Error(selection.warnings.join(' '));
  return selection.plan;
}

function completedRun(id: string) {
  const selected = plan(id, { questionCount: 5 });
  const now = new Date().toISOString();
  return sessionResultSchema.parse({
    ...selected,
    id: `security-release-${id}`,
    startedAt: now,
    completedAt: now,
    responses: selected.questions.map((question, index) => ({
      questionId: question.id,
      selectedAnswer: index === 0 ? [] : question.correctAnswer,
      timeMs: 1000,
      flagged: index === 0,
      submittedAt: now,
      timedOut: false,
    })),
  });
}

beforeEach(() => localStorage.clear());

describe('released security dungeon packages', () => {
  it.each(securityIds)(
    '%s exposes 150 reviewed encounters with current objective and ledger bindings',
    (id) => {
      const installed = dungeon(id);
      expect(installed.questions).toHaveLength(150);
      expect(installed.credential.verifiedQuestionCount).toBe(150);
      expect(installed.readiness).toEqual({
        study: true,
        gauntlet: true,
        reasons: [],
      });
      expect(
        installed.findings.filter((finding) => finding.severity === 'error'),
      ).toEqual([]);
      expect(
        listDungeons().find((entry) => entry.credentialId === id),
      ).toMatchObject({
        verifiedQuestionCount: 150,
        contentReadiness: 'ready',
      });
      const outline = objectiveFingerprint(installed.taxonomy);
      for (const question of installed.questions) {
        const review = installed.reviews.reviews.find(
          (entry) => entry.questionId === question.id,
        );
        const metadata = installed.encounterMetadata.encounters[question.id];
        expect(question.verificationStatus).toBe('verified');
        expect(question.requiresManualReview).toBe(false);
        expect(review?.questionFingerprint).toBe(questionFingerprint(question));
        expect(
          consolidatedReviews.reviews.filter(
            (entry) => entry.questionId === question.id,
          ),
        ).toEqual([review]);
        expect(metadata.rubric?.objectiveFingerprint).toBe(outline);
        expect(metadata.rubric?.objectiveVersion).toBe(
          installed.objectiveVersion,
        );
        expect(passesRealismRubric(metadata.rubric)).toBe(true);
      }
    },
  );

  it.each(securityIds)(
    '%s samples every published subskill and meets the mature-bank difficulty target',
    (id) => {
      const { questions, taxonomy } = dungeon(id);
      expect(
        questions.filter((question) =>
          ['advanced', 'expert'].includes(question.difficulty),
        ).length / questions.length,
      ).toBeGreaterThanOrEqual(0.4);
      for (const domain of taxonomy.domains) {
        const domainQuestions = questions.filter(
          (question) => question.objectiveDomain === domain.id,
        );
        expect(domainQuestions.length).toBeGreaterThan(0);
        for (const skill of domain.skills) {
          const skillQuestions = domainQuestions.filter(
            (question) => question.skill === skill.id,
          );
          expect(skillQuestions.length).toBeGreaterThanOrEqual(2);
          for (const subskill of skill.subskills)
            expect(
              skillQuestions.some((question) => question.subskill === subskill),
              `${id}: ${subskill}`,
            ).toBe(true);
        }
      }
    },
  );

  it.each(securityIds)(
    '%s supports full-size Study, weighted Gauntlets and exact floor filtering',
    (id) => {
      const installed = dungeon(id);
      for (const runMode of ['study', 'gauntlet'] as const) {
        const selected = plan(id, { runMode });
        expect(selected.questions).toHaveLength(50);
        expect(
          new Set(selected.questions.map((question) => question.id)).size,
        ).toBe(50);
        expect(selected.objectiveSnapshots[id]).toEqual(installed.taxonomy);
        expect(
          Object.values(selected.questionOrigins).every(
            (origin) =>
              origin.credentialId === id &&
              origin.objectiveVersion === installed.objectiveVersion,
          ),
        ).toBe(true);
        if (runMode === 'gauntlet') {
          expect(selected.config.answerMode).toBe('exam');
          expect(feedbackVisibility(selected.config.answerMode, true)).toEqual({
            answer: false,
            explanation: false,
            sources: false,
            coaching: false,
          });
          for (const domain of installed.taxonomy.domains) {
            const count = selected.questions.filter(
              (question) => question.objectiveDomain === domain.id,
            ).length;
            const weights = domain.weightRange;
            expect(weights).toBeDefined();
            if (!weights)
              throw new Error('Security guide weighting is missing.');
            expect(count).toBeGreaterThanOrEqual(Math.floor(weights[0] / 2));
            expect(count).toBeLessThanOrEqual(Math.ceil(weights[1] / 2));
          }
        }
      }
      for (const domain of installed.taxonomy.domains) {
        const selected = plan(id, {
          questionCount: 5,
          objectiveDomains: [domain.id],
        });
        expect(selected.questions).toHaveLength(5);
        expect(
          selected.questions.every(
            (question) => question.objectiveDomain === domain.id,
          ),
        ).toBe(true);
      }
    },
  );

  it('balances both security banks with DP-700 in exam-mode raids', () => {
    const ids = ['dp-700', ...securityIds];
    const selected = planDungeonSession(
      ids.map(dungeon),
      {
        ...defaultConfig,
        runMode: 'raid',
        raidCredentialIds: ids,
        answerMode: 'exam',
        questionCount: 30,
      },
      [],
      {},
      () => 0.5,
    );
    if (!selected.ok) throw new Error(selected.warnings.join(' '));
    expect(selected.plan.questions).toHaveLength(30);
    expect(selected.plan.config.runMode).toBe('raid');
    for (const id of ids)
      expect(
        Object.values(selected.plan.questionOrigins).filter(
          (origin) => origin.credentialId === id,
        ),
      ).toHaveLength(10);
  });

  it('preserves completed DP-700 and security runs with isolated local histories and objective scores', () => {
    const legacy = completedRun('dp-700');
    let data = addResult(freshData(), legacy);
    for (const id of securityIds) {
      const completed = completedRun(id);
      const score = scoreSession(completed);
      expect(score).toMatchObject({
        correct: 4,
        unanswered: 1,
        percentage: 80,
      });
      expect(score.byCredential.map((row) => row.id)).toEqual([id]);
      expect(score.byDomain.reduce((sum, row) => sum + row.total, 0)).toBe(5);
      data = addResult(data, completed);
      data = rememberQuestion(data, completed.questions[0].id, id);
    }
    expect(saveData(localStorage, data)).toBeNull();
    const restored = loadData(localStorage);
    expect(restored.error).toBeNull();
    expect(restored.data.history).toEqual(data.history);
    expect(
      restored.data.history.find((entry) => entry.id === legacy.id),
    ).toEqual(legacy);
    expect(restored.data.recentQuestionIds).toEqual([]);
    for (const id of securityIds)
      expect(restored.data.recentQuestionIdsByCredential[id]).toHaveLength(1);
    expect(
      dungeon('sc-200').questions.filter((question) =>
        /^sc200-0(?:0[1-9]|[12]\d|30)$/.test(question.id),
      ),
    ).toHaveLength(30);
  });
});
