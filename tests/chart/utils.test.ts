import { getColor, getName, toKebabCase, getBubbleData } from '../../src/chart/utils';
import { fetchLanguagesByUser } from '../../src/services/githubService';

jest.mock('../../src/services/githubService');

describe('utils', () => {
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
      (fetchLanguagesByUser as jest.Mock).mockResolvedValue(mockLanguages);

      const { default: jsonLanguageMappings } = await import('../../src/languageMappings.json');

      const result = await getBubbleData('testuser');
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
