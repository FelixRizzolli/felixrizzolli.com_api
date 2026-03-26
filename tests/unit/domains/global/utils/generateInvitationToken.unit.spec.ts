import { describe, it, expect } from 'vitest';

import generateInvitationToken from '@/domains/global/utils/generateInvitationToken';

describe('generateInvitationToken', () => {
  const VALID_CHARS = /^[A-Za-z0-9]+$/;

  it('returns a 6-character string by default', () => {
    const token = generateInvitationToken();
    expect(token).toHaveLength(6);
    expect(token).toMatch(VALID_CHARS);
  });

  it('respects a custom length', () => {
    expect(generateInvitationToken(10)).toHaveLength(10);
    expect(generateInvitationToken(1)).toHaveLength(1);
    expect(generateInvitationToken(32)).toHaveLength(32);
  });

  it('produces only alphanumeric characters', () => {
    // Generate many tokens to increase confidence
    for (let i = 0; i < 50; i++) {
      expect(generateInvitationToken(20)).toMatch(VALID_CHARS);
    }
  });

  it('generates different tokens on consecutive calls (non-deterministic)', () => {
    const tokens = new Set(Array.from({ length: 20 }, () => generateInvitationToken(12)));
    // With 62^12 possible tokens, collisions in 20 runs are virtually impossible
    expect(tokens.size).toBe(20);
  });
});

