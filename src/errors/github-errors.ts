import { BaseError } from './base-error.js';

export class GitHubError extends BaseError {
  constructor(readonly status: number, readonly message: string, content?: string) {
    super(status, message, undefined, content);
  }
}

export class GitHubNotFoundError extends GitHubError {
  constructor(content?: string) {
    super(404, 'GitHub Repository Not Found', content ?? 'The requested GitHub repository could not be found.');
  }
}

export class GitHubRateLimitError extends GitHubError {
  constructor(content?: string) {
    super(403, 'GitHub API Rate Limit Exceeded', content ?? 'You have exceeded the GitHub API rate limit.');
  }
}

export class GitHubBadCredentialsError extends GitHubError {
  constructor(content?: string) {
    super(401, 'GitHub Bad Credentials', content ?? 'The provided GitHub credentials are invalid.');
  }
}

export class GitHubAccountSuspendedError extends GitHubError {
  constructor(content?: string) {
    super(403, 'GitHub Account Suspended', content ?? 'The GitHub account has been suspended.');
  }
}

export class GitHubUsernameNotFoundError extends GitHubError {
  constructor(content?: string) {
    super(404, 'GitHub Username Not Found', content ?? 'The requested GitHub username could not be found.');
  }
}
