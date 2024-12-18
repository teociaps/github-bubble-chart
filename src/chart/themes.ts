export abstract class ThemeBase {
  public abstract textColor: string;
  public abstract backgroundColor: string;
}

export class LightTheme extends ThemeBase {
  public textColor = '#1f2328';
  public backgroundColor = '#ffffff';
}

export class DarkTheme extends ThemeBase {
  public textColor = '#f0f6fc';
  public backgroundColor = '#0d1117';
}

export const themeMap: { [key: string]: ThemeBase } = {
  light: new LightTheme(),
  dark: new DarkTheme(),
};