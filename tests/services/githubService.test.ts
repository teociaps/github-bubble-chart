import { fetchLanguagesByUser } from '../../src/services/githubService';
import { graphql } from '@octokit/graphql';

jest.mock('@octokit/graphql', () => ({
  graphql: jest.fn(),
}));

describe('githubService', () => {
  describe('fetchLanguagesByUser', () => {
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

      (graphql as jest.MockedFunction<typeof graphql>).mockResolvedValue(mockResponse);

      const result = await fetchLanguagesByUser('testuser');
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
                  edges: [
                    { node: { name: 'JavaScript' }, size: 500 },
                  ],
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

      (graphql as jest.MockedFunction<typeof graphql>)
        .mockResolvedValueOnce(mockResponsePage1)
        .mockResolvedValueOnce(mockResponsePage2);

      const result = await fetchLanguagesByUser('testuser');
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

      (graphql as jest.MockedFunction<typeof graphql>).mockResolvedValue(mockResponse);

      const result = await fetchLanguagesByUser('testuser');
      expect(result).toEqual([]);
    });
  });
});
