import { fetchTopLanguages } from '../services/githubService.js';
import { BubbleData, LanguageMappings } from './types.js';
import { CONSTANTS } from '../../config/consts.js';
import { createCanvas } from 'canvas';
import { defaultFontFamily } from './styles.js';

async function fetchLanguageMappings(): Promise<LanguageMappings> {
  const response = await fetch(CONSTANTS.LANGUAGE_MAPPINGS_URL, {
    headers: {
      Authorization: `token ${CONSTANTS.GITHUB_TOKEN}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch language mappings');
  }
  return response.json();
}

export const getColor = (d: BubbleData) => d.color;
export const getName = (d: BubbleData) => d.name;

export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export async function getBubbleData(username: string, langsCount: number) {
  const languagePercentages = await fetchTopLanguages(username!, langsCount);
  const languageMappings: LanguageMappings = await fetchLanguageMappings();
  return languagePercentages.map((l) => ({
    name: l.language,
    value: Number(l.percentage),
    color: languageMappings[l.language]?.color || '',
    icon: languageMappings[l.language]?.icon || '',
  }));
}

export function measureTextWidth(text: string, fontSize: string): number {
  const canvas = createCanvas(0 ,0);
  const context = canvas.getContext('2d');
  context.font = `${fontSize} ${defaultFontFamily}`; // Match SVG font style
  return context.measureText(text).width;
};

export function measureTextHeight(text: string, fontSize: string): number {
  const canvas = createCanvas(0 ,0);
  const context = canvas.getContext('2d');
  context.font = `${fontSize} ${defaultFontFamily}`; // Match SVG font style
  const metrics = context.measureText(text);
  return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
};