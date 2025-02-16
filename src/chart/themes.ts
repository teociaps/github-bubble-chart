export abstract class ThemeBase {
  public abstract textColor: string;
  public abstract backgroundColor: string;
  public abstract border: string;
  public abstract borderRadius: string;
  public abstract padding: string;
}

export class DefaultTheme extends ThemeBase {
  public textColor = '#007acc';
  public backgroundColor = 'transparent';
  public border = 'none';
  public borderRadius = '0';
  public padding = '0';
}

export class LightTheme extends ThemeBase {
  public textColor = '#1f2328';
  public backgroundColor = '#ffffff';
  public border = `1.5px solid ${this.textColor}77`;
  public borderRadius = '.5rem';
  public padding = '.5rem';
}

export class DarkTheme extends ThemeBase {
  public textColor = '#f0f6fc';
  public backgroundColor = '#0d1117';
  public border = `1.5px solid ${this.textColor}aa`;
  public borderRadius = '.5rem';
  public padding = '.5rem';
}

export class DarkHighContrastTheme extends ThemeBase {
  public textColor = '#ffffff';
  public backgroundColor = '#010409';
  public border = `1.5px solid ${this.textColor}`;
  public borderRadius = '.5rem';
  public padding = '.5rem';
}

export class DarkDimmedTheme extends ThemeBase {
  public textColor = '#d1d7e0';
  public backgroundColor = '#212830';
  public border = `1.5px solid ${this.textColor}55`;
  public borderRadius = '.5rem';
  public padding = '.5rem';
}

export const themeMap: { [key: string]: ThemeBase } = {
  default: new DefaultTheme(),
  light: new LightTheme(),
  dark: new DarkTheme(),
  dark_high_contrast: new DarkHighContrastTheme(),
  dark_dimmed: new DarkDimmedTheme(),
};
