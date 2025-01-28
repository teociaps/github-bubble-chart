import { describe, it, expect } from 'vitest';
import {
  BadRequestError,
  NotFoundError,
  StyleError,
  GeneratorError,
  FetchError,
  ValidationError,
  SVGGenerationError,
  MissingUsernameError,
} from '../../src/errors/custom-errors.js';

describe('BadRequestError', () => {
  it('should create a BadRequestError instance', () => {
    const error = new BadRequestError();
    expect(error.status).toBe(400);
    expect(error.message).toBe('Bad Request');
  });
});

describe('NotFoundError', () => {
  it('should create a NotFoundError instance', () => {
    const error = new NotFoundError();
    expect(error.status).toBe(404);
    expect(error.message).toBe('Not Found');
  });
});

describe('StyleError', () => {
  it('should create a StyleError instance', () => {
    const error = new StyleError();
    expect(error.status).toBe(500);
    expect(error.message).toBe('Style Error');
  });
});

describe('GeneratorError', () => {
  it('should create a GeneratorError instance', () => {
    const error = new GeneratorError();
    expect(error.status).toBe(500);
    expect(error.message).toBe('Chart Generator Error');
  });
});

describe('FetchError', () => {
  it('should create a FetchError instance', () => {
    const error = new FetchError();
    expect(error.status).toBe(500);
    expect(error.message).toBe('Fetch Error');
  });
});

describe('ValidationError', () => {
  it('should create a ValidationError instance', () => {
    const error = new ValidationError();
    expect(error.status).toBe(400);
    expect(error.message).toBe('Validation Error');
  });
});

describe('SVGGenerationError', () => {
  it('should create a SVGGenerationError instance', () => {
    const error = new SVGGenerationError();
    expect(error.status).toBe(500);
    expect(error.message).toBe('SVG Generation Error');
  });
});

describe('MissingUsernameError', () => {
  it('should create a MissingUsernameError instance', () => {
    const baseURL = 'http://example.com';
    const error = new MissingUsernameError(baseURL);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Bad Request');
    expect(error.content).toContain('Missing Required Parameter');
  });
});
