import { describe, expect, it } from 'vitest';
import logger from '../src/logger';

describe('Logger', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have a functioning info method', () => {
    expect(typeof logger.info).toBe('function');
    // Verify that calling info does not throw.
    expect(() => logger.info('Test log message')).not.toThrow();
  });
});
