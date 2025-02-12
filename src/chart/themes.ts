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

export class DarkHighContrastTheme extends ThemeBase {
  public textColor = '#ffffff';
  public backgroundColor = '#010409';
}

export class DarkDimmedTheme extends ThemeBase {
  public textColor = '#d1d7e0';
  public backgroundColor = '#212830';
}

export const themeMap: { [key: string]: ThemeBase } = {
  light: new LightTheme(),
  dark: new DarkTheme(),
  dark_high_contrast: new DarkHighContrastTheme(),
  dark_dimmed: new DarkDimmedTheme(),
};
