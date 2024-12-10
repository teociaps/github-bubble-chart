import { hierarchy, HierarchyCircularNode, max, pack, sum } from 'd3';
import { createSVGDefs } from './defs.js';
import { BubbleChartOptions, BubbleData, TitleOptions } from './types.js';
import { getColor, getName, toKebabCase } from './utils.js';

// TODO: add settings for bubbles style (3d, flat, shadow, inside a box with borders etc..)


const defaultTitleOptions: TitleOptions = {
  text: 'Bubble Chart',
  fontSize: '24px',
  fontWeight: 'bold',
  fill: 'black',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  textAnchor: 'middle',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
};

const defaultChartOptions: BubbleChartOptions = {
  titleOptions: defaultTitleOptions,
  legendOptions: {
    show: true,
    align: 'left'
  }
};

const titleHeight = 40; // Height reserved for the title text
const maxAnimationOffset = 20; // Maximum offset introduced by the animation

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

function createLegend(data: BubbleData[], totalValue: number, width: number, maxY: number): string {
  const legendMarginTop = 50; // Distance from the last bubble to the legend
  const legendItemWidth = 150; // Width for each legend item (circle + text)
  const legendItemHeight = 30; // Height for each legend row
  const legendPadding = 10; // Padding for legend items

  // TODO: manage alignment of the legend based on the options
  let legendX = legendPadding; // Starting X position for the legend
  let legendY = maxY + legendMarginTop; // Starting Y position for the legend
  let svgLegend = `<g class="legend" transform="translate(0, 0)">`;

  data.forEach((item, index) => {
    const percentage = ((item.value / totalValue) * 100).toFixed(2) + '%';

    // If the next item exceeds the width, move to the next row
    if (legendX + legendItemWidth > width) {
      legendX = legendPadding;
      legendY += legendItemHeight;
    }

    // Create a legend item (circle + text)
    svgLegend += `
      <g transform="translate(${legendX}, ${legendY})">
        <circle cx="0" cy="0" r="10" fill="${item.color}" />
        <text x="20" y="5" style="fill: black; font-size: 12px;" dominant-baseline="middle">
          ${item.name} (${percentage})
        </text>
      </g>
    `;

    // Move to the next X position for the next legend item
    legendX += legendItemWidth;
  });

  svgLegend += '</g>'; // Close the legend group
  return svgLegend;
}

/**
 * Create the SVG element for the bubble chart.
 */
export function createBubbleChart(
  data: BubbleData[],
  chartOptions: BubbleChartOptions,
  width: number = 800,
  height: number = 600,
): string | null {
  if (data.length === 0) return null;

  const mergedChartOptions = { ...defaultChartOptions, ...chartOptions };
  const mergedTitleOptions = { ...defaultTitleOptions, ...chartOptions.titleOptions };
  const padding = mergedTitleOptions.padding || {};

  const baseHeight = height;
  const totalValue = sum(data, (d) => d.value); // Total value for percentage calculation
  const bubblesPack = pack<BubbleData>().size([width, baseHeight]).padding(1.5);
  const root = hierarchy({ children: data } as any).sum((d) => d.value);
  const bubbleNodes = bubblesPack(root).leaves();

  // Calculate adjusted height
  const maxY = max(bubbleNodes, (d) => d.y + d.r + maxAnimationOffset) || baseHeight;
  
  // Legend
  let legend = '';
  if (chartOptions.legendOptions.show) {
    legend = createLegend(data, totalValue, width, maxY);
  }

  const legendHeight = Math.ceil(data.length / Math.floor(width / 150)) * 30; // Calculate legend height dynamically
  // const adjustedHeight = maxY + titleHeight + legendHeight + 40; // Add space for the legend and padding
  const adjustedHeight = maxY + titleHeight + legendHeight + (padding.top || 0) + (padding.bottom || 0);

  // Start building the SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${adjustedHeight}" viewBox="0 0 ${width} ${adjustedHeight}">`;

  svg += createSVGDefs();
  svg += createTitleElement(mergedTitleOptions, width, titleHeight, padding);

  svg += `<g transform="translate(0, ${titleHeight + (padding.top || 0)})">`; // TODO: set this more dynamically based on the bubble chart dimensions
  bubbleNodes.forEach((node, index) => {
    svg += createBubbleElement(node, index, totalValue, mergedChartOptions.showPercentages);
  });
  svg += '</g>'; // Close bubbles group

  svg += legend; // Add the legend
  svg += '</svg>';

  return svg;
}
