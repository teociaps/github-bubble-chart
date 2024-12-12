import { fetchLanguagesByUser } from '../services/githubService.js';
import { BubbleData, LanguageMappings } from './types.js';
import jsonLanguageMappings from '../languageMappings.json' assert { type: 'json' }; // TODO: change this since it's experimental (see tsconfig)

export const getColor = (d: BubbleData) => d.color;
export const getName = (d: BubbleData) => d.name;

export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export async function getBubbleData(username: string) {
  const languagePercentages = await fetchLanguagesByUser(username!);
  const languageMappings: LanguageMappings = jsonLanguageMappings;
  return languagePercentages.map((l) => ({
    name: l.language,
    value: Number(l.percentage),
    color: languageMappings[l.language]?.color || '',
    icon: languageMappings[l.language]?.icon || '',
  }));
}