import { describe, expect, it, vi } from 'vitest';
import {
  checkOnlineSource,
  matchesRecordedSourceTarget,
  safeSourceUrl,
} from '../scripts/validate-sources';
import type { SourcePolicyContext } from '../src/features/dungeons/sourcePolicy';

const countUrl =
  'https://learn.microsoft.com/en-us/sql/t-sql/functions/count-transact-sql';
const canonicalCount = `${countUrl}?view=sql-server-ver17`;

describe('SC-500 observed product moniker redirects', () => {
  const articles = [
    ['azure/azure-sql/database/firewall-configure', 'azuresql'],
    [
      'azure/azure-sql/database/authentication-azure-ad-only-authentication',
      'azuresql',
    ],
    ['azure/azure-sql/database/auditing-overview', 'azuresql'],
    ['azure/azure-sql/managed-instance/auditing-configure', 'azuresql'],
    ['microsoft-365/admin/manage/agent-actions', 'o365-worldwide'],
  ] as const;

  it.each(articles)(
    'follows only the recorded view for %s',
    async (path, view) => {
      const article = `https://learn.microsoft.com/en-us/${path}`;
      const canonical = `${article}?view=${view}`;
      const credential: SourcePolicyContext = {
        credentialId: 'sc-500',
        provider: 'Microsoft',
        sourceAllowlist: [
          {
            host: 'learn.microsoft.com',
            pathPrefixes: [],
            exactUrls: [article],
          },
        ],
      };
      expect(safeSourceUrl(canonical, true, credential).href).toBe(canonical);
      expect(() => safeSourceUrl(canonical, false, credential)).toThrow();
      expect(() => safeSourceUrl(canonical, true)).toThrow();
      for (const credentialId of ['dp-700', 'sc-200', 'ai-103'])
        expect(() =>
          safeSourceUrl(canonical, true, { ...credential, credentialId }),
        ).toThrow();
      expect(() =>
        safeSourceUrl(canonical, true, {
          ...credential,
          sourceAllowlist: [],
        }),
      ).toThrow();
      expect(matchesRecordedSourceTarget(canonical, article, credential)).toBe(
        true,
      );
      for (const unexpected of [
        `${article}?view=unreviewed`,
        `${canonical}&redirect=elsewhere`,
        canonical.replace(path, `${path}-another`),
        canonical.replace('learn.microsoft.com', 'example.test'),
        canonical.replace('/en-us/', '/fr-fr/'),
      ])
        expect(() => safeSourceUrl(unexpected, true, credential)).toThrow();

      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(
          new Response(null, {
            status: 302,
            headers: { location: canonical },
          }),
        )
        .mockResolvedValueOnce(
          new Response(
            '<title>Security documentation</title><h1>Security</h1>',
            {
              headers: { 'content-type': 'text/html' },
            },
          ),
        );
      await expect(
        checkOnlineSource(article, fetcher, credential),
      ).resolves.toEqual({ finalUrl: canonical, status: 200 });
      expect(fetcher.mock.calls.map(([url]) => String(url))).toEqual([
        article,
        canonical,
      ]);
    },
  );
});

