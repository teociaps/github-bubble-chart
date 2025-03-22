import imageToBase64 from 'image-to-base64';
import { themeMap } from '../chart/themes.js';
import { BubbleChartOptions } from '../chart/types/chartOptions.js';
import { CustomConfigOptions } from '../chart/types/config.js';
import logger from '../logger.js';

export function mapConfigToBubbleChartOptions(
  config: CustomConfigOptions,
): BubbleChartOptions {
  const theme =
    typeof config.theme === 'string'
      ? themeMap[config.theme.toLowerCase()] || themeMap.default
      : config.theme;
  return {
    width: config.width,
    height: config.height,
    displayValues: config.displayValues,
    usePercentages: false,
    titleOptions: {
      text: config.title.text,
      fontSize: config.title.fontSize,
      fontWeight: config.title.fontWeight,
      fill: config.title.color,
      textAnchor: config.title.align,
    },
    legendOptions: {
      show: config.legend.show,
      align: config.legend.align,
    },
    theme: theme,
  };
}

export function truncateText(text: string, maxChars: number): string {
  if (text.length > maxChars) {
    return text.substring(0, maxChars - 1) + '…';
  }
  return text;
}

export function getPxValue(value: string): number {
  if (!value || value === 'none') return 0;
  const pxMatch = value.match(/(\d+(\.\d+)?)(px)/);
  if (pxMatch) {
    return parseFloat(pxMatch[1]);
  }
  return 0;
}

export async function convertImageToBase64(
  url: string,
  options?: { timeout?: number },
): Promise<string | undefined> {
  if (!url || typeof url !== 'string') {
    logger.error('Invalid URL provided to convertImageToBase64');
    return undefined;
  }

  try {
    new URL(url);
  } catch {
    logger.error('Invalid URL format', { url });
    return undefined;
  }

  try {
    const timeoutMs = options?.timeout || 10000; // 10 second timeout

    const base64 = await Promise.race([
      imageToBase64(url),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Image conversion timed out')),
          timeoutMs,
        ),
      ),
    ]);

    // MIME type detection
    const mimeTypeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      bmp: 'image/bmp',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',
      tiff: 'image/tiff',
      tif: 'image/tiff',
      avif: 'image/avif',
    };

    // Extract extension from URL, handling query params and fragments
    const urlPath = new URL(url).pathname;
    const extension = urlPath.split('.').pop()?.toLowerCase().split(/[?#]/)[0];

    // Default to a generic image type if we can't determine the specific type
    const mimeType =
      extension && mimeTypeMap[extension]
        ? mimeTypeMap[extension]
        : 'image/png';

    return `data:${mimeType};base64,${base64}`;
  } catch (_error) {
    const errorMessage =
      _error instanceof Error ? _error.message : 'Unknown error';
    logger.error(`Error converting image to base64: ${errorMessage}`, _error);
    return undefined;
  }
}
