import { hierarchy, HierarchyCircularNode, max, pack, sum } from 'd3';
import { createSVGDefs } from './defs.js';
import { BubbleChartOptions, BubbleData, LegendOptions, TitleOptions } from './types.js';
import { getColor, getName, toKebabCase } from './utils.js';

// TODO: add settings for bubbles style (3d, flat, shadow, inside a box with borders etc..)

const titleHeight = 40; // Height reserved for the title text
const maxAnimationOffset = 20; // Maximum offset introduced by the animation
const defaultFontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"';

function createTitleElement(
  titleOptions: TitleOptions,
  width: number,
  titleHeight: number,
  padding: any,
): string {
  const style = Object.keys(titleOptions)
    .filter((style) => style !== 'padding' && style !== 'text' && titleOptions[style] != null)
    .map((style) => `${toKebabCase(style)}: ${titleOptions[style]};`)
    .join(' ');

  return `
    <text class="bc-title"
          x="${width / 2 + (padding.left || 0) - (padding.right || 0)}"
          y="${titleHeight + (padding.top || 0) - (padding.bottom || 0)}"
          style="${style.replaceAll('"', "'")}">
      ${titleOptions.text}
    </text>
  `;
}

function createBubbleElement(
  node: HierarchyCircularNode<BubbleData>,
  index: number,
  totalValue: number,
  showPercentages?: boolean,
): string {
  const color = getColor(node.data);
  const radius = node.r;
  const iconUrl = node.data.icon as string;
  const language = node.data.name as string;
  const percentage = ((node.data.value / totalValue) * 100).toFixed(2) + '%';

  // Main group for the bubble
  let bubble = `<g class="bubble-${index}" transform="translate(${node.x},${node.y})" data-language="${language}">`;

  // Ellipses for 3D effect
  bubble += `
    <ellipse rx="${radius * 0.6}" ry="${radius * 0.3}" cx="0" cy="${radius * -0.6}" fill="url(#grad--spot)" transform="rotate(-45)" class="shape"></ellipse>
    <ellipse rx="${radius * 0.4}" ry="${radius * 0.2}" cx="0" cy="${radius * -0.7}" fill="url(#grad--spot)" transform="rotate(-225)" class="shape"></ellipse>
  `;

  // Circle base
  bubble += `
    <circle r="${radius}" cx="0" cy="0" fill="${color}" mask="url(#mask--light-bottom)" class="shape"></circle>
    <circle r="${radius}" cx="0" cy="0" fill="lightblue" mask="url(#mask--light-top)" class="shape"></circle>
  `;

  // Icon or text inside the bubble
  if (iconUrl) {
    bubble += `<image href="${iconUrl}" width="${radius}" height="${radius}" x="${-radius / 2}" y="${-radius / 2}"></image>`;
  } else {
    bubble += `<text dy=".3em" text-anchor="middle" style="fill: white; font-size: ${radius / 3}px;">${getName(node.data)}</text>`;
  }

  // Percentage text
  if (showPercentages) {
    bubble += `<text class="b-percentage" dy="3.5em" text-anchor="middle" style="fill: white; font-size: ${radius / 4}px;">${percentage}</text>`;
  }

  bubble += '</g>'; // Close the bubble group

  // Generate animation style
  const animationStyle = createBubbleAnimation(node, index);

  // Append the animation style
  bubble += `<style>${animationStyle}</style>`;

  return bubble;
}

function createBubbleAnimation(node: any, index: number): string {
  const radius = node.r;
  
  // Randomize animation properties
  const duration = (Math.random() * 5 + 8).toFixed(2); // Between 8s and 13s
  const delay = (Math.random() * 2).toFixed(2); // Between 0s and 2s
  const randomXOffset = Math.random() * 20 - 10; // Random -10 to 10
  const randomYOffset = Math.random() * 20 - 10; // Random -10 to 10
  const plopDelay = radius * 0.010;

  // TODO: make the animation more fluid/smooth + move plop out + make only one style element

  // Define animation keyframes for this bubble
  return `
    .bubble-${index} {
      scale: 0;
      animation: float-${index} ${duration}s ease-in-out infinite ${delay}s, plop 1s ease-out forwards ${plopDelay}s;
      transform-origin: ${node.x}px ${node.y}px;
    }
    @keyframes float-${index} {
      0% {
        transform: translate(${node.x}px, ${node.y}px);
      }
      25% {
        transform: translate(${node.x + randomXOffset}px, ${node.y + randomYOffset}px);
      }
      50% {
        transform: translate(${node.x - randomXOffset}px, ${node.y - randomYOffset}px);
      }
      75% {
        transform: translate(${node.x + randomXOffset / 2}px, ${node.y - randomYOffset / 2}px);
      }
      100% {
        transform: translate(${node.x}px, ${node.y}px);
      }
    }

    @keyframes plop {
      0% {
        scale: 0; /* Start small (invisible) */
      }
      100% {
        scale: 1; /* Scale to full size */
      }
    }
  `;

  // TODO: choose animation or make it customizable(?)
}

