import {
  getColor,
  getName,
  toKebabCase,
  getBubbleData,
} from '../../src/chart/utils';
import { fetchTopLanguages } from '../../src/services/github-service';
import fs from 'fs';
import { describe, it, expect, vi, Mock } from 'vitest';

vi.mock('../../src/services/github-service');
vi.mock('fs');

describe('Utils', () => {
  describe('getColor', () => {
    it('should return the color of the BubbleData', () => {
      const data = { color: 'red' };
      expect(getColor(data as any)).toBe('red');
    });
  });

  describe('getName', () => {
    it('should return the name of the BubbleData', () => {
      const data = { name: 'JavaScript' };
      expect(getName(data as any)).toBe('JavaScript');
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
      } as any;
      (global as any).fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await getBubbleData('testuser', 10);
      expect(result).toEqual([
        {
          name: mockLanguages[0].language,
          value: mockLanguages[0].percentage,
          color: mockJsonLanguageMappings['JavaScript'].color,
          icon: mockJsonLanguageMappings['JavaScript'].icon,
        },
        {
          name: mockLanguages[1].language,
          value: mockLanguages[1].percentage,
          color: mockJsonLanguageMappings['TypeScript'].color,
          icon: mockJsonLanguageMappings['TypeScript'].icon,
        },
      ]);
    });
  });
});
