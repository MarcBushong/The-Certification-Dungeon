import type { Credential } from '../features/dungeons/schema';
import { LearnLink } from './common';

export function ExamUpdateNotice({
  credential,
}: {
  credential:
    | Pick<
        Credential,
        'credentialId' | 'examCode' | 'examUpdateNotice' | 'officialUrls'
      >
    | undefined;
}) {
  if (!credential?.examUpdateNotice) return null;
  const label = credential.examCode ?? credential.credentialId;
  return (
    <aside className="notice warning" aria-label={`${label} exam update`}>
      <strong>Exam outline disclaimer</strong>
      <p>{credential.examUpdateNotice}</p>
      {credential.officialUrls.studyGuide && (
        <LearnLink href={credential.officialUrls.studyGuide}>
          Official {label} study guide
        </LearnLink>
      )}
    </aside>
  );
}
