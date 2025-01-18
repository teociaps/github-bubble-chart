import { CustomURLSearchParams, parseParams } from '../../api/utils';
import { LightTheme } from '../../src/chart/themes';
import { describe, it, expect } from 'vitest';

describe('API Utils', () => {
  describe('CustomURLSearchParams', () => {
    it('should return default string value if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getStringValue('key', 'default')).toBe('default');
    });

    it('should return default number value if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getNumberValue('key', 0)).toBe(0);
    });

    it('should return parsed number value if key is present', () => {
      const params = new CustomURLSearchParams('key=42');
      expect(params.getNumberValue('key', 0)).toBe(42);
    });

    it('should return default boolean value if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getBooleanValue('key', true)).toBe(true);
    });

    it('should return parsed boolean value if key is present', () => {
      const params = new CustomURLSearchParams('key=true');
      expect(params.getBooleanValue('key', false)).toBe(true);
    });

    it('should return default theme if key is not present', () => {
      const params = new CustomURLSearchParams('');
      expect(params.getTheme('theme', new LightTheme())).toBeInstanceOf(LightTheme);
    });

    it('should return parsed theme if key is present', () => {
      const params = new CustomURLSearchParams('theme=light');
      expect(params.getTheme('theme', new LightTheme())).toBeInstanceOf(LightTheme);
    });
  });

  describe('parseParams', () => {
    it('should parse URL parameters', () => {
      const req = { url: 'http://example.com?key=value' };
      const params = parseParams(req as any);
      expect(params.get('key')).toBe('value');
    });

    it('should return empty params if no query string is present', () => {
      const req = { url: 'http://example.com' };
      const params = parseParams(req as any);
      expect(params.get('key')).toBeNull();
    });
  });
});