describe('DP-800 observed SQL moniker redirects', () => {
  const article =
    'https://learn.microsoft.com/en-us/sql/relational-databases/security/dynamic-data-masking';
  const other =
    'https://learn.microsoft.com/en-us/sql/relational-databases/security/row-level-security';
  const credential: SourcePolicyContext = {
    credentialId: 'dp-800',
    provider: 'Microsoft',
    strictGuideLinked: true,
    sourceAllowlist: [
      {
        host: 'learn.microsoft.com',
        pathPrefixes: [],
        exactUrls: [article, `${article}#permissions`, other, countUrl],
      },
    ],
  };

  it('accepts the observed view only during an approved DP-800 redirect', () => {
    const resolved = `${article}?view=sql-server-ver17`;
    expect(() => safeSourceUrl(resolved, false, credential)).toThrow();
    expect(safeSourceUrl(resolved, true, credential).href).toBe(resolved);
    expect(() => safeSourceUrl(resolved, true)).toThrow();
    expect(() =>
      safeSourceUrl(resolved, true, {
        ...credential,
        credentialId: 'dp-700',
      }),
    ).toThrow();
  });

  it('compares the same article identity without discarding other receipt differences', () => {
    expect(
      matchesRecordedSourceTarget(
        `${article}?view=sql-server-ver17`,
        article,
        credential,
      ),
    ).toBe(true);
    expect(() =>
      matchesRecordedSourceTarget(
        `${article}?view=sql-server-ver17`,
        `${article}#unapproved-section`,
        credential,
      ),
    ).toThrow();
    expect(
      matchesRecordedSourceTarget(canonicalCount, countUrl, credential),
    ).toBe(true);
    expect(
      matchesRecordedSourceTarget(
        `${other}?view=sql-server-ver17`,
        article,
        credential,
      ),
    ).toBe(false);
    expect(
      matchesRecordedSourceTarget(
        `${article}?view=sql-server-ver17`,
        `${article}#permissions`,
        credential,
      ),
    ).toBe(true);
  });

  it.each([
    `${article}?view=sql-server-ver16`,
    `${article}?view=sql-server-ver17&redirect=elsewhere`,
    `${article.replace('dynamic-data-masking', 'unapproved')}?view=sql-server-ver17`,
    'https://example.com/en-us/sql/relational-databases/security/dynamic-data-masking?view=sql-server-ver17',
  ])('rejects unapproved redirect variants %s', (url) => {
    expect(() => safeSourceUrl(url, true, credential)).toThrow();
  });
});

describe('DP-800 observed preparation-linked product views', () => {
  const articles = [
    ['azure/azure-sql/database/authentication-aad-overview', 'azuresql'],
    ['azure/azure-sql/database/auditing-overview', 'azuresql'],
    ['azure/azure-sql/database/service-tiers-sql-database-vcore', 'azuresql'],
    [
      'sql/tools/sql-database-projects/sql-database-projects',
      'sql-server-ver17',
    ],
    [
      'sql/tools/sql-database-projects/concepts/pre-post-deployment-scripts',
      'sql-server-ver17',
    ],
    [
      'sql/tools/sql-database-projects/howto/compare-database-project',
      'sql-server-ver17',
    ],
    [
      'sql/tools/sql-database-projects/concepts/schema-comparison',
      'sql-server-ver17',
    ],
    [
      'sql/tools/sql-database-projects/sql-projects-automation',
      'sql-server-ver17',
    ],
    ['azure/devops/repos/git/branch-policies-overview', 'azure-devops'],
  ] as const;

  it.each(articles)(
    'follows the exact recorded view for %s without widening source approval',
    async (path, view) => {
      const article = `https://learn.microsoft.com/en-us/${path}`;
      const canonical = `${article}?view=${view}`;
      const credential: SourcePolicyContext = {
        credentialId: 'dp-800',
        provider: 'Microsoft',
        strictGuideLinked: true,
        sourceAllowlist: [
          {
            host: 'learn.microsoft.com',
            pathPrefixes: [],
            exactUrls: [article],
          },
        ],
      };
      expect(safeSourceUrl(canonical, true, credential).href).toBe(canonical);
      expect(matchesRecordedSourceTarget(canonical, article, credential)).toBe(
        true,
      );
      expect(() => safeSourceUrl(canonical, false, credential)).toThrow();
      for (const context of [
        { ...credential, strictGuideLinked: false },
        { ...credential, sourceAllowlist: [] },
        { ...credential, credentialId: 'dp-700' },
        { ...credential, credentialId: 'ai-103' },
      ])
        expect(() => safeSourceUrl(canonical, true, context)).toThrow();
      for (const unexpected of [
        `${article}?view=unreviewed`,
        `${canonical}&redirect=elsewhere`,
        `${article}-unreviewed?view=${view}`,
        canonical.replace('learn.microsoft.com', 'example.test'),
      ])
        expect(() => safeSourceUrl(unexpected, true, credential)).toThrow();

      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(
          new Response(null, {
            status: 302,
            headers: { location: canonical },
          }),
        )
        .mockResolvedValueOnce(
          new Response('<title>SQL documentation</title><h1>SQL</h1>', {
            headers: { 'content-type': 'text/html' },
          }),
        );
      await expect(
        checkOnlineSource(article, fetcher, credential),
      ).resolves.toEqual({ finalUrl: canonical, status: 200 });
      expect(fetcher.mock.calls.map(([url]) => String(url))).toEqual([
        article,
        canonical,
      ]);
    },
  );
});

