import { describe, it, expect, vi, Mock } from 'vitest';
import { BubbleData } from '../../src/chart/types/bubbleData';
import { TextAnchor } from '../../src/chart/types/chartOptions';
import {
  getColor,
  getName,
  toKebabCase,
  getBubbleData,
  getAlignmentPosition,
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

  describe('getAlignmentPosition', () => {
    it('should return the correct position for start alignment', () => {
      expect(getAlignmentPosition('start', 100, 10)).toBe(10);
    });

    it('should return the correct position for middle alignment', () => {
      expect(getAlignmentPosition('middle', 100)).toBe(50);
    });

    it('should return the correct position for end alignment', () => {
      expect(getAlignmentPosition('end', 100, 10)).toBe(90);
    });

    it('should return the correct position for default alignment', () => {
      expect(
        getAlignmentPosition('unknown' as unknown as TextAnchor, 100),
      ).toBe(50);
    });
  });
});
