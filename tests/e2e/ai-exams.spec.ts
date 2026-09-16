import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadTestDungeonPackage } from './dungeon-fixtures';
import {
  questionSchema,
  taxonomySchema,
  type Question,
} from '../../src/features/grounding/schema';
import { validationMetadataSchema } from '../../src/features/dungeons/threePass';
import { objectiveFingerprint } from '../../src/features/dungeons/review';
import { scoreSession } from '../../src/features/results/scoring';
import {
  defaultConfig,
  sessionResultSchema,
  type QuizConfig,
} from '../../src/features/quiz/types';
import {
  addResult,
  freshData,
  savedDataSchema,
  STORAGE_KEY,
} from '../../src/services/storage';

const root = join(process.cwd(), 'src', 'content', 'exams');

async function saved(page: Page) {
  return savedDataSchema.parse(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
      STORAGE_KEY,
    ),
  );
}

async function visibleQuestion(page: Page, questions: Question[]) {
  const stem = (await page.locator('legend.question-title').innerText())
    .replace(/\s+/g, ' ')
    .trim();
  const question = questions.find(
    (item) => item.question.replace(/\s+/g, ' ').trim() === stem,
  );
  if (!question)
    throw new Error('Visible encounter is not in the eligible bank.');
  return question;
}

async function chooseCorrectAnswers(page: Page, question: Question) {
  for (const choice of question.answerChoices.filter((option) =>
    question.correctAnswer.includes(option.id),
  ))
    await page
      .getByRole(
        question.questionType === 'multi-select' ? 'checkbox' : 'radio',
        { name: choice.text, exact: true },
      )
      .check();
}

