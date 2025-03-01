import { GeneratorError } from '../../errors/custom-errors.js';
import { chartPadding, legendTextSize } from '../styles.js';
import { BubbleData } from '../types/bubbleData.js';
import { BubbleChartOptions } from '../types/chartOptions.js';
import { measureTextWidth } from '../utils.js';

const legendItemHeight = 20;
const legendYPadding = 10;
const legendItemXPadding = 35;
const legendCircleRadius = 8;

export async function createLegend(
  data: BubbleData[],
  svgWidth: number,
  maxBubbleY: number,
  distanceFromBubbleChart: number,
  chartOptions: BubbleChartOptions,
): Promise<{ svgLegend: string; legendHeight: number }> {
  try {
    const legendItems = await prepareLegendItems(data, chartOptions);
    const rowItems = groupLegendItemsIntoRows(legendItems, svgWidth);
    const svgLegend = generateSVGForLegendRows(
      rowItems,
      svgWidth,
      maxBubbleY,
      distanceFromBubbleChart,
      chartOptions,
    );

    const legendHeight = calculateLegendHeight(rowItems);

    return { svgLegend, legendHeight };
  } catch (error) {
    throw new GeneratorError(
      'Failed to create legend.',
      error instanceof Error ? error : undefined,
    );
  }
}

async function prepareLegendItems(
  data: BubbleData[],
  chartOptions: BubbleChartOptions,
): Promise<{ text: string; width: number; color: string }[]> {
  return Promise.all(
    data.map(async (item) => {
      const value =
        chartOptions.displayValues === 'all' ||
        chartOptions.displayValues === 'legend'
          ? chartOptions.usePercentages
            ? ` (${item.value}%)`
            : ` (${item.value})`
          : '';
      const text = `${item.name}${value}`;
      const textWidth = await measureTextWidth(text, legendTextSize);
      return {
        text,
        width: textWidth + legendCircleRadius * 2 + legendItemXPadding, // Include circle and padding
        color: item.color,
      };
    }),
  );
}

function groupLegendItemsIntoRows(
  legendItems: { text: string; width: number; color: string }[],
  svgWidth: number,
): { text: string; width: number; color: string }[][] {
  const rowItems: { text: string; width: number; color: string }[][] = [[]];
  let currentRowWidth = 0;
  let currentRowIndex = 0;

  legendItems.forEach((item) => {
    if (currentRowWidth + item.width > svgWidth) {
      currentRowIndex++;
      rowItems[currentRowIndex] = [];
      currentRowWidth = 0;
    }
    rowItems[currentRowIndex].push(item);
    currentRowWidth += item.width;
  });

  return rowItems;
}

function generateSVGForLegendRows(
  rowItems: { text: string; width: number; color: string }[][],
  svgWidth: number,
  maxBubbleY: number,
  distanceFromBubbleChart: number,
  chartOptions: BubbleChartOptions,
): string {
  let svgLegend = `<g class="legend" transform="translate(${chartPadding}, ${maxBubbleY + distanceFromBubbleChart})">`;

  let rowY = 0;
  rowItems.forEach((row, rowIndex) => {
    const rowWidth = row.reduce((sum, item) => sum + item.width, 0);
    let rowX = 0;

    if (chartOptions.legendOptions.align === 'center') {
      rowX = (svgWidth - rowWidth) / 2;
    } else if (chartOptions.legendOptions.align === 'right') {
      rowX = svgWidth - rowWidth;
    }

    let animationDelay = rowIndex;
    row.forEach((item, itemIndex) => {
      animationDelay += itemIndex * 0.1;
      svgLegend += `
        <g transform="translate(${rowX}, ${rowY})" class="legend-item" style="animation-delay: ${animationDelay}s;">
          <circle cx="10" cy="15" r="${legendCircleRadius}" fill="${item.color}" />
          <text x="22" y="15">${item.text}</text>
        </g>
      `;
      rowX += item.width;
    });
    rowY += legendItemHeight + legendYPadding;
  });

  svgLegend += '</g>';
  return svgLegend;
}

function calculateLegendHeight(
  rowItems: { text: string; width: number; color: string }[][],
): number {
  return rowItems.length * (legendItemHeight + legendYPadding) + chartPadding;
}
