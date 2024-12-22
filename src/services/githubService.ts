import { graphql } from '@octokit/graphql';
import { CONSTANTS } from '../../config/consts.js';

// TODO: implement retry logic

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${CONSTANTS.GITHUB_TOKEN}`,
  },
});

export const fetchTopLanguages = async (username: string, langsCount: number) => {
  const query = `
      query UserLanguages($username: String!, $first: Int!, $after: String) {
        user(login: $username) {
          # fetch only owner repos & not forks
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
  let after = null;
  const languageMap: Record<string, number> = {};

  while (hasNextPage) {
    const response: any = await graphqlWithAuth(query, {
      username,
      first: 100, // Fetch up to 100 repositories per request
      after,
    });

    const repositories = response.user.repositories.nodes;
    hasNextPage = response.user.repositories.pageInfo.hasNextPage;
    after = response.user.repositories.pageInfo.endCursor;

    // Aggregate language sizes
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

  // Sort languages by size in descending order and limit to langsCount
  const sortedLanguages = Object.entries(languageMap)
    .sort(([, sizeA], [, sizeB]) => sizeB - sizeA)
    .filter(([, size]) => size > 0)
    .slice(0, langsCount);

  // Calculate percentages directly based on the limited number of languages
  const limitedTotalSize = sortedLanguages.reduce((sum, [, size]) => sum + size, 0);
  const languagePercentages = sortedLanguages.map(([language, size]) => ({
    language,
    percentage: ((size / limitedTotalSize) * 100).toFixed(2),
  }));

  return languagePercentages;
};
