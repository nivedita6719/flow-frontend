import { isColdStartError, friendlyMessage } from './api';

describe('isColdStartError', () => {
  test('true for a client timeout', () => {
    expect(isColdStartError({ code: 'ECONNABORTED' })).toBe(true);
  });
  test('true for a bare network error', () => {
    expect(isColdStartError({ message: 'Network Error' })).toBe(true);
  });
  test('true for 502/503/504', () => {
    expect(isColdStartError({ response: { status: 502 } })).toBe(true);
    expect(isColdStartError({ response: { status: 503 } })).toBe(true);
    expect(isColdStartError({ response: { status: 504 } })).toBe(true);
  });
  test('false for real HTTP responses', () => {
    expect(isColdStartError({ response: { status: 401 } })).toBe(false);
    expect(isColdStartError({ response: { status: 429 } })).toBe(false);
    expect(isColdStartError({ response: { status: 200 } })).toBe(false);
  });
});

describe('friendlyMessage', () => {
  test('429 -> rate limit wording', () => {
    expect(friendlyMessage({ response: { status: 429 } })).toMatch(/too many attempts/i);
  });
  test('cold start -> waking up wording', () => {
    expect(friendlyMessage({ code: 'ECONNABORTED' })).toMatch(/waking up/i);
  });
  test('passes through the backend message when present', () => {
    expect(
      friendlyMessage({ response: { status: 401, data: { message: 'Invalid email or password' } } })
    ).toBe('Invalid email or password');
  });
  test('has a generic fallback', () => {
    expect(friendlyMessage({ response: { status: 500 } })).toMatch(/something went wrong/i);
  });
});
