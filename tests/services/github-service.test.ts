import { graphql } from '@octokit/graphql';
import { describe, it, expect, vi, MockedFunction, Mock } from 'vitest';
import { fetchTopLanguages } from '../../src/services/github-service';

vi.mock('@octokit/graphql', () => ({
  graphql: {
    defaults: vi.fn().mockReturnValue(vi.fn()),
  },
}));

const mockGraphQL = graphql.defaults({});

describe('GH Service', () => {
  describe('fetchTopLanguages', () => {
    it('should fetch and aggregate languages correctly', async () => {
      const mockResponse = {
        user: {
          repositories: {
            nodes: [
              {
                languages: {
                  edges: [
                    { node: { name: 'JavaScript' }, size: 700 },
                    { node: { name: 'TypeScript' }, size: 300 },
                  ],
                  totalSize: 1000,
                },
              },
            ],
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
          },
        },
      };

      (mockGraphQL as unknown as MockedFunction<typeof mockGraphQL>).mockResolvedValue(mockResponse);

      const result = await fetchTopLanguages('testuser', 2);
      expect(result).toEqual([
        { language: 'JavaScript', percentage: '70.00' },
        { language: 'TypeScript', percentage: '30.00' },
      ]);
    });

    it('should handle multiple pages of repositories', async () => {
      const mockResponsePage1 = {
        user: {
          repositories: {
            nodes: [
              {
                languages: {
                  edges: [{ node: { name: 'JavaScript' }, size: 500 }],
                  totalSize: 500,
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor1',
              hasNextPage: true,
            },
          },
        },
      };

      const mockResponsePage2 = {
        user: {
          repositories: {
            nodes: [
              {
                languages: {
                  edges: [
                    { node: { name: 'JavaScript' }, size: 200 },
                    { node: { name: 'TypeScript' }, size: 300 },
                  ],
                  totalSize: 500,
                },
              },
            ],
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
          },
        },
      };

      (mockGraphQL as unknown as MockedFunction<typeof mockGraphQL>)
        .mockResolvedValueOnce(mockResponsePage1)
        .mockResolvedValueOnce(mockResponsePage2);

      const result = await fetchTopLanguages('testuser', 2);
      expect(result).toEqual([
        { language: 'JavaScript', percentage: '70.00' },
        { language: 'TypeScript', percentage: '30.00' },
      ]);
    });

    it('should return an empty array if no languages are found', async () => {
      const mockResponse = {
        user: {
          repositories: {
            nodes: [],
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
          },
        },
      };

      (mockGraphQL as unknown as MockedFunction<typeof mockGraphQL>).mockResolvedValue(mockResponse);

      const result = await fetchTopLanguages('testuser', 2);
      expect(result).toEqual([]);
    });

    describe('Error Handling', () => {
      it('should throw GitHubRateLimitError on rate limit error', async () => {
        const rateLimitError = new Error('API rate limit exceeded');
        (mockGraphQL as unknown as MockedFunction<typeof mockGraphQL>).mockRejectedValue(rateLimitError);

        await expect(fetchTopLanguages('testuser', 2)).rejects.toThrow('GitHub API Rate Limit Exceeded');
      });

      it('should throw GitHubNotFoundError on not found error', async () => {
        const notFoundError = new Error('Not Found');
        (mockGraphQL as unknown as MockedFunction<typeof mockGraphQL>).mockRejectedValue(notFoundError);

        await expect(fetchTopLanguages('testuser', 2)).rejects.toThrow('GitHub Repository Not Found');
      });

      it('should throw GitHubBadCredentialsError on bad credentials error', async () => {
        const badCredentialsError = new Error('Bad credentials');
        (mockGraphQL as unknown as MockedFunction<typeof mockGraphQL>).mockRejectedValue(badCredentialsError);

        await expect(fetchTopLanguages('testuser', 2)).rejects.toThrow('GitHub Bad Credentials');
      });

      it('should throw GitHubAccountSuspendedError on account suspended error', async () => {
        const accountSuspendedError = new Error('Your account was suspended');
        (mockGraphQL as unknown as MockedFunction<typeof mockGraphQL>).mockRejectedValue(accountSuspendedError);

        await expect(fetchTopLanguages('testuser', 2)).rejects.toThrow('GitHub Account Suspended');
      });

      it('should throw GitHubUsernameNotFoundError on username not found error', async () => {
        const usernameNotFoundError = new Error('Could not resolve to a User with the login of');
        (mockGraphQL as unknown as MockedFunction<typeof mockGraphQL>).mockRejectedValue(usernameNotFoundError);

        await expect(fetchTopLanguages('testuser', 2)).rejects.toThrow('GitHub Username Not Found');
      });
    });
  });
});
