import { describe, it, expect } from 'vitest';
import { GitHubError, GitHubNotFoundError, GitHubRateLimitError, GitHubBadCredentialsError, GitHubAccountSuspendedError, GitHubUsernameNotFoundError } from '../../src/errors/github-errors.js';

describe('GitHubError', () => {
  it('should create a GitHubError instance', () => {
    const error = new GitHubError(500, 'Internal Server Error');
    expect(error.status).toBe(500);
    expect(error.message).toBe('Internal Server Error');
  });
});

describe('GitHubNotFoundError', () => {
  it('should create a GitHubNotFoundError instance', () => {
    const error = new GitHubNotFoundError();
    expect(error.status).toBe(404);
    expect(error.message).toBe('GitHub Repository Not Found');
  });
});

describe('GitHubRateLimitError', () => {
  it('should create a GitHubRateLimitError instance', () => {
    const error = new GitHubRateLimitError();
    expect(error.status).toBe(403);
    expect(error.message).toBe('GitHub API Rate Limit Exceeded');
  });
});

describe('GitHubBadCredentialsError', () => {
  it('should create a GitHubBadCredentialsError instance', () => {
    const error = new GitHubBadCredentialsError();
    expect(error.status).toBe(401);
    expect(error.message).toBe('GitHub Bad Credentials');
  });
});

describe('GitHubAccountSuspendedError', () => {
  it('should create a GitHubAccountSuspendedError instance', () => {
    const error = new GitHubAccountSuspendedError();
    expect(error.status).toBe(403);
    expect(error.message).toBe('GitHub Account Suspended');
  });
});

describe('GitHubUsernameNotFoundError', () => {
  it('should create a GitHubUsernameNotFoundError instance', () => {
    const error = new GitHubUsernameNotFoundError();
    expect(error.status).toBe(404);
    expect(error.message).toBe('GitHub Username Not Found');
  });
});
