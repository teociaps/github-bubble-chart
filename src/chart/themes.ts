export abstract class ThemeBase {
  public abstract textColor: string;
  public abstract backgroundColor: string;
  public abstract border: {
    color: string;
    width: number;
    rounded: boolean;
  };
}

export class DefaultTheme extends ThemeBase {
  public textColor = '#777777';
  public backgroundColor = 'transparent';
  public border = {
    color: 'none',
    width: 0,
    rounded: false,
  };
}

export class LightTheme extends ThemeBase {
  public textColor = '#1f2328';
  public backgroundColor = '#ffffff';
  public border = {
    color: `${this.textColor}77`,
    width: 2,
    rounded: true,
  };
}

export class DarkTheme extends ThemeBase {
  public textColor = '#f0f6fc';
  public backgroundColor = '#0d1117';
  public border = {
    color: `${this.textColor}aa`,
    width: 2,
    rounded: true,
  };
}

export class DarkHighContrastTheme extends ThemeBase {
  public textColor = '#ffffff';
  public backgroundColor = '#010409';
  public border = {
    color: this.textColor,
    width: 1,
    rounded: true,
  };
}

export class DarkDimmedTheme extends ThemeBase {
  public textColor = '#d1d7e0';
  public backgroundColor = '#212830';
  public border = {
    color: `${this.textColor}55`,
    width: 2,
    rounded: true,
  };
}

export const themeMap: { [key: string]: ThemeBase } = {
  default: new DefaultTheme(),
  light: new LightTheme(),
  dark: new DarkTheme(),
  dark_high_contrast: new DarkHighContrastTheme(),
  dark_dimmed: new DarkDimmedTheme(),
};
