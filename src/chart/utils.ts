import { fetchTopLanguages } from '../services/github-service.js';
import { BubbleData, LanguageMappings, TextAnchor } from './types.js';
import { CONSTANTS } from '../../config/consts.js';
import { createCanvas } from 'canvas';
import { defaultFontFamily } from './styles.js';
import { emojify } from 'node-emoji';

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
  const canvas = createCanvas(500, 200);
  const context = canvas.getContext('2d');
  context.font = `${fontSize} ${defaultFontFamily}`; // Match SVG font style
  return context.measureText(text).width;
};

export function measureTextHeight(text: string, fontSize: string): number {
  const canvas = createCanvas(500, 200);
  const context = canvas.getContext('2d');
  context.font = `${fontSize} ${defaultFontFamily}`; // Match SVG font style
  const metrics = context.measureText(text);
  return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
};

export const parseEmojis = (str: string) => {
  if (!str) {
    throw new Error("[parseEmoji]: str argument not provided");
  }
  if (!/:\\w+:/gm.test(str)) {
    return str;
  }
  return str.replace(/:\w+:/gm, (emoji: string) => {
    return emojify(emoji) || "";
  });
};

export function wrapText(text: string, maxWidth: number, fontSize: string): string[] {
  const words = text.split(' ');
  let lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = measureTextWidth(currentLine + ' ' + word, fontSize); // TODO: enhance calculation to wrap text
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

export function truncateText(text: string, maxChars: number): string {
  if (text.length > maxChars) {
    return text.substring(0, maxChars - 1) + '…';
  }
  return text;
}

export function getAlignmentPosition(textAnchor: TextAnchor, width: number): number {
  switch (textAnchor) {
    case 'start':
      return 0;
    case 'middle':
      return width / 2;
    case 'end':
      return width;
    default:
      return width / 2;
  }
}