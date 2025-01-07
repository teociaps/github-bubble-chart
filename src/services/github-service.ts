import { graphql } from '@octokit/graphql';
import { CONSTANTS } from '../../config/consts.js';
import { GitHubError, GitHubRateLimitError, GitHubNotFoundError, GitHubBadCredentialsError, GitHubAccountSuspendedError } from '../errors/github-errors.js';

export const fetchTopLanguages = async (username: string, langsCount: number) => {
  try {
    const query = `
      query UserLanguages($username: String!, $first: Int!, $after: String) {
        user(login: $username) {
          repositories(ownerAffiliations: OWNER, isFork: false, first: $first, after: $after) {
            nodes {
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  node {
                    name
                  }
                  size
                }
                totalSize
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    `;

    let hasNextPage = true;
    let after: any = null;
    const languageMap: Record<string, number> = {};

    while (hasNextPage) {
      const response: any = await retry(() =>
        graphqlWithAuth(query, {
          username,
          first: 100,
          after,
        }),
      );

      const repositories = response.user.repositories.nodes;
      hasNextPage = response.user.repositories.pageInfo.hasNextPage;
      after = response.user.repositories.pageInfo.endCursor;

      repositories.forEach((repo: any) => {
        repo.languages.edges.forEach((edge: any) => {
          const { name } = edge.node;
          const size = edge.size;
          if (languageMap[name]) {
            languageMap[name] += size;
          } else {
            languageMap[name] = size;
          }
        });
      });
    }

    const sortedLanguages = Object.entries(languageMap)
      .sort(([, sizeA], [, sizeB]) => sizeB - sizeA)
      .filter(([, size]) => size > 0)
      .slice(0, langsCount);

    const limitedTotalSize = sortedLanguages.reduce((sum, [, size]) => sum + size, 0);
    const languagePercentages = sortedLanguages.map(([language, size]) => ({
      language,
      percentage: ((size / limitedTotalSize) * 100).toFixed(2),
    }));

    return languagePercentages;
  } catch (error) {
    if (error instanceof Error) {
      handleGitHubError(error);
    }
    throw new GitHubError(400, 'Failed to fetch top languages from GitHub');
  }
};

const retry = async (
  fn: () => Promise<any>,
  retries: number = CONSTANTS.DEFAULT_GITHUB_MAX_RETRY,
  delay: number = CONSTANTS.DEFAULT_GITHUB_RETRY_DELAY,
): Promise<any> => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      handleGitHubError(error);
    }
    if (retries > 0) {
      await new Promise((res) => setTimeout(res, delay));
      return retry(fn, retries - 1, delay);
    } else {
      throw new GitHubError(400, 'Exceeded maximum retries for GitHub API. Try again later.');
    }
  }
};

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${CONSTANTS.GITHUB_TOKEN}`,
  },
});

const handleGitHubError = (error: Error) => {
  console.log(error);
  if (error.message.includes('rate limit')) {
    throw new GitHubRateLimitError();
  }
  if (error.message.includes('Not Found')) {
    throw new GitHubNotFoundError();
  }
  if (error.message.includes('Bad credentials')) {
    throw new GitHubBadCredentialsError();
  }
  if (error.message.includes('Your account was suspended')) {
    throw new GitHubAccountSuspendedError();
  }
  throw new GitHubError(400, 'Failed to fetch top languages from GitHub');
};