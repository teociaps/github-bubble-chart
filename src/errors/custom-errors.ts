import { BaseError } from './base-error.js';

export class BadRequestError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(400, 'Bad Request', originalError, content);
  }
}

export class NotFoundError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(404, 'Not Found', originalError, content);
  }
}

export class StyleError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(500, 'Style Error', originalError, content);
  }
}

export class GeneratorError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(500, 'Chart Generator Error', originalError, content);
  }
}

export class FetchError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(500, 'Fetch Error', originalError, content);
  }
}

export class ValidationError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(400, 'Validation Error', originalError, content);
  }
}

export class SVGGenerationError extends BaseError {
  constructor(content?: string, public originalError?: Error) {
    super(500, 'SVG Generation Error', originalError, content);
  }
}
