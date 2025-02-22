import { GeneratorError } from '../../errors/custom-errors.js';
import { chartPadding, legendTextSize } from '../styles.js';
import { BubbleData } from '../types/bubbleData.js';
import { BubbleChartOptions } from '../types/chartOptions.js';
import { measureTextWidth } from '../utils.js';

export async function createLegend(
  data: BubbleData[],
  svgWidth: number,
  maxBubbleY: number,
  distanceFromBubbleChart: number,
  chartOptions: BubbleChartOptions,
): Promise<{ svgLegend: string; legendHeight: number }> {
  try {
    const legendMarginTop = distanceFromBubbleChart; // Distance from the last bubble to the legend
    const legendItemHeight = 20; // Height for each legend row
    const legendYPadding = 10; // Vertical padding between rows
    const legendXPadding = 50; // Horizontal spacing between legend items

    const legendY = maxBubbleY + legendMarginTop; // Start position for the legend
    let svgLegend = `<g class="legend" transform="translate(0, ${legendY})">`;

    // Prepare legend items with their measured widths
    const legendItems = data.map(async (item) => {
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
        width: textWidth + legendXPadding, // Include circle and padding
        color: item.color,
      };
    });

    const rowItems: { text: string; width: number; color: string }[][] = [[]]; // Array of rows, each row contains legend items
    let currentRowWidth = 0;
    let currentRowIndex = 0;

    // Group legend items into rows based on svgWidth
    for await (const i of legendItems) {
      if (currentRowWidth + i.width > svgWidth) {
        currentRowIndex++;
        rowItems[currentRowIndex] = [];
        currentRowWidth = 0;
      }
      rowItems[currentRowIndex].push(i);
      currentRowWidth += i.width;
    }

    // Generate SVG for legend rows
    let rowY = 0;
    rowItems.forEach((row, rowIndex) => {
      const rowWidth = row.reduce((sum, item) => sum + item.width, 0);
      let rowX = 0;

      if (chartOptions.legendOptions.align === 'center') {
        rowX = (svgWidth - rowWidth) / 2;
      } else if (chartOptions.legendOptions.align === 'right') {
        rowX = svgWidth - rowWidth + chartPadding;
      }

      let animationDelay = rowIndex;
      row.forEach((item, itemIndex) => {
        animationDelay += itemIndex * 0.1;
        svgLegend += `
          <g transform="translate(${rowX}, ${rowY})" class="legend-item" style="animation-delay: ${animationDelay}s;">
            <circle cx="10" cy="15" r="8" fill="${item.color}" />
            <text x="22" y="15">${item.text}</text>
          </g>
        `;
        rowX += item.width; // Next item
      });
      rowY += legendItemHeight + legendYPadding; // Next row
    });

    svgLegend += '</g>';

    // Calculate the total height of the legend element
    const legendHeight =
      legendY - maxBubbleY - legendMarginTop + rowY + chartPadding;

    return { svgLegend: svgLegend, legendHeight };
  } catch (error) {
    throw new GeneratorError(
      'Failed to create legend.',
      error instanceof Error ? error : undefined,
    );
  }
}
