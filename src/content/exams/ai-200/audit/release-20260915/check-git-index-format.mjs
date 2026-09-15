import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { check, getFileInfo, resolveConfig, version } from 'prettier';

const startedAt = new Date().toISOString();
const changedConfiguration = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    '--',
    '.prettierrc.json',
    '.prettierignore',
    '.editorconfig',
  ],
  { encoding: 'utf8' },
).trim();
if (changedConfiguration)
  throw new Error(
    `Stage formatter configuration before checking staged content: ${changedConfiguration}`,
  );
const entries = execFileSync('git', ['ls-files', '--stage', '-z'], {
  encoding: 'utf8',
  maxBuffer: 8 * 1024 * 1024,
})
  .split('\0')
  .filter(Boolean);
const selected = [];
for (const entry of entries) {
  const match = /^(\d+) ([a-f0-9]+) (\d)\t([\s\S]+)$/.exec(entry);
  if (!match || match[3] !== '0')
    throw new Error(`Invalid or unmerged index entry: ${entry}`);
  const [, mode, objectId, , path] = match;
  if (mode !== '100644' && mode !== '100755') continue;
  const filepath = resolve(...path.split('/'));
  const info = await getFileInfo(filepath, {
    ignorePath: resolve('.prettierignore'),
  });
  if (!info.ignored && info.inferredParser)
    selected.push({ path, filepath, objectId });
}
const blobs = execFileSync('git', ['cat-file', '--batch'], {
  input: `${selected.map((entry) => entry.objectId).join('\n')}\n`,
  maxBuffer: 128 * 1024 * 1024,
});
let offset = 0;
const failures = [];
for (const entry of selected) {
  const newline = blobs.indexOf(10, offset);
  if (newline < 0) throw new Error(`Missing object header for ${entry.path}`);
  const header = blobs.subarray(offset, newline).toString('utf8');
  const [objectId, type, sizeText] = header.split(' ');
  const size = Number(sizeText);
  if (
    objectId !== entry.objectId ||
    type !== 'blob' ||
    !Number.isSafeInteger(size) ||
    size < 0
  )
    throw new Error(`Unexpected Git object header: ${header}`);
  const start = newline + 1;
  const end = start + size;
  if (end >= blobs.length || blobs[end] !== 10)
    throw new Error(`Incomplete Git object for ${entry.path}`);
  const content = blobs.subarray(start, end).toString('utf8');
  offset = end + 1;
  if (
    !(await check(content, {
      ...(await resolveConfig(entry.filepath)),
      filepath: entry.filepath,
    }))
  )
    failures.push(entry.path);
}
if (offset !== blobs.length)
  throw new Error('Unexpected trailing Git object data.');
const result = {
  startedAt,
  completedAt: new Date().toISOString(),
  checkedFiles: selected.length,
  stagedTextBytes: blobs.length,
  prettierVersion: version,
  nodeVersion: process.version,
  failures,
  passed: failures.length === 0,
  scope:
    'Actual staged Git blobs with the repository Prettier version, configuration and ignore rules. No end-of-line option override and no source files rewritten.',
  rationale:
    'This Windows checkout has core.autocrlf=true; the untouched working files use CRLF while their Git blobs and Linux CI checkout use LF. The ordinary working-tree format failure is preserved separately and is not reported as a pass.',
};
await mkdir('.grounding\\ai200-release\\validation', { recursive: true });
await writeFile(
  '.grounding\\ai200-release\\validation\\index-format-result.json',
  `${JSON.stringify(result, null, 2)}\n`,
);
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
