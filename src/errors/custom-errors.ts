import { BaseError } from './base-error.js';

export class BadRequestError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(400, 'The request could not be understood by the server due to malformed syntax.', originalError, content);
  }
}

export class NotFoundError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(404, 'The requested resource could not be found.', originalError, content);
  }
}

export class StyleError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(500, 'An error occurred while applying styles.', originalError, content);
  }
}

export class GeneratorError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(500, 'An error occurred while generating the chart.', originalError, content);
  }
}

export class FetchError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(500, 'An error occurred while fetching data.', originalError, content);
  }
}

export class ValidationError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(400, 'The provided data is invalid.', originalError, content);
  }
}

export class SVGGenerationError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(500, 'An error occurred while generating the SVG.', originalError, content);
  }
}