function createLegend(data: BubbleData[], totalValue: number, width: number, maxY: number, legendOptions: LegendOptions): { legendSvg: string; legendHeight: number } {
  const legendMarginTop = 50; // Distance from the last bubble to the legend
  const legendItemHeight = 20; // Height for each legend row
  const legendPadding = 10; // Padding for legend items
  const legendXPadding = 20; // Horizontal spacing between legend items

  let legendX = 0; // Current X position for the legend item
  let legendY = maxY + legendMarginTop; // Start position for the legend
  let currentRowWidth = 0; // Track the width of the current row

  let svgLegend = `<g class="legend" transform="translate(0, 0)">`;

  const measureTextWidth = (text: string): number => {
    const charWidth = 6; // Approximate width per character for font-size 12px
    return text.length * charWidth;
  };

  data.forEach((item, index) => {
    const percentage = ((item.value / totalValue) * 100).toFixed(2) + '%';
    const textWidth = measureTextWidth(`${item.name} (${percentage})`) + legendXPadding;
    const itemWidth = textWidth + 30; // Add extra width for circle + padding

    // Check if adding the next item exceeds the chart width
    if (legendX + itemWidth > width) {
      legendX = 0; // Reset X position
      legendY += legendItemHeight + legendPadding; // Move to the next row
      currentRowWidth = 0; // Reset row width
    }

    // FIX: center and right
    // Calculate starting X position based on alignment
    let startX = legendX;
    if (legendOptions.align === 'center') {
      startX = (width - currentRowWidth - itemWidth) / 2 + legendX;
    } else if (legendOptions.align === 'right') {
      startX = width - currentRowWidth - itemWidth + legendX;
    }

    // Create a legend item (circle + text)
    svgLegend += `
      <g transform="translate(${startX}, ${legendY})" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="${index * 0.2}s" fill="freeze" />
        <circle cx="10" cy="15" r="8" fill="${item.color}" />
        <text x="20" y="16" style="fill: black; font-size: 12px; text-anchor: start; dominant-baseline: middle;">
          ${item.name} (${percentage})
        </text>
      </g>
    `;

    legendX += itemWidth; // Move X for the next item
    currentRowWidth += itemWidth; // Add to the current row width
  });

  svgLegend += '</g>';

  // Calculate the total height of the legend element
  const legendHeight = legendY - maxY;

  return { legendSvg: svgLegend, legendHeight };
}

/**
 * Create the SVG element for the bubble chart.
 */
export function createBubbleChart(
  data: BubbleData[],
  chartOptions: BubbleChartOptions
): string | null {
  if (data.length === 0) return null;

  const width = chartOptions.width;
  const height = chartOptions.height;
  const padding = chartOptions.titleOptions.padding || {};
  const baseHeight = height;
  const totalValue = sum(data, (d) => d.value); // Total value for percentage calculation
  const bubblesPack = pack<BubbleData>().size([width, baseHeight]).padding(1.5);
  const root = hierarchy({ children: data } as any).sum((d) => d.value);
  const bubbleNodes = bubblesPack(root).leaves();

  // Calculate adjusted height
  const maxY = max(bubbleNodes, (d) => d.y + d.r + maxAnimationOffset) || baseHeight;
  let adjustedHeight = maxY + titleHeight + (padding.top || 0) + (padding.bottom || 0);

  // Legend
  let legend = '';
  if (chartOptions.legendOptions.show) {
    const legendResult = createLegend(data, totalValue, width, maxY, chartOptions.legendOptions);
    legend = legendResult.legendSvg;
    adjustedHeight += legendResult.legendHeight;
  }

  // Start building the SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${adjustedHeight}" viewBox="0 0 ${width} ${adjustedHeight}">`;
  svg += createSVGDefs();

  svg += `<style>
      svg {
        font-family: ${defaultFontFamily};
      }
    </style>`

  svg += createTitleElement(chartOptions.titleOptions, width, titleHeight, padding);

  svg += `<g transform="translate(0, ${titleHeight + (padding.top || 0)})">`; // TODO: set this more dynamically based on the bubble chart dimensions
  bubbleNodes.forEach((node, index) => {
    svg += createBubbleElement(node, index, totalValue, chartOptions.showPercentages);
  });
  svg += '</g>'; // Close bubbles group

  svg += legend; // Add the legend
  svg += '</svg>';

  return svg;
}
