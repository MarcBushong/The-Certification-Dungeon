import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Question } from '../../src/features/grounding/schema';
import { scoreSession } from '../../src/features/results/scoring';
import { savedDataSchema, STORAGE_KEY } from '../../src/services/storage';
import { loadTestDungeonPackage } from './dungeon-fixtures';

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
    (candidate) => candidate.question.replace(/\s+/g, ' ').trim() === stem,
  );
  if (!question)
    throw new Error('Visible security encounter is not in its reviewed bank.');
  return question;
}

for (const id of ['sc-200', 'sc-500']) {
  for (const boss of [false, true]) {
    test(`${id} ${boss ? 'Gauntlet' : 'Study'} supports keyboard play, scoped results and local persistence`, async ({
      page,
      baseURL,
    }) => {
      test.setTimeout(60000);
      const dungeon = loadTestDungeonPackage(id);
      expect(dungeon.questions).toHaveLength(150);
      expect(dungeon.readiness).toMatchObject({
        study: true,
        gauntlet: true,
      });
      const remoteRequests: string[] = [];
      page.on('request', (request) => {
        if (new URL(request.url()).origin !== new URL(baseURL!).origin)
          remoteRequests.push(request.url());
      });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('./');
      const card = page.locator(`#dungeon-${id}`);
      await expect(card.locator('.encounter-count')).toContainText('150');
      const door = card.getByRole('button', {
        name: boss ? 'Boss Gauntlet' : 'Descend',
        exact: true,
      });
      await expect(door).toBeEnabled();
      await door.focus();
      await page.keyboard.press('Enter');
      await page.waitForURL(/#\/setup$/);
      await page.getByRole('radio', { name: '5', exact: true }).check();
      const start = page.getByRole('button', { name: 'Descend', exact: true });
      await start.focus();
      await page.keyboard.press('Enter');
      for (let index = 0; index < 5; index++) {
        await expect(
          page.locator('.question-panel .dungeon-origin'),
        ).toHaveAttribute('data-dungeon-id', id);
        const question = await visibleQuestion(page, dungeon.questions);
        expect(question.verificationStatus).toBe('verified');
        await expect(page.locator('.question-feedback')).toHaveCount(0);
        if (index === 0 && !boss) {
          expect(
            (
              await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa'])
                .analyze()
            ).violations,
          ).toEqual([]);
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= window.innerWidth,
            ),
          ).toBe(true);
        }
        for (const choice of question.answerChoices.filter((option) =>
          question.correctAnswer.includes(option.id),
        ))
          await page
            .getByRole(
              question.questionType === 'multi-select' ? 'checkbox' : 'radio',
              { name: choice.text, exact: true },
            )
            .check();
        const submit = page.getByRole('button', {
          name: 'Submit answer',
          exact: true,
        });
        await submit.focus();
        await page.keyboard.press('Enter');
        if (boss) {
          await expect(page.locator('.question-feedback')).toHaveCount(0);
          await expect(
            page.getByText(question.explanation, { exact: true }),
          ).toHaveCount(0);
          await expect(
            page.getByRole('button', {
              name: 'Open tome · view sources',
              exact: true,
            }),
          ).toHaveCount(0);
        } else {
          await expect(page.locator('.question-feedback')).toContainText(
            question.explanation,
          );
          if (index === 0) {
            await page
              .locator('.question-feedback summary')
              .filter({ hasText: /other choices/ })
              .click();
            for (const reason of Object.values(
              question.whyOtherAnswersAreWrong,
            ))
              await expect(
                page
                  .locator('.question-feedback')
                  .getByText(reason, { exact: true }),
              ).toBeVisible();
            const tome = page.getByRole('button', {
              name: 'Open tome · view sources',
              exact: true,
            });
            await tome.focus();
            await page.keyboard.press('Enter');
            const links = page.getByRole('dialog').getByRole('link');
            await expect(links).toHaveCount(question.sourceUrls.length);
            for (
              let source = 0;
              source < question.sourceUrls.length;
              source++
            ) {
              await expect(links.nth(source)).toHaveAttribute(
                'href',
                question.sourceUrls[source],
              );
              await expect(links.nth(source)).toHaveAttribute(
                'rel',
                'noopener noreferrer',
              );
              await expect(links.nth(source)).toHaveAttribute(
                'target',
                '_blank',
              );
            }
            await page.keyboard.press('Escape');
            await expect(tome).toBeFocused();
          }
        }
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
      const score = scoreSession(result);
      expect(score.percentage).toBe(100);
      expect(score.byDungeon.map((entry) => entry.id)).toEqual([id]);
      expect(score.byDomain.reduce((sum, row) => sum + row.total, 0)).toBe(5);
      expect(result.config.answerMode).toBe(boss ? 'exam' : 'immediate');
      expect(result.objectiveSnapshots?.[id]).toEqual(dungeon.taxonomy);
      expect(state.recentQuestionIdsByCredential[id]).toHaveLength(5);
      expect(
        state.recentQuestionIdsByCredential[
          id === 'sc-200' ? 'sc-500' : 'sc-200'
        ] ?? [],
      ).toEqual([]);
      await page.reload();
      await expect(
        page.getByRole('heading', { name: 'Expedition complete.' }),
      ).toBeVisible();
      expect((await saved(page)).history[0]).toEqual(result);
      await page.goto('./');
      await expect(
        page
          .locator('#dungeon-dp-700')
          .getByRole('button', { name: 'Boss Gauntlet', exact: true }),
      ).toBeEnabled();
      expect(remoteRequests).toEqual([]);
    });
  }
}
