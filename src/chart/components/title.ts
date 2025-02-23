import { truncateText } from '../../common/utils.js';
import { GeneratorError } from '../../errors/custom-errors.js';
import { chartPadding } from '../styles.js';
import { TitleOptions } from '../types/chartOptions.js';
import {
  measureTextWidth,
  wrapText,
  escapeSpecialChars,
  parseEmojis,
  toKebabCase,
  getAlignmentPosition,
} from '../utils.js';

export async function createTitleElement(
  titleOptions: TitleOptions,
  width: number,
  titleHeight: number,
): Promise<{ svgTitle: string; titleLines: number }> {
  try {
    const style = generateStyle(titleOptions);
    const titleAlign = getAlignmentPosition(titleOptions.textAnchor, width);
    titleOptions.text = escapeSpecialChars(parseEmojis(titleOptions.text));

    const textWidth = await measureTextWidth(
      titleOptions.text,
      titleOptions.fontSize,
      titleOptions.fontWeight,
    );

    const { textElement, lines } = await generateTextElement(
      titleOptions,
      width,
      titleHeight,
      textWidth,
      titleAlign,
    );

    return {
      svgTitle: generateSVGTitle(
        titleOptions,
        titleAlign,
        titleHeight,
        style,
        textElement,
      ),
      titleLines: lines?.length || 1,
    };
  } catch (error) {
    throw new GeneratorError(
      'Failed to create title element.',
      error instanceof Error ? error : undefined,
    );
  }
}

function generateStyle(titleOptions: TitleOptions): string {
  return Object.keys(titleOptions)
    .filter(
      (style) =>
        style !== 'text' &&
        style !== 'textAnchor' &&
        titleOptions[style] !== null,
    )
    .map((style) => `${toKebabCase(style)}: ${titleOptions[style]};`)
    .join(' ');
}

async function generateTextElement(
  titleOptions: TitleOptions,
  width: number,
  titleHeight: number,
  textWidth: number,
  titleAlign: number,
): Promise<{ textElement: string; lines: string[] | null }> {
  let textElement = '';
  let lines: string[] | null = null;

  if (textWidth > width) {
    lines = await wrapText(
      titleOptions.text,
      width,
      titleOptions.fontSize,
      titleOptions.fontWeight,
    );

    if (lines.length > 3) {
      lines = lines.slice(0, 3);
      lines[2] = truncateText(lines[2], lines[2].length - 3);
    }

    lines.forEach((line, index) => {
      textElement += `
        <tspan x="${titleAlign}" dy="${index === 0 ? 0 : titleHeight}">${line}</tspan>
      `;
    });
  } else {
    textElement = titleOptions.text;
  }

  return { textElement, lines };
}

function generateSVGTitle(
  titleOptions: TitleOptions,
  titleAlign: number,
  titleHeight: number,
  style: string,
  textElement: string,
): string {
  return `
    <text class="bc-title"
          x="${titleAlign}"
          y="${titleHeight + chartPadding}"
          text-anchor="${titleOptions.textAnchor}"
          style="${style.replaceAll('"', "'")}">
      ${textElement}
    </text>
  `;
}
