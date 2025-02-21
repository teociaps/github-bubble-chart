import { describe, it, expect } from 'vitest';
import {
  LightTheme,
  DarkTheme,
  DarkHighContrastTheme,
  DarkDimmedTheme,
  themeMap,
  DefaultTheme,
} from '../../src/chart/themes';

describe('Themes', () => {
  describe('DefaultTheme from themeMap', () => {
    const theme = themeMap.default;

    it('should have correct properties', () => {
      expect(theme.textColor).toBe('#777777');
      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.border.color).toBe('none');
      expect(theme.border.width).toBe(0);
      expect(theme.border.rounded).toBe(false);
    });
  });

  describe('LightTheme', () => {
    const theme = new LightTheme();

    it('should have correct basic properties', () => {
      expect(theme.textColor).toBe('#1f2328');
      expect(theme.backgroundColor).toBe('#ffffff');
      expect(theme.border.color).toBe(`${theme.textColor}77`);
      expect(theme.border.width).toBe(2);
      expect(theme.border.rounded).toBe(true);
    });
  });

  describe('DarkTheme', () => {
    const theme = new DarkTheme();

    it('should have correct basic properties', () => {
      expect(theme.textColor).toBe('#f0f6fc');
      expect(theme.backgroundColor).toBe('#0d1117');
      expect(theme.border.color).toBe(`${theme.textColor}aa`);
      expect(theme.border.width).toBe(2);
      expect(theme.border.rounded).toBe(true);
    });
  });

  describe('DarkHighContrastTheme', () => {
    const theme = new DarkHighContrastTheme();

    it('should have correct basic properties', () => {
      expect(theme.textColor).toBe('#ffffff');
      expect(theme.backgroundColor).toBe('#010409');
      expect(theme.border.color).toBe(theme.textColor);
      expect(theme.border.width).toBe(1);
      expect(theme.border.rounded).toBe(true);
    });
  });

  describe('DarkDimmedTheme', () => {
    const theme = new DarkDimmedTheme();

    it('should have correct basic properties', () => {
      expect(theme.textColor).toBe('#d1d7e0');
      expect(theme.backgroundColor).toBe('#212830');
      expect(theme.border.color).toBe(`${theme.textColor}55`);
      expect(theme.border.width).toBe(2);
      expect(theme.border.rounded).toBe(true);
    });
  });

  describe('themeMap', () => {
    it('should contain correct themes', () => {
      expect(themeMap.default).toBeInstanceOf(DefaultTheme);
      expect(themeMap.light).toBeInstanceOf(LightTheme);
      expect(themeMap.dark).toBeInstanceOf(DarkTheme);
      expect(themeMap.dark_high_contrast).toBeInstanceOf(DarkHighContrastTheme);
      expect(themeMap.dark_dimmed).toBeInstanceOf(DarkDimmedTheme);
    });
  });
});
