import { ArrowLeft, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import prospective from '../../docs/dp-420-prospective-objectives.json';
import { DateStamp, LearnLink, PageHeading } from '../components/common';
import { ExamUpdateNotice } from '../components/ExamUpdateNotice';
import { credentials } from '../features/dungeons/catalog';
import { taxonomySchema } from '../features/grounding/schema';

const outline = taxonomySchema.parse(prospective);

export function Dp420PreviewPage() {
  const credential = credentials.find((item) => item.credentialId === 'dp-420');
  if (!credential)
    throw new Error('The DP-420 preview requires its catalog record.');
  const skills = outline.domains.flatMap((domain) => domain.skills);
  const resources = [
    { label: 'Official study guide', url: outline.studyGuideUrl },
    {
      label: 'Credential and exam update',
      url: credential.officialUrls.credential,
    },
    {
      label: 'Official preparation course',
      url: credential.officialUrls.training,
    },
  ];
  return (
    <div className="prospective-preview">
      <Link className="text-link" to="/dungeons/dp-420">
        <ArrowLeft size={16} aria-hidden="true" /> Back to DP-420
      </Link>
      <PageHeading
        title={credential.dungeonName}
        description="DP-420 · Upcoming-outline preview"
      />
      <ExamUpdateNotice credential={credential} />
      <div className="preview-layout">
        <aside
          className="panel preview-reference"
          aria-labelledby="preview-resources"
        >
          <p className="preview-mode">Read-only preview</p>
          <dl className="preview-facts">
            <div>
              <dt>Announced effective date</dt>
              <dd>{outline.studyGuideEffectiveDate}</dd>
            </div>
            <div>
              <dt>Saved outline retrieved</dt>
              <dd>
                <DateStamp value={outline.retrievedAt} precise />
              </dd>
            </div>
            <div>
              <dt>Credential status</dt>
              <dd>{credential.status}</dd>
            </div>
          </dl>
          <h2 id="preview-resources">
            <BookOpen size={20} aria-hidden="true" /> Official study resources
          </h2>
          <ul className="preview-resource-links">
            {resources.map(({ label, url }) => (
              <li key={label}>
                {url ? (
                  <LearnLink href={url}>{label}</LearnLink>
                ) : (
                  <span>{label} is not recorded.</span>
                )}
              </li>
            ))}
          </ul>
          <p className="small muted">
            Browse the announced topics and read the official material. This
            preview has no questions, scores, or completion tracking and does
            not change your selected dungeon or saved progress.
          </p>
        </aside>
        <div className="preview-outline">
          <p className="preview-scope">
            {outline.domains.length} objective areas · {skills.length} skills ·{' '}
            {skills.flatMap((skill) => skill.subskills).length} subskills
          </p>
          <p className="small muted">
            These are the published topics and weight ranges for the announced
            update, not verified coverage of the current exam. Expand a skill to
            explore its subskills.
          </p>
          {outline.domains.map((domain) => (
            <section
              key={domain.id}
              className="preview-domain"
              aria-labelledby={`preview-${domain.id}`}
            >
              <header>
                <h2 id={`preview-${domain.id}`}>{domain.title}</h2>
                <p className="preview-weight">
                  {domain.weightRange
                    ? `${domain.weightRange[0]}-${domain.weightRange[1]}% announced weighting`
                    : 'Announced weighting is unavailable in this snapshot.'}
                </p>
              </header>
              {domain.skills.map((skill) => (
                <details className="preview-skill" key={skill.id}>
                  <summary>{skill.title}</summary>
                  <ul>
                    {skill.subskills.map((subskill) => (
                      <li key={subskill}>{subskill}</li>
                    ))}
                  </ul>
                </details>
              ))}
            </section>
          ))}
          <p className="notice">
            Study and Boss Gauntlet are not available in this preview. A
            verified current objective map and independently reviewed questions
            are still required. The October 6 date does not unlock them
            automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
