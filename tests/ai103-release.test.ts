import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { loadDungeonPackage } from '../scripts/content-files';
import { questionFingerprint } from '../src/features/dungeons/review';
import { planDungeonSession } from '../src/features/quiz/dungeonRuntime';
import { defaultConfig } from '../src/features/quiz/types';

const audit = join(
  'src',
  'content',
  'exams',
  'ai-103',
  'audit',
  'release-20260915',
);
const read = (name: string): unknown =>
  JSON.parse(readFileSync(join(audit, name), 'utf8'));
const fingerprint = z.string().regex(/^[a-f0-9]{64}$/);

describe('AI-103 reviewed release', () => {
  it('offers 115-150 distinct verified facts in both ordinary modes', async () => {
    const dungeon = await loadDungeonPackage('ai-103');
    expect(dungeon.credential.status).toBe('active');
    expect(dungeon.credential.isVerified).toBe(true);
    expect(dungeon.credential.contentReadiness).toBe('ready');
    expect(dungeon.questions.length).toBeGreaterThanOrEqual(115);
    expect(dungeon.questions.length).toBeLessThanOrEqual(150);
    expect(dungeon.questions).toEqual(dungeon.reviewedQuestions);
    expect(dungeon.allQuestions).toHaveLength(dungeon.questions.length);
    expect(dungeon.credential.verifiedQuestionCount).toBe(
      dungeon.questions.length,
    );
    expect(
      new Set(
        dungeon.questions.map((question) =>
          question.conceptId.trim().toLowerCase(),
        ),
      ).size,
    ).toBe(dungeon.questions.length);
    expect(dungeon.readiness).toMatchObject({ study: true, gauntlet: true });
    for (const runMode of ['study', 'gauntlet'] as const) {
      expect(
        planDungeonSession([dungeon], {
          ...defaultConfig,
          credentialId: 'ai-103',
          runMode,
        }).ok,
      ).toBe(true);
    }
  });

  it('binds the selected set to actual final reviews without admitting the duplicate', async () => {
    const selection = z
      .object({
        selectedCount: z.number().int(),
        selected: z.array(
          z.object({
            questionId: z.string(),
            questionFingerprint: fingerprint,
            finalReviewerId: z.string(),
            finalReviewedAt: z.string(),
          }),
        ),
      })
      .parse(read('selection.json'));
    const dungeon = await loadDungeonPackage('ai-103');
    expect(selection.selectedCount).toBe(dungeon.questions.length);
    expect(selection.selected.map((entry) => entry.questionId).sort()).toEqual(
      dungeon.questions.map((question) => question.id).sort(),
    );
    for (const question of dungeon.questions) {
      const selected = selection.selected.find(
        (entry) => entry.questionId === question.id,
      )!;
      const review = dungeon.reviews.reviews.find(
        (entry) => entry.questionId === question.id,
      )!;
      expect(selected.questionFingerprint).toBe(questionFingerprint(question));
      expect(selected.finalReviewerId).toBe(review.reviewerId);
      expect(selected.finalReviewedAt).toBe(review.reviewedAt);
    }
    expect(
      dungeon.questions.some((question) => question.id === 'ai103-rp-007'),
    ).toBe(true);
    expect(
      dungeon.questions.some((question) => question.id === 'ai103-rg-011'),
    ).toBe(false);
    expect(dungeon.questions.map(questionFingerprint)).not.toContain(
      'd1b43fda08dd9389f2f7070efdaa153ad239629f591b820442256ee2b06a79a8',
    );
    const previous = z
      .object({
        selectedCount: z.literal(117),
        selected: z.array(
          z.object({
            questionId: z.string(),
            questionFingerprint: fingerprint,
          }),
        ),
      })
      .parse(read(join('prior-selection-117', 'selection.json')));
    expect(selection.selected).toHaveLength(116);
    expect(
      previous.selected
        .filter((entry) => entry.questionId !== 'ai103-g-012')
        .map((entry) => entry.questionFingerprint)
        .sort(),
    ).toEqual(
      selection.selected.map((entry) => entry.questionFingerprint).sort(),
    );
    expect(dungeon.packageManifest.reviewPolicy?.targetVerified).toBe(150);
    expect(dungeon.packageManifest.reviewPolicy?.minimumRubricScore).toBe(44);
  });

  it('keeps a hash-indexed, compressed audit outside the playable package', () => {
    const index = z
      .object({
        schemaVersion: z.literal(1),
        credentialId: z.literal('ai-103'),
        archiveFile: z.literal('artifacts.jsonl.gz'),
        archiveSha256: fingerprint,
        archiveBytes: z.number().int().positive(),
        artifactCount: z.number().int().positive(),
        distinctContents: z.number().int().positive(),
        artifacts: z.array(
          z.object({
            path: z.string(),
            sha256: fingerprint,
            bytes: z.number().int().positive(),
          }),
        ),
      })
      .parse(read('artifact-index.json'));
    const bytes = readFileSync(join(audit, index.archiveFile));
    expect(bytes.length).toBe(index.archiveBytes);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(
      index.archiveSha256,
    );
    expect(index.artifacts).toHaveLength(index.artifactCount);
    expect(new Set(index.artifacts.map((entry) => entry.path)).size).toBe(
      index.artifactCount,
    );
    expect(new Set(index.artifacts.map((entry) => entry.sha256)).size).toBe(
      index.distinctContents,
    );
    expect(
      index.artifacts.some(
        (entry) =>
          entry.path ===
          'batches\\agents\\admission-reviews\\batch-011-current-facts-01\\verification-reviews.json',
      ),
    ).toBe(true);
    expect(
      index.artifacts.some(
        (entry) => entry.path === 'identity\\coordinator-credential-html.json',
      ),
    ).toBe(true);
  });

  it('rejects unreferenced archive contents while preserving BOM, CRLF and path aliases', () => {
    const temporary = mkdtempSync(join(tmpdir(), 'ai103-archive-'));
    const directory = join(temporary, audit);
    const verifier = join(
      process.cwd(),
      'scripts',
      'verify-ai103-release-archive.mjs',
    );
    const hash = (bytes: Buffer) =>
      createHash('sha256').update(bytes).digest('hex');
    const content = '\uFEFF{\r\n  "synthetic": true\r\n}\r\n';
    const bytes = Buffer.from(content, 'utf8');
    const digest = hash(bytes);
    const artifacts = [
      {
        path: 'source.json',
        sha256: digest,
        bytes: bytes.length,
        format: 'json',
      },
      {
        path: 'alias.json',
        sha256: digest,
        bytes: bytes.length,
        format: 'json',
        aliasOf: 'source.json',
      },
    ];
    const writeFixture = (includeOrphan: boolean) => {
      const blobs = [{ sha256: digest, content }];
      if (includeOrphan) {
        const orphan = '{"unreferenced":true}\n';
        blobs.push({
          sha256: hash(Buffer.from(orphan, 'utf8')),
          content: orphan,
        });
      }
      const compressed = gzipSync(
        `${blobs.map((blob) => JSON.stringify(blob)).join('\n')}\n`,
      );
      writeFileSync(join(directory, 'artifacts.jsonl.gz'), compressed);
      writeFileSync(
        join(directory, 'artifact-index.json'),
        JSON.stringify({
          schemaVersion: 1,
          credentialId: 'ai-103',
          archiveFile: 'artifacts.jsonl.gz',
          archiveSha256: hash(compressed),
          archiveBytes: compressed.length,
          artifactCount: artifacts.length,
          distinctContents: blobs.length,
          artifacts,
        }),
      );
    };
    try {
      mkdirSync(directory, { recursive: true });
      writeFixture(false);
      expect(
        execFileSync(process.execPath, [verifier, '--read', 'alias.json'], {
          cwd: temporary,
        }),
      ).toEqual(bytes);
      writeFixture(true);
      const result = spawnSync(process.execPath, [verifier], {
        cwd: temporary,
        encoding: 'utf8',
      });
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain('unreferenced content');
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });
});