test('both released AI dungeons expose reviewed content and preserve isolated historical progress', async ({
  page,
  baseURL,
}) => {
  test.setTimeout(60000);
  const remoteRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== new URL(baseURL!).origin)
      remoteRequests.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const legacyRoot = join(root, 'ai-103', 'history', 'pre-three-pass');
  const legacyQuestion = questionSchema
    .array()
    .parse(
      JSON.parse(readFileSync(join(legacyRoot, 'questions.json'), 'utf8')),
    )[0];
  const legacyObjectives = taxonomySchema.parse(
    JSON.parse(readFileSync(join(legacyRoot, 'objectives.json'), 'utf8')),
  );
  const now = new Date().toISOString();
  // A synthetic completed run of the genuine archived question tests history, not new eligibility.
  const historical = sessionResultSchema.parse({
    id: 'ai103-legacy-history-fixture',
    credentialId: 'ai-103',
    startedAt: now,
    completedAt: now,
    groundedAt: legacyObjectives.retrievedAt,
    config: { ...defaultConfig, credentialId: 'ai-103', questionCount: 1 },
    questions: [legacyQuestion],
    responses: [
      {
        questionId: legacyQuestion.id,
        selectedAnswer: legacyQuestion.correctAnswer,
        timeMs: 10,
        flagged: false,
        submittedAt: now,
        timedOut: false,
      },
    ],
    questionOrigins: {
      [legacyQuestion.id]: {
        credentialId: 'ai-103',
        objectiveVersion: legacyObjectives.studyGuideEffectiveDate,
      },
    },
    objectiveSnapshots: { 'ai-103': legacyObjectives },
  });
  const completed = [historical];
  await page.addInitScript(
    ({ key, data }) => {
      if (localStorage.getItem(key) === null)
        localStorage.setItem(key, JSON.stringify(data));
    },
    {
      key: STORAGE_KEY,
      data: addResult(freshData(), historical),
    },
  );
  await page.goto('./');
  await expect(page.getByRole('main')).toBeVisible({ timeout: 30000 });
  for (const id of ['ai-103', 'ai-200']) {
    const dungeon = loadTestDungeonPackage(id);
    const { questions, taxonomy } = dungeon;
    const stages = validationMetadataSchema.parse(dungeon.validationMetadata);
    expect(dungeon.credential).toMatchObject({
      status: 'active',
      isVerified: true,
      contentReadiness: 'ready',
    });
    expect(questions.length).toBeGreaterThanOrEqual(115);
    expect(questions.length).toBeLessThanOrEqual(150);
    expect(dungeon.readiness).toMatchObject({ study: true, gauntlet: true });
    await page.goto('./');
    const card = page.locator(`#dungeon-${id}`);
    await expect(card).toBeVisible({
      timeout: 30000,
    });
    await expect(card.locator('.encounter-count')).toContainText(
      String(questions.length),
    );
    await expect(
      card.getByRole('button', { name: 'Sealed', exact: true }),
    ).toHaveCount(0);
    await expect(
      card.getByRole('button', { name: 'Boss Gauntlet', exact: true }),
    ).toBeEnabled();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const descend = card.getByRole('button', {
      name: 'Descend',
      exact: true,
    });
    await expect(descend).toBeEnabled();
    await descend.focus();
    await page.keyboard.press('Enter');
    await page.getByRole('radio', { name: '5', exact: true }).check();
    const start = page.getByRole('button', { name: 'Descend', exact: true });
    await start.focus();
    await page.keyboard.press('Enter');
    for (let index = 0; index < 5; index++) {
      await expect(
        page.locator('.question-panel .dungeon-origin'),
      ).toHaveAttribute('data-dungeon-id', id);
      const question = await visibleQuestion(page, questions);
      expect(question.verificationStatus).toBe('verified');
      expect(stages.encounters[question.id].technical?.review.verdict).toBe(
        'verified',
      );
      expect(stages.encounters[question.id].adversarial?.verdict).toBe(
        'verified',
      );
      await expect(page.locator('.question-feedback')).toHaveCount(0);
      if (index === 0)
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa'])
              .analyze()
          ).violations,
        ).toEqual([]);
      await chooseCorrectAnswers(page, question);
      const submit = page.getByRole('button', {
        name: 'Submit answer',
        exact: true,
      });
      await submit.focus();
      await page.keyboard.press('Enter');
      await expect(
        page.locator('.question-feedback').getByText(question.explanation, {
          exact: true,
        }),
      ).toBeVisible();
      await page
        .locator('.question-feedback summary')
        .filter({ hasText: /other choices/ })
        .click();
      for (const reason of Object.values(question.whyOtherAnswersAreWrong))
        await expect(
          page.locator('.question-feedback').getByText(reason, { exact: true }),
        ).toBeVisible();
      const tomeButton = page.getByRole('button', {
        name: 'Open tome · view sources',
        exact: true,
      });
      await tomeButton.focus();
      await page.keyboard.press('Enter');
      const links = page.getByRole('dialog').getByRole('link');
      await expect(links).toHaveCount(question.sourceUrls.length);
      for (let source = 0; source < question.sourceUrls.length; source++) {
        await expect(links.nth(source)).toHaveAttribute(
          'href',
          question.sourceUrls[source],
        );
        await expect(links.nth(source)).toHaveAttribute(
          'rel',
          'noopener noreferrer',
        );
      }
      await page.keyboard.press('Escape');
      await expect(tomeButton).toBeFocused();
      await page
        .getByRole('button', {
          name: index === 4 ? 'View results' : 'Next question',
          exact: true,
        })
        .click();
    }
    await page.waitForURL(/\/results\//);
    const state = await saved(page);
    const result = state.history[0];
    expect(scoreSession(result).percentage).toBe(100);
    expect(scoreSession(result).byDungeon.map((row) => row.id)).toEqual([id]);
    expect(
      Object.values(result.questionOrigins ?? {}).map(
        (origin) => origin.credentialId,
      ),
    ).toEqual(Array(5).fill(id));
    expect(objectiveFingerprint(result.objectiveSnapshots![id])).toBe(
      objectiveFingerprint(taxonomy),
    );
    for (const previous of completed)
      expect(state.history.find((entry) => entry.id === previous.id)).toEqual(
        previous,
      );
    completed.push(result);
    await page.reload();
    expect((await saved(page)).history[0]).toEqual(result);
  }
  expect(remoteRequests).toEqual([]);
});

