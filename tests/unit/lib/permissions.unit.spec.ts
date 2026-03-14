import { describe, it, expect } from 'vitest';

import {
  Permissions,
  ALL_PERMISSIONS,
  isValidPermission,
  hasAllPermissions,
  hasAnyPermission,
} from '@/lib/permissions';

// ─────────────────────────────────────────────────────────────────────────────
// isValidPermission
// ─────────────────────────────────────────────────────────────────────────────

describe('isValidPermission', () => {
  it('returns true for every permission in ALL_PERMISSIONS', () => {
    for (const p of ALL_PERMISSIONS) {
      expect(isValidPermission(p)).toBe(true);
    }
  });

  it('returns false for an arbitrary string', () => {
    expect(isValidPermission('totally.fake:action')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isValidPermission('')).toBe(false);
  });

  it('returns false for a partial match', () => {
    // "wedding.images" without an action is not a valid permission
    expect(isValidPermission('wedding.images')).toBe(false);
  });

  it('is case-sensitive', () => {
    expect(isValidPermission('Wedding.Images:Create')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// hasAllPermissions
// ─────────────────────────────────────────────────────────────────────────────

describe('hasAllPermissions', () => {
  const user = [
    Permissions.WEDDING_IMAGES_READ,
    Permissions.WEDDING_IMAGES_CREATE,
    Permissions.WEDDING_CATEGORIES_READ,
  ];

  it('returns true when user has all required permissions', () => {
    expect(
      hasAllPermissions(user, [Permissions.WEDDING_IMAGES_READ, Permissions.WEDDING_IMAGES_CREATE]),
    ).toBe(true);
  });

  it('returns false when user is missing at least one required permission', () => {
    expect(
      hasAllPermissions(user, [Permissions.WEDDING_IMAGES_READ, Permissions.WEDDING_IMAGES_DELETE]),
    ).toBe(false);
  });

  it('returns true when required array is empty', () => {
    expect(hasAllPermissions(user, [])).toBe(true);
  });

  it('returns false when user has no permissions at all', () => {
    expect(hasAllPermissions([], [Permissions.WEDDING_IMAGES_READ])).toBe(false);
  });

  it('returns true when both arrays are empty', () => {
    expect(hasAllPermissions([], [])).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// hasAnyPermission
// ─────────────────────────────────────────────────────────────────────────────

describe('hasAnyPermission', () => {
  const user = [Permissions.WEDDING_IMAGES_READ, Permissions.WEDDING_CATEGORIES_READ];

  it('returns true when user has at least one required permission', () => {
    expect(
      hasAnyPermission(user, [Permissions.WEDDING_IMAGES_DELETE, Permissions.WEDDING_IMAGES_READ]),
    ).toBe(true);
  });

  it('returns false when user has none of the required permissions', () => {
    expect(
      hasAnyPermission(user, [Permissions.WEDDING_IMAGES_CREATE, Permissions.GLOBAL_USERS_READ]),
    ).toBe(false);
  });

  it('returns false when required array is empty', () => {
    expect(hasAnyPermission(user, [])).toBe(false);
  });

  it('returns false when user has no permissions at all', () => {
    expect(hasAnyPermission([], [Permissions.WEDDING_IMAGES_READ])).toBe(false);
  });
});

