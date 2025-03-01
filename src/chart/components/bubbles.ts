import { HierarchyCircularNode } from 'd3';
import { GeneratorError } from '../../errors/custom-errors.js';
import { generateBubbleAnimationStyle } from '../styles.js';
import { BubbleData } from '../types/bubbleData.js';
import { BubbleChartOptions } from '../types/chartOptions.js';
import { getColor, getName, wrapText, measureTextHeight } from '../utils.js';

export async function processBubbleNodes(
  bubbleNodes: HierarchyCircularNode<BubbleData>[],
  chartOptions: BubbleChartOptions,
): Promise<{ bubbleElements: string; bubbleStyles: string }> {
  let bubbleElements = '';
  let bubbleStyles = '';
  for (const [index, element] of bubbleNodes.entries()) {
    bubbleElements += await createBubbleElement(element, index, chartOptions);
    bubbleStyles += generateBubbleAnimationStyle(element, index);
  }
  return { bubbleElements, bubbleStyles };
}

async function createBubbleElement(
  node: HierarchyCircularNode<BubbleData>,
  index: number,
  chartOptions: BubbleChartOptions,
): Promise<string> {
  try {
    const color = getColor(node.data);
    const radius = node.r;
    const iconUrl = node.data.icon as string;
    const language = getName(node.data);
    const value = chartOptions.usePercentages
      ? `${node.data.value}%`
      : node.data.value;

    let bubble = `<g class="bubble-${index}" transform="translate(${node.x},${node.y})" data-language="${language}">`;

    bubble += generateEllipses(radius);
    bubble += generateCircleBase(radius, color);
    bubble += await generateIconOrText(iconUrl, language, radius, color);
    bubble += generateValueText(chartOptions, value, radius);

    bubble += '</g>'; // Close the bubble group

    return bubble;
  } catch (error) {
    throw new GeneratorError(
      'Failed to create bubble element.',
      error instanceof Error ? error : undefined,
    );
  }
}

function generateEllipses(radius: number): string {
  return `
    <ellipse rx="${radius * 0.6}" ry="${radius * 0.3}" cx="0" cy="${radius * -0.6}" fill="url(#grad--spot)" transform="rotate(-45)" class="shape"></ellipse>
    <ellipse rx="${radius * 0.4}" ry="${radius * 0.2}" cx="0" cy="${radius * -0.7}" fill="url(#grad--spot)" transform="rotate(-225)" class="shape"></ellipse>
  `;
}

function generateCircleBase(radius: number, color: string): string {
  return `
    <circle r="${radius}" cx="0" cy="0" fill="${color}" mask="url(#mask--light-bottom)" class="shape"></circle>
    <circle r="${radius}" cx="0" cy="0" fill="lightblue" mask="url(#mask--light-top)" class="shape"></circle>
  `;
}

async function generateIconOrText(
  iconUrl: string,
  language: string,
  radius: number,
  color: string,
): Promise<string> {
  if (iconUrl) {
    return `<image class="b-icon" href="${iconUrl}" width="${radius}" height="${radius}" x="${-radius / 2}" y="${-radius / 2}"></image>`;
  } else {
    const fontSize = radius / 3 + 'px';
    const textLines = await wrapText(language, radius * 2, fontSize);

    let displayedText = '';
    if (textLines.length > 1) {
      const lineHeight = await measureTextHeight(language, fontSize);
      const adjustPos = radius / 5;
      textLines.forEach((line, i) => {
        displayedText += `
          <tspan x="0" dy="${i === 0 ? 0 - adjustPos : lineHeight + adjustPos}">${line}</tspan>
        `;
      });
    } else {
      displayedText = language;
    }

    return `<text class="b-text" dy=".3em" style="font-size: ${fontSize}; text-shadow: 0 0 5px ${color};">${displayedText}</text>`;
  }
}

function generateValueText(
  chartOptions: BubbleChartOptions,
  value: string | number,
  radius: number,
): string {
  if (
    chartOptions.displayValues === 'all' ||
    chartOptions.displayValues === 'bubbles'
  ) {
    return `<text class="b-value" dy="3.5em" style="font-size: ${radius / 4}px;">${value}</text>`;
  }
  return '';
}
