import { CONSTANTS } from '../../config/consts';
import { getColor, getName, toKebabCase, getBubbleData } from '../../src/chart/utils';
import { fetchTopLanguages } from '../../src/services/github-service';
import fs from 'fs';
import { describe, it, expect, vi, Mock } from 'vitest';

vi.mock('../../src/services/github-service');

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
        { language: 'JavaScript', percentage: '70' },
        { language: 'TypeScript', percentage: '30' },
      ];
      (fetchTopLanguages as Mock).mockResolvedValue(mockLanguages);

      const jsonLanguageMappings = JSON.parse(fs.readFileSync(CONSTANTS.LANGS_OUTPUT_FILE, 'utf-8'));

      const result = await getBubbleData('testuser', 10);
      expect(result).toEqual([
        {
          name: 'JavaScript',
          value: 70,
          color: jsonLanguageMappings['JavaScript'].color,
          icon: jsonLanguageMappings['JavaScript'].icon,
        },
        {
          name: 'TypeScript',
          value: 30,
          color: jsonLanguageMappings['TypeScript'].color,
          icon: jsonLanguageMappings['TypeScript'].icon,
        },
      ]);
    });
  });
});
