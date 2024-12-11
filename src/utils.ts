import { LegendOptions, TitleOptions } from "./chart/types.js";

export class CustomURLSearchParams extends URLSearchParams {
  getStringValue(key: string, defaultValue: string): string {
    if (super.has(key)) {
      const param = super.get(key);
      if (param !== null) {
        return param.toString();
      }
    }
    return defaultValue.toString();
  }

  getNumberValue(key: string, defaultValue: number): number {
    if (super.has(key)) {
      const param = super.get(key);
      if (param !== null) {
        const parsedValue = parseInt(param);
        if (isNaN(parsedValue)) {
          return defaultValue;
        }
        return parsedValue;
      }
    }
    return defaultValue;
  }

  getBooleanValue(key: string, defaultValue: boolean): boolean {
    if (super.has(key)) {
      const param = super.get(key);
      return param !== null && param.toString() === 'true';
    }
    return defaultValue;
  }
  
  // TODO: rename the url params
  parseTitleOptions(): TitleOptions {
    return {
      text: this.getStringValue('titleText', 'Bubble Chart'),
      fontSize: this.getStringValue('titleFontSize', '24px'),
      fontWeight: this.getStringValue('titleFontWeight', 'bold'),
      fill: this.getStringValue('titleFill', 'black'),
      padding: {
        top: this.getNumberValue('titlePaddingTop', 0),
        right: this.getNumberValue('titlePaddingRight', 0),
        bottom: this.getNumberValue('titlePaddingBottom', 0),
        left: this.getNumberValue('titlePaddingLeft', 0),
      },
    };
  }

  parseLegendOptions(): LegendOptions {
    return {
      show: this.getBooleanValue('legendShow', false),
      align: (this.getStringValue('legendAlign', 'left') as 'left' | 'center' | 'right'),
    };
  }
}

export function parseParams(req: Request): CustomURLSearchParams {
  const splittedURL = req.url.split('?');
  if (splittedURL.length < 2) {
    return new CustomURLSearchParams();
  }
  return new CustomURLSearchParams(splittedURL[1]);
}
