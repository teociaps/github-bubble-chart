import { HierarchyCircularNode } from "d3";
import { ThemeBase } from "./themes.js";
import { BubbleData } from "./types.js";

const defaultFontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"';

export function getCommonStyles(theme: ThemeBase): string {
  return `
    svg {
      font-family: ${defaultFontFamily};
      background: ${theme.backgroundColor};
    }
    text {
      fill: ${theme.textColor};
    }
    .b-percentage {
      text-shadow: 0 0 1px ${theme.textColor};
    }
    .b-icon {
      filter: drop-shadow(0px 0px 1px ${theme.textColor});
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
}

export function generateBubbleAnimationStyle(node: HierarchyCircularNode<BubbleData>, index: number): string {
  const radius = node.r;
  
  // Randomize animation properties
  const duration = (Math.random() * 5 + 8).toFixed(2); // Between 8s and 13s
  const delay = (Math.random() * 2).toFixed(2); // Between 0s and 2s
  const randomXOffset = Math.random() * 20 - 10; // Random -10 to 10
  const randomYOffset = Math.random() * 20 - 10; // Random -10 to 10
  const plopDelay = radius * 0.010;

  // TODO: make the animation more fluid/smooth + make only one style element

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
  `;
}
