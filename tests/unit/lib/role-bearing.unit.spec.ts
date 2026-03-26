import { describe, it, expect } from 'vitest';

import {
  ROLE_BEARING_COLLECTIONS,
  isRoleBearingCollection,
} from '@/lib/role-bearing';

describe('ROLE_BEARING_COLLECTIONS', () => {
  it('includes "users"', () => {
    expect(ROLE_BEARING_COLLECTIONS).toContain('users');
  });

  it('includes "wedding-users"', () => {
    expect(ROLE_BEARING_COLLECTIONS).toContain('wedding-users');
  });
});

describe('isRoleBearingCollection', () => {
  it('returns true for "users"', () => {
    expect(isRoleBearingCollection('users')).toBe(true);
  });

  it('returns true for "wedding-users"', () => {
    expect(isRoleBearingCollection('wedding-users')).toBe(true);
  });

  it('returns false for an unknown collection slug', () => {
    expect(isRoleBearingCollection('traveling-users')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isRoleBearingCollection('')).toBe(false);
  });
});

