import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { credentialSchema } from '../../src/features/dungeons/schema';
import { validateDungeonPackage } from '../../src/features/dungeons/validation';

export function loadTestDungeonPackage(id: string) {
  // Playwright loads these files without Vite's JSON import transforms.
  const read = (path: string): unknown =>
    JSON.parse(readFileSync(path, 'utf8'));
  const root = join(process.cwd(), 'src', 'content');
  const credential = credentialSchema
    .array()
    .parse(read(join(root, 'credentials', 'credentials.json')))
    .find((entry) => entry.credentialId === id);
  if (!credential) throw new Error(`Missing catalog identity: ${id}.`);
  const file = (name: string) => read(join(root, 'exams', id, `${name}.json`));
  const optionalFile = (name: string) => {
    try {
      return file(name);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
        return undefined;
      throw error;
    }
  };
  return validateDungeonPackage(credential, {
    packageManifest: file('manifest'),
    questions: file('questions'),
    taxonomy: file('objectives'),
    manifest: file('sources'),
    reviews: file('verification-reviews'),
    encounterMetadata: file('encounter-metadata'),
    validationMetadata: optionalFile('validation-metadata'),
    sourceRegistry: optionalFile('source-registry'),
  });
}
