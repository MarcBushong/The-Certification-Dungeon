import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

const directory = path.resolve(
  'src',
  'content',
  'exams',
  'ai-103',
  'audit',
  'release-20260915',
);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const index = JSON.parse(
  await readFile(path.join(directory, 'artifact-index.json'), 'utf8'),
);
if (
  index.schemaVersion !== 1 ||
  index.credentialId !== 'ai-103' ||
  index.archiveFile !== 'artifacts.jsonl.gz'
) {
  throw new Error('Unexpected AI-103 archive format.');
}
const compressed = await readFile(path.join(directory, index.archiveFile));
if (
  hash(compressed) !== index.archiveSha256 ||
  compressed.length !== index.archiveBytes
) {
  throw new Error(
    'AI-103 compressed evidence archive does not match its index.',
  );
}
const blobs = new Map();
for (const line of gunzipSync(compressed)
  .toString('utf8')
  .trimEnd()
  .split('\n')) {
  const blob = JSON.parse(line);
  if (
    typeof blob.content !== 'string' ||
    hash(Buffer.from(blob.content, 'utf8')) !== blob.sha256 ||
    blobs.has(blob.sha256)
  ) {
    throw new Error('Invalid or duplicate content-addressed evidence blob.');
  }
  blobs.set(blob.sha256, blob.content);
}
const paths = new Set();
const referencedHashes = new Set();
for (const artifact of index.artifacts) {
  const content = blobs.get(artifact.sha256);
  if (
    typeof content !== 'string' ||
    Buffer.byteLength(content, 'utf8') !== artifact.bytes ||
    paths.has(artifact.path)
  ) {
    throw new Error(`Invalid archived artifact: ${artifact.path}`);
  }
  if (artifact.format === 'json') JSON.parse(content.replace(/^\uFEFF/, ''));
  else if (artifact.format !== 'text')
    throw new Error(`Unknown archived content format: ${artifact.path}`);
  if (artifact.aliasOf) {
    const target = index.artifacts.find(
      (entry) => entry.path === artifact.aliasOf,
    );
    if (
      !target ||
      target.aliasOf ||
      target.sha256 !== artifact.sha256 ||
      target.bytes !== artifact.bytes ||
      target.format !== artifact.format
    ) {
      throw new Error(`Invalid archived path alias: ${artifact.path}`);
    }
  }
  paths.add(artifact.path);
  referencedHashes.add(artifact.sha256);
}
if (referencedHashes.size !== blobs.size) {
  throw new Error('AI-103 archive contains unreferenced content.');
}
if (
  index.artifactCount !== paths.size ||
  index.distinctContents !== blobs.size
) {
  throw new Error('AI-103 archive inventory counts do not match.');
}
const args = process.argv.slice(2);
if (args.length) {
  if (args.length !== 2 || args[0] !== '--read') {
    throw new Error(
      'Usage: node scripts\\verify-ai103-release-archive.mjs [--read <indexed-relative-path>]',
    );
  }
  const artifact = index.artifacts.find((entry) => entry.path === args[1]);
  if (!artifact) throw new Error(`Artifact is not indexed: ${args[1]}`);
  process.stdout.write(blobs.get(artifact.sha256));
} else {
  console.log(
    `Verified ${paths.size} exact archived artifacts (${blobs.size} distinct contents). No historical verdict is promoted by this check.`,
  );
}
