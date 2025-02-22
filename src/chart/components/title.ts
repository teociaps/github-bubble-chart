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
    const style = Object.keys(titleOptions)
      .filter(
        (style) =>
          style !== 'text' &&
          style !== 'textAnchor' &&
          titleOptions[style] !== null,
      )
      .map((style) => `${toKebabCase(style)}: ${titleOptions[style]};`)
      .join(' ');

    const titleAlign = getAlignmentPosition(titleOptions.textAnchor, width);

    titleOptions.text = escapeSpecialChars(parseEmojis(titleOptions.text));
    const textWidth = await measureTextWidth(
      titleOptions.text,
      titleOptions.fontSize,
      titleOptions.fontWeight,
    );

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
          <tspan x="${titleAlign + chartPadding}" dy="${index === 0 ? 0 : titleHeight}">${line}</tspan>
        `;
      });
    } else {
      textElement = titleOptions.text;
    }

    return {
      svgTitle: `
        <text class="bc-title"
              x="${titleAlign + chartPadding}"
              y="${titleHeight + chartPadding}"
              text-anchor="${titleOptions.textAnchor}"
              style="${style.replaceAll('"', "'")}">
          ${textElement}
        </text>
      `,
      titleLines: lines?.length || 1,
    };
  } catch (error) {
    throw new GeneratorError(
      'Failed to create title element.',
      error instanceof Error ? error : undefined,
    );
  }
}