const importedRuns: {
  name: string;
  config: Partial<QuizConfig> & { credentialId: string };
  ids: string[];
}[] = ['ai-103', 'ai-200'].flatMap((id) =>
  (
    [
      { name: 'Study', runMode: 'study', answerMode: 'immediate' },
      { name: 'Boss', runMode: 'gauntlet', answerMode: 'immediate' },
      { name: 'legacy exam', runMode: 'study', answerMode: 'exam' },
    ] as const
  ).map(({ name, runMode, answerMode }) => ({
    name: `${id} ${name}`,
    config: { credentialId: id, runMode, answerMode },
    ids: [id],
  })),
);
for (const answerMode of ['immediate', 'exam'] as const)
  importedRuns.push({
    name: `AI and DP-700 raid/${answerMode}`,
    config: {
      credentialId: 'ai-103',
      runMode: 'raid',
      raidCredentialIds: ['ai-103', 'ai-200', 'dp-700'],
      answerMode,
    },
    ids: ['ai-103', 'ai-200', 'dp-700'],
  });

for (const run of importedRuns) {
  test(`imported ${run.name} completes with scoped scores and correct answer visibility`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    const dungeons = run.ids.map((id) => loadTestDungeonPackage(id));
    const questions = dungeons.flatMap((dungeon) => dungeon.questions);
    const data = freshData();
    data.selectedCredentialId = run.config.credentialId;
    data.config = { ...defaultConfig, questionCount: 3, ...run.config };
    await page.addInitScript(
      ({ key, imported }) => {
        if (!localStorage.getItem(key))
          localStorage.setItem(key, JSON.stringify(imported));
      },
      { key: STORAGE_KEY, imported: data },
    );
    await page.goto('./#/setup');
    await expect(page.locator('form.setup-layout')).toBeVisible({
      timeout: 30000,
    });
    const start = page.getByRole('button', { name: 'Descend', exact: true });
    await expect(start).toBeEnabled();
    await start.focus();
    await page.keyboard.press('Enter');
    const boss =
      run.config.runMode === 'gauntlet' || run.config.answerMode === 'exam';
    for (let index = 0; index < 3; index++) {
      const question = await visibleQuestion(page, questions);
      expect(question.verificationStatus).toBe('verified');
      await expect(page.locator('.question-feedback')).toHaveCount(0);
      if (boss)
        await expect(
          page.getByRole('button', {
            name: 'Open tome · view sources',
            exact: true,
          }),
        ).toHaveCount(0);
      await chooseCorrectAnswers(page, question);
      await page
        .getByRole('button', { name: 'Submit answer', exact: true })
        .click();
      if (boss) {
        await expect(page.locator('.question-feedback')).toHaveCount(0);
        await expect(
          page.getByText(question.explanation, { exact: true }),
        ).toHaveCount(0);
      } else {
        await expect(page.locator('.question-feedback')).toContainText(
          question.explanation,
        );
      }
      await page
        .getByRole('button', {
          name: index === 2 ? 'View results' : 'Next question',
          exact: true,
        })
        .click();
    }
    await page.waitForURL(/\/results\//);
    const state = await saved(page);
    expect(state.history).toHaveLength(1);
    const result = state.history[0];
    expect(result.config.answerMode).toBe(boss ? 'exam' : 'immediate');
    expect(result.config.runMode).toBe(
      run.config.runMode === 'raid' ? 'raid' : boss ? 'gauntlet' : 'study',
    );
    expect(scoreSession(result).percentage).toBe(100);
    expect(
      scoreSession(result)
        .byDungeon.map((entry) => entry.id)
        .sort(),
    ).toEqual([...run.ids].sort());
    for (const dungeon of dungeons) {
      const id = dungeon.credential.credentialId;
      expect(result.objectiveSnapshots?.[id]).toEqual(dungeon.taxonomy);
      expect(state.recentQuestionIdsByCredential[id].length).toBeGreaterThan(0);
    }
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Expedition complete.' }),
    ).toBeVisible();
    expect((await saved(page)).history[0]).toEqual(result);
  });
}
