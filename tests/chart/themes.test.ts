import { describe, it, expect } from 'vitest';
import {
  LightTheme,
  DarkTheme,
  DarkHighContrastTheme,
  DarkDimmedTheme,
  themeMap,
} from '../../src/chart/themes';

describe('Themes', () => {
  it('LightTheme properties', () => {
    const theme = new LightTheme();
    expect(theme.textColor).toBe('#1f2328');
    expect(theme.backgroundColor).toBe('#ffffff');
  });

  it('DarkTheme properties', () => {
    const theme = new DarkTheme();
    expect(theme.textColor).toBe('#f0f6fc');
    expect(theme.backgroundColor).toBe('#0d1117');
  });

  it('DarkHighContrastTheme properties', () => {
    const theme = new DarkHighContrastTheme();
    expect(theme.textColor).toBe('#ffffff');
    expect(theme.backgroundColor).toBe('#010409');
  });

  it('DarkDimmedTheme properties', () => {
    const theme = new DarkDimmedTheme();
    expect(theme.textColor).toBe('#d1d7e0');
    expect(theme.backgroundColor).toBe('#212830');
  });

  it('themeMap contains correct themes', () => {
    expect(themeMap.light).toBeInstanceOf(LightTheme);
    expect(themeMap.dark).toBeInstanceOf(DarkTheme);
    expect(themeMap.dark_high_contrast).toBeInstanceOf(DarkHighContrastTheme);
    expect(themeMap.dark_dimmed).toBeInstanceOf(DarkDimmedTheme);
  });
});
