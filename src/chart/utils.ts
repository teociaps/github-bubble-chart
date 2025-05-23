import { emojify } from 'node-emoji';
import TextToSVG, { Anchor } from 'text-to-svg';
import { fetchTopLanguages } from '../services/github-service.js';
import { BubbleData, LanguageMappings } from './types/bubbleData.js';
import { TextAnchor } from './types/chartOptions.js';
import { CONSTANTS } from '../../config/consts.js';

async function fetchLanguageMappings(): Promise<LanguageMappings> {
  const response = await fetch(CONSTANTS.LANGUAGE_MAPPINGS_URL, {
    headers: {
      Authorization: `token ${CONSTANTS.GITHUB_TOKEN}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch language mappings');
  }
  return response.json();
}

export const getColor = (d: BubbleData): string => d.color;
export const getName = (d: BubbleData): string => d.name;

export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export async function getBubbleData(
  username: string,
  langsCount: number,
): Promise<BubbleData[]> {
  const languagePercentages = await fetchTopLanguages(username!, langsCount);
  const languageMappings: LanguageMappings = await fetchLanguageMappings();
  return languagePercentages.map((l) => ({
    name: l.language,
    value: Number(l.percentage),
    color: languageMappings[l.language]?.color || '',
    icon: languageMappings[l.language]?.icon || '',
  }));
}

const fontWeightMultipliers: Record<string | number, number> = {
  100: 0.9, // Thin
  200: 0.95, // Extra Light
  300: 0.97, // Light
  400: 1.0, // Normal
  500: 1.03, // Medium
  600: 1.06, // Semi-Bold
  700: 1.08, // Bold
  800: 1.1, // Extra Bold
  900: 1.15, // Black
  normal: 1.0,
  bold: 1.08,
  bolder: 1.15, // Relative boldness (mapped to Black)
  lighter: 0.9, // Relative lightness (mapped to Thin)
};

let textToSVG: TextToSVG | null = null;

async function getTextToSVG(): Promise<TextToSVG> {
  if (!textToSVG) {
    textToSVG = TextToSVG.loadSync();
  }
  return textToSVG;
}

async function measureTextDimension(
  text: string,
  fontSize: string,
  fontWeight: string = 'normal',
  dimension: 'width' | 'height',
): Promise<number> {
  const textToSVG = await getTextToSVG();

  // Convert the font size from a string to a number
  const size = parseFloat(fontSize);

  const sizeMultiplier = fontWeightMultipliers[fontWeight] || 1.0;
  const adjustedSize = size * sizeMultiplier;

  // Generate an SVG path for the text
  const attributes = {
    fontSize: adjustedSize,
    fontWeight,
    anchor: 'left top' as Anchor,
  };

  const svgMetrics = textToSVG.getMetrics(text, attributes);

  // Return the required dimension
  return dimension === 'width' ? svgMetrics.width : svgMetrics.height;
}

export async function measureTextWidth(
  text: string,
  fontSize: string,
  fontWeight: string = 'normal',
): Promise<number> {
  return measureTextDimension(text, fontSize, fontWeight, 'width');
}

export async function measureTextHeight(
  text: string,
  fontSize: string,
  fontWeight: string = 'normal',
): Promise<number> {
  return measureTextDimension(text, fontSize, fontWeight, 'height');
}

export function escapeSpecialChars(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\\/g, '&#92;')
    .replace(/`/g, '&#96;')
    .replace(/{/g, '&#123;')
    .replace(/}/g, '&#125;');
}

export const parseEmojis = (str: string): string => {
  if (!str) {
    throw new Error('[parseEmoji]: str argument not provided');
  }
  if (!/:\w+:/gm.test(str)) {
    return str;
  }
  return str.replace(/:\w+:/gm, (emoji: string) => {
    return emojify(emoji) || '';
  });
};

export async function wrapText(
  text: string,
  maxWidth: number,
  fontSize: string,
  fontWeight: string = 'normal',
): Promise<string[]> {
  const words = escapeSpecialChars(text).split(' ');
  const lines: string[] = [];
  let currentLine = words[0];
  const wordWidths: Record<string, number> = {};

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const combinedText = currentLine + ' ' + word;
    let width = wordWidths[combinedText];

    if (width === undefined) {
      width = await measureTextWidth(combinedText, fontSize, fontWeight);
      wordWidths[combinedText] = width;
    }

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

export function getAlignmentPosition(
  textAnchor: TextAnchor,
  width: number,
  padding: number = 0,
): number {
  switch (textAnchor) {
    case 'start':
      return 0 + padding;
    case 'middle':
      return width / 2;
    case 'end':
      return width - padding;
    default:
      return width / 2;
  }
}
