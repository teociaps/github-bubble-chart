import { graphql } from '@octokit/graphql';
import { CONSTANTS } from '../../config/consts.js';

// TODO: remove the 0,00% ones from the list

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${CONSTANTS.GITHUB_TOKEN}`,
  },
});

// Helper function to fetch repositories and aggregate languages
export const fetchLanguagesByUser = async (username: string) => {
  const query = `
      query UserLanguages($username: String!, $first: Int!, $after: String) {
        user(login: $username) {
          repositories(first: $first, after: $after) {
            nodes {
              languages(first: 10) {
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
      first: 50, // Fetch up to 50 repositories per request
      after,
    });
    // console.log(response);

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

  // Calculate percentages
  const totalSize = Object.values(languageMap).reduce((sum, size) => sum + size, 0);
  const languagePercentages = Object.entries(languageMap).map(([language, size]) => ({
    language,
    percentage: ((size / totalSize) * 100).toFixed(2),
  }));

  // Sort by percentage in descending order
  languagePercentages.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

  return languagePercentages;
};
