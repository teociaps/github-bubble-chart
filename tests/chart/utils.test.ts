import { describe, it, expect, vi, Mock } from 'vitest';
import { BubbleData } from '../../src/chart/types/bubbleData';
import {
  getColor,
  getName,
  toKebabCase,
  getBubbleData,
} from '../../src/chart/utils';
import { fetchTopLanguages } from '../../src/services/github-service';

vi.mock('../../src/services/github-service');
vi.mock('fs');

describe('Utils', () => {
  describe('getColor', () => {
    it('should return the color of the BubbleData', () => {
      const data = { color: 'red' } as BubbleData;
      expect(getColor(data)).toBe('red');
    });
  });

  describe('getName', () => {
    it('should return the name of the BubbleData', () => {
      const data = { name: 'JavaScript' } as BubbleData;
      expect(getName(data)).toBe('JavaScript');
    });
  });

  describe('toKebabCase', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(toKebabCase('camelCaseString')).toBe('camel-case-string');
    });
  });

  describe('getBubbleData', () => {
    it('should fetch and transform bubble data', async () => {
      const mockLanguages = [
        { language: 'JavaScript', percentage: 70 },
        { language: 'TypeScript', percentage: 30 },
      ];
      (fetchTopLanguages as Mock).mockResolvedValue(mockLanguages);

      const mockJsonLanguageMappings = {
        JavaScript: { color: 'yellow', icon: 'js-icon' },
        TypeScript: { color: 'blue', icon: 'ts-icon' },
      };
      const mockResponse = {
        ok: true,
        json: async () => mockJsonLanguageMappings,
      } as Response;
      (global as unknown as { fetch: typeof fetch }).fetch = vi
        .fn()
        .mockResolvedValue(mockResponse);

      const result = await getBubbleData('testuser', 10);
      expect(result).toEqual([
        {
          name: mockLanguages[0].language,
          value: mockLanguages[0].percentage,
          color: mockJsonLanguageMappings.JavaScript.color,
          icon: mockJsonLanguageMappings.JavaScript.icon,
        },
        {
          name: mockLanguages[1].language,
          value: mockLanguages[1].percentage,
          color: mockJsonLanguageMappings.TypeScript.color,
          icon: mockJsonLanguageMappings.TypeScript.icon,
        },
      ]);
    });
  });
});
