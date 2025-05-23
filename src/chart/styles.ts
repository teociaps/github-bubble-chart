import { HierarchyCircularNode } from 'd3';
import { ThemeBase } from './themes.js';
import { BubbleData } from './types/bubbleData.js';
import { StyleError } from '../errors/custom-errors.js';

export const defaultFontFamily =
  "-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji'";

export const chartPadding = 10;
export const chartBorderRadius = 10;
export const legendTextSize = '13px';

export function getCommonStyles(theme: ThemeBase): string {
  try {
    return `
      svg {
        font-family: ${defaultFontFamily};
      }
      .chart-background {
        fill: ${theme.backgroundColor};
        width: 99%;
        height: 99%;
        x: 0.5%;
        y: 0.5%;
        rx: ${theme.border.rounded ? chartBorderRadius : 0};
      }
      text {
        fill: ${theme.textColor};
      }
      .b-text {
        text-anchor: middle;
      }
      .b-value {
        text-shadow: 0 0 1px ${theme.textColor};
        text-anchor: middle;
      }
      .b-icon {
        filter: drop-shadow(0px 0px .5px ${theme.textColor});
      }
      @keyframes plop {
        0% {
          scale: 0;
        }
        100% {
          scale: 1;
        }
      }
    `;
  } catch (error) {
    throw new StyleError(
      'Failed to get common styles.',
      error instanceof Error ? error : undefined,
    );
  }
}

export function generateBubbleAnimationStyle(
  node: HierarchyCircularNode<BubbleData>,
  index: number,
): string {
  try {
    const radius = node.r;
    const duration = (Math.random() * 5 + 8).toFixed(2);
    const delay = (Math.random() * 2).toFixed(2);
    const randomXOffset = Math.random() * 20 - 10;
    const randomYOffset = Math.random() * 20 - 10;
    const plopDelay = radius * 0.01;

    // TODO: make the animation more fluid/smooth
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
    `;
  } catch (error) {
    throw new StyleError(
      'Failed to generate bubble animation style.',
      error instanceof Error ? error : undefined,
    );
  }
}

export function getLegendItemAnimationStyle(theme: ThemeBase): string {
  try {
    return `
      .legend-item {
        opacity: 0;
        animation: fadeIn 0.3s forwards;
      }
      .legend-item circle {
        stroke: ${theme.textColor};
        stroke-width: .01;
      }
      .legend-item text {
        font-size: ${legendTextSize};
        text-anchor: start;
        dominant-baseline: central;
      }
      @keyframes fadeIn {
        to {
          opacity: 1;
        }
      }
    `;
  } catch (error) {
    throw new StyleError(
      'Failed to get legend item animation style.',
      error instanceof Error ? error : undefined,
    );
  }
}
