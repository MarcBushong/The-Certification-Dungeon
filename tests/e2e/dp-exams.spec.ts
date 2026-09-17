import { test, expect, type Page } from '@playwright/test';
import { loadTestDungeonPackage } from './dungeon-fixtures';
import AxeBuilder from '@axe-core/playwright';
import { validationMetadataSchema } from '../../src/features/dungeons/threePass';
import { scoreSession } from '../../src/features/results/scoring';
import { result as savedHistoryFixture } from '../fixtures';
import {
  freshData,
  savedDataSchema,
  STORAGE_KEY,
} from '../../src/services/storage';

const loadDp800 = () => loadTestDungeonPackage('dp-800');

async function saved(page: Page) {
  return savedDataSchema.parse(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
      STORAGE_KEY,
    ),
  );
}

test('DP-800 Advanced Study uses reviewed facts, exact tomes, objective scores and isolated progress while DP-420 stays sealed', async ({
  page,
}) => {
  const dungeon = loadDp800();
  expect(dungeon.readiness.study).toBe(true);
  expect(dungeon.questions.length).toBeGreaterThanOrEqual(25);
  const requestedCount = 5;
  const advancedConcepts = new Set(
    dungeon.questions
      .filter((question) => question.difficulty === 'advanced')
      .map((question) => question.conceptId.trim().toLowerCase()),
  ).size;
  const runCount = Math.min(requestedCount, advancedConcepts);
  expect(runCount).toBeGreaterThan(0);
  const stages = validationMetadataSchema.parse(dungeon.validationMetadata);
  await page.goto('./', { waitUntil: 'networkidle' });
  await page
    .locator('#dungeon-dp-800')
    .getByRole('button', { name: 'Descend', exact: true })
    .click();
  await page.waitForURL(/#\/setup$/);
  await page.getByLabel('Difficulty', { exact: true }).selectOption('advanced');
  await page.getByRole('radio', { name: '5', exact: true }).check();
  await expect(
    page.locator('.summary-list').getByText(`${runCount} unique questions`, {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Descend', exact: true }).click();
  if (runCount < requestedCount)
    await expect(
      page.getByRole('status', { name: 'Study notices' }),
    ).toContainText(`${runCount} unique questions, not ${requestedCount}`);
  for (let index = 0; index < runCount; index++) {
    await expect(
      page.locator('.question-panel .dungeon-origin'),
    ).toHaveAttribute('data-dungeon-id', 'dp-800');
    const stem = (await page.locator('legend.question-title').innerText())
      .replace(/\s+/g, ' ')
      .trim();
    const question = dungeon.questions.find(
      (candidate) => candidate.question.replace(/\s+/g, ' ').trim() === stem,
    );
    if (!question)
      throw new Error('Rendered facts are not a playable DP-800 record.');
    expect(question.difficulty).toBe('advanced');
    expect(question.verificationStatus).toBe('verified');
    expect(stages.encounters[question.id].technical?.review.verdict).toBe(
      'verified',
    );
    expect(stages.encounters[question.id].adversarial?.verdict).toBe(
      'verified',
    );
    for (const choice of question.answerChoices.filter((option) =>
      question.correctAnswer.includes(option.id),
    ))
      await page
        .getByRole(
          question.questionType === 'multi-select' ? 'checkbox' : 'radio',
          {
            name: choice.text,
            exact: true,
          },
        )
        .check();
    await page
      .getByRole('button', { name: 'Submit answer', exact: true })
      .click();
    await expect(
      page
        .locator('.question-feedback')
        .getByText(question.explanation, { exact: true }),
    ).toBeVisible();
    if (index === 0) {
      await page
        .locator('.question-feedback summary')
        .filter({ hasText: /other choices/ })
        .click();
      for (const reason of Object.values(question.whyOtherAnswersAreWrong))
        await expect(
          page.locator('.question-feedback').getByText(reason, { exact: true }),
        ).toBeVisible();
      await page
        .getByRole('button', { name: 'Open tome · view sources', exact: true })
        .click();
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
      const popup = page.context().waitForEvent('page');
      await links.first().click();
      const tome = await popup;
      await tome.waitForLoadState('domcontentloaded');
      const opened = new URL(tome.url());
      const expected = new URL(question.sourceUrls[0]);
      expect(opened.protocol).toBe('https:');
      expect(opened.hostname).toBe('learn.microsoft.com');
      expect(opened.pathname.replace(/\/$/, '')).toBe(
        expected.pathname.replace(/\/$/, ''),
      );
      await tome.close();
      await page.keyboard.press('Escape');
    }
    await page
      .getByRole('button', {
        name: index === runCount - 1 ? 'View results' : 'Next question',
        exact: true,
      })
      .click();
  }
  await page.waitForURL(/\/results\//);
  const before = await saved(page);
  const result = before.history[0];
  expect(result.questions).toHaveLength(runCount);
  const scores = scoreSession(result);
  expect(scores.percentage).toBe(100);
  expect(scores.byDungeon.map((row) => row.id)).toEqual(['dp-800']);
  expect(scores.byDomain.reduce((sum, row) => sum + row.total, 0)).toBe(
    runCount,
  );
  expect(result.objectiveSnapshots?.['dp-800'].studyGuideEffectiveDate).toBe(
    'March 12, 2026',
  );

  await page.goto('#/dungeons/dp-420');
  const cosmos = page.locator('#dungeon-dp-420');
  await expect(
    cosmos.getByRole('button', { name: 'Sealed', exact: true }),
  ).toBeDisabled();
  await expect(
    cosmos.getByRole('button', { name: 'Boss Gauntlet', exact: true }),
  ).toBeDisabled();
  await expect(cosmos).toContainText('October 6, 2026 future outline');
  expect(
    (await saved(page)).history.find((entry) => entry.id === result.id),
  ).toEqual(result);
  expect(
    (await saved(page)).recentQuestionIdsByCredential['dp-420'] ?? [],
  ).toEqual([]);

  await page.getByRole('link', { name: 'Dungeon map', exact: true }).click();
  await page.waitForURL(/#\/$/);
  await page
    .locator('#dungeon-dp-700')
    .getByRole('button', { name: 'Descend', exact: true })
    .click();
  await page.waitForURL(/#\/setup$/);
  await page
    .locator('form.setup-layout')
    .getByRole('button', { name: 'Descend', exact: true })
    .click();
  await expect(page.locator('.question-panel .dungeon-origin')).toHaveAttribute(
    'data-dungeon-id',
    'dp-700',
  );
});

test('DP-800 Boss remains sealed until independently verified skill breadth is complete', async ({
  page,
}) => {
  const dungeon = loadDp800();
  await page.goto('./', { waitUntil: 'networkidle' });
  const boss = page
    .locator('#dungeon-dp-800')
    .getByRole('button', { name: 'Boss Gauntlet', exact: true });
  expect(dungeon.questions).toHaveLength(109);
  expect(dungeon.readiness.gauntlet).toBe(false);
  expect(dungeon.readiness.reasons).toContain(
    'Boss Gauntlet needs verified breadth across every skill.',
  );
  await expect(boss).toBeDisabled();
});

test('DP-420 shows an accessible future-outline disclaimer without opening gameplay', async ({
  page,
}, testInfo) => {
  await page.goto('./', { waitUntil: 'networkidle' });
  await expect(page.locator('#dungeon-dp-420')).toBeVisible();
  const notice = page.getByRole('complementary', {
    name: 'DP-420 exam update',
  });
  await expect(notice).toContainText('October 6, 2026');
  await expect(notice).toContainText('not a verified current exam outline');
  await expect(notice).toContainText('no automatic unlock');
  const guide = notice.getByRole('link', {
    name: /^Official DP-420 study guide/,
  });
  await expect(guide).toHaveAttribute(
    'href',
    'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-420',
  );
  await expect(guide).toHaveAttribute('target', '_blank');
  await expect(guide).toHaveAttribute('rel', 'noopener noreferrer');
  expect(
    await notice.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  const accessibility = await new AxeBuilder({ page })
    .include('#dungeon-dp-420')
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.locator('#dungeon-dp-420').screenshot({
    path: testInfo.outputPath('dp420-disclaimer.png'),
  });
  const card = page.locator('#dungeon-dp-420');
  await expect(
    card.getByRole('button', { name: 'Sealed', exact: true }),
  ).toBeDisabled();
  await expect(
    card.getByRole('button', { name: 'Boss Gauntlet', exact: true }),
  ).toBeDisabled();
});

test('DP-420 cannot be opened by persisted setup configuration or keyboard navigation', async ({
  page,
}) => {
  await page.goto('./', { waitUntil: 'networkidle' });
  await expect(page.locator('#dungeon-dp-420')).toBeVisible();
  const before = freshData();
  await page.evaluate(
    ({ key, data }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          ...data,
          selectedCredentialId: 'dp-420',
          config: {
            ...data.config,
            credentialId: 'dp-420',
            runMode: 'gauntlet',
            answerMode: 'exam',
          },
        }),
      );
    },
    { key: STORAGE_KEY, data: before },
  );
  await page.goto('#/setup');
  await page.clock.setFixedTime(new Date('2026-10-06T12:00:00Z'));
  await page.reload({ waitUntil: 'networkidle' });
  const notice = page.getByRole('complementary', {
    name: 'DP-420 exam update',
  });
  await expect(notice).toContainText('October 6, 2026');
  await expect(notice).toContainText('DP-420 has no reviewed questions');
  await expect(
    page.getByText('This expedition is sealed.', { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Descend', exact: true }),
  ).toBeDisabled();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('.question-panel')).toHaveCount(0);
  expect((await saved(page)).history).toEqual(before.history);
});

test('DP-420 upcoming preview supports keyboard exploration and refresh without changing study data', async ({
  page,
}, testInfo) => {
  const initial = freshData();
  const history = savedHistoryFixture();
  const seed = savedDataSchema.parse({
    ...initial,
    config: { ...initial.config, questionCount: 10 },
    history: [history],
    recentQuestionIds: history.questions.map((question) => question.id),
    favoriteCredentialIds: ['dp-700', 'dp-800'],
  });
  await page.addInitScript(
    ({ key, data }) => {
      if (localStorage.getItem(key) === null)
        localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, data: seed },
  );
  await page.goto('./', { waitUntil: 'networkidle' });
  const before = await saved(page);
  await page
    .locator('#dungeon-dp-420')
    .getByRole('link', { name: 'Preview upcoming outline', exact: true })
    .click();
  await page.waitForURL(/#\/dungeons\/dp-420\/preview$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'The Cosmos Vault' }),
  ).toBeVisible();
  await expect(
    page.getByText('Read-only preview', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('complementary', { name: 'DP-420 exam update' }),
  ).toContainText('not a verified current exam outline');
  const firstSkill = page.locator('.preview-skill').first();
  await firstSkill.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(firstSkill).toHaveAttribute('open', '');
  await expect(
    firstSkill.getByText('Evaluate consistency levels', { exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator('.preview-skill summary').nth(1)).toBeFocused();
  await expect(page.locator('.preview-domain')).toHaveCount(3);
  await expect(page.locator('.preview-skill')).toHaveCount(12);
  await expect(page.locator('.preview-skill li')).toHaveCount(56);
  const resources = page.getByRole('complementary', {
    name: 'Official study resources',
  });
  await expect(resources).toContainText('October 6, 2026');
  await expect(resources).toContainText('2026-09-14T18:19:19.756Z');
  await expect(resources.getByRole('link')).toHaveCount(3);
  for (const link of await resources.getByRole('link').all()) {
    await expect(link).toHaveAttribute(
      'href',
      /^https:\/\/learn\.microsoft\.com\/en-us\//,
    );
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
  const accessibility = await new AxeBuilder({ page })
    .include('#main-content')
    .analyze();
  expect(accessibility.violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath('dp420-outline-preview.png'),
    fullPage: true,
  });
  await page.clock.setFixedTime(new Date('2026-10-06T12:00:00Z'));
  await page.reload({ waitUntil: 'networkidle' });
  await expect(
    page.getByText('Read-only preview', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('.question-panel')).toHaveCount(0);
  await page.getByRole('link', { name: 'Back to DP-420', exact: true }).click();
  const card = page.locator('#dungeon-dp-420');
  await expect(
    card.getByRole('button', { name: 'Sealed', exact: true }),
  ).toBeDisabled();
  await expect(
    card.getByRole('button', { name: 'Boss Gauntlet', exact: true }),
  ).toBeDisabled();
  const after = await saved(page);
  expect(after).toEqual(before);
});
