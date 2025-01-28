import { describe, it, expect } from 'vitest';
import {
  getCommonStyles,
  generateBubbleAnimationStyle,
  getLegendItemAnimationStyle,
} from '../../src/chart/styles';
import { LightTheme } from '../../src/chart/themes';
import { HierarchyCircularNode } from 'd3';
import { BubbleData } from '../../src/chart/types/bubbleData';

describe('Styles Tests', () => {
  it('getCommonStyles generates correct styles', () => {
    const theme = new LightTheme();
    const styles = getCommonStyles(theme);
    expect(styles).toContain(`background: ${theme.backgroundColor}`);
    expect(styles).toContain(`fill: ${theme.textColor}`);
  });

  it('generateBubbleAnimationStyle generates correct animation styles', () => {
    const node: HierarchyCircularNode<BubbleData> = {
      r: 10,
      x: 50,
      y: 50,
    } as HierarchyCircularNode<BubbleData>;
    const index = 1;
    const styles = generateBubbleAnimationStyle(node, index);
    expect(styles).toContain(`.bubble-${index}`);
    expect(styles).toContain(`animation: float-${index}`);
  });

  it('getLegendItemAnimationStyle generates correct legend item styles', () => {
    const styles = getLegendItemAnimationStyle();
    expect(styles).toContain('.legend-item');
    expect(styles).toContain('animation: fadeIn');
  });
});