describe('official SQL documentation view redirects', () => {
  it('accepts the observed canonical view only when following a redirect', () => {
    expect(() => safeSourceUrl(canonicalCount)).toThrow();
    expect(safeSourceUrl(canonicalCount, true).href).toBe(canonicalCount);
  });

  describe('recorded locale-neutral Learn training link checks', () => {
    const target =
      'https://learn.microsoft.com/training/paths/design-develop-database-solutions/';
    const canonical =
      'https://learn.microsoft.com/en-us/training/paths/design-develop-database-solutions/';
    const credential: SourcePolicyContext = {
      credentialId: 'dp-800',
      provider: 'Microsoft',
      strictGuideLinked: true,
      sourceAllowlist: [
        {
          host: 'learn.microsoft.com',
          pathPrefixes: [],
          exactUrls: [canonical],
        },
      ],
    };

    it('checks the observed redirect without admitting the target as canonical evidence', async () => {
      expect(() => safeSourceUrl(target, false, credential)).toThrow();
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(
          new Response(null, {
            status: 301,
            headers: { location: canonical },
          }),
        )
        .mockResolvedValueOnce(
          new Response(
            '<title>Database training</title><h1>Database training</h1>',
            {
              headers: { 'content-type': 'text/html' },
            },
          ),
        );
      await expect(
        checkOnlineSource(target, fetcher, credential, canonical),
      ).resolves.toEqual({
        finalUrl: canonical,
        status: 200,
      });
      expect(fetcher.mock.calls.map(([url]) => String(url))).toEqual([
        target,
        canonical,
      ]);
    });

    it('rejects a target that stops redirecting instead of relabelling its response as canonical', async () => {
      const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(
        new Response('<title>Training without redirect</title>', {
          headers: { 'content-type': 'text/html' },
        }),
      );
      await expect(
        checkOnlineSource(target, fetcher, credential, canonical),
      ).rejects.toThrow(/did not redirect/i);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('rejects an unbound initial target before any network request', async () => {
      const fetcher = vi.fn<typeof fetch>();
      await expect(
        checkOnlineSource(
          target.replace('design-develop', 'different'),
          fetcher,
          credential,
          canonical,
        ),
      ).rejects.toThrow();
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('rejects even an otherwise allowed redirect when it differs from the receipt', async () => {
      const different = canonical.replace('design-develop', 'different');
      const allowed = structuredClone(credential);
      allowed.sourceAllowlist[0].exactUrls.push(different);
      const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(
        new Response(null, {
          status: 302,
          headers: { location: different },
        }),
      );
      await expect(
        checkOnlineSource(target, fetcher, allowed, canonical),
      ).rejects.toThrow(/canonical|receipt/i);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('does not grant the transport exception to a legacy or unapproved source policy', async () => {
      const fetcher = vi.fn<typeof fetch>();
      await expect(
        checkOnlineSource(
          target,
          fetcher,
          {
            ...credential,
            strictGuideLinked: false,
          },
          canonical,
        ),
      ).rejects.toThrow();
      await expect(
        checkOnlineSource(
          target,
          fetcher,
          {
            ...credential,
            sourceAllowlist: [],
          },
          canonical,
        ),
      ).rejects.toThrow();
      expect(fetcher).not.toHaveBeenCalled();
    });
  });

  it.each([
    `${countUrl}?view=sql-server-ver17&redirect=https://example.com`,
    `${countUrl}?view=unknown`,
    'https://learn.microsoft.com/en-us/fabric/security/security-overview?view=sql-server-ver17',
    'https://example.com/en-us/sql/t-sql/functions/count-transact-sql?view=sql-server-ver17',
  ])('does not broaden the source allowlist for %s', (url) => {
    expect(() => safeSourceUrl(url, true)).toThrow();
  });

  it('checks the canonical document rather than reporting a valid redirect as a failure', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 301,
          headers: {
            location: `${new URL(countUrl).pathname}?view=sql-server-ver17`,
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response('<title>COUNT (Transact-SQL)</title><h1>COUNT</h1>', {
          headers: { 'content-type': 'text/html' },
        }),
      );
    await expect(checkOnlineSource(countUrl, fetcher)).resolves.toEqual({
      finalUrl: canonicalCount,
      status: 200,
    });
    expect(String(fetcher.mock.calls[1][0])).toBe(canonicalCount);
  });
});
