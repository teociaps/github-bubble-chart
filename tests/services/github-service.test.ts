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
  });
});
