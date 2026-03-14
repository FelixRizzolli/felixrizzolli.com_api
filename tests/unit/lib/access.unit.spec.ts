import { describe, it, expect } from 'vitest';

import { getUserPermissions, access, requirePermission, isSuperAdmin } from '@/lib/access';
import { Permissions } from '@/lib/permissions';
import type { User, Role, Permission as PermissionDoc } from '@/payload-types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Builds a minimal PermissionDoc stub. */
const makePermission = (ident: string, id = 1): PermissionDoc => ({
  id,
  name: `Test: ${ident}`,
  ident,
  updatedAt: '',
  createdAt: '',
});

/** Builds a minimal Role stub with optional populated permissions. */
const makeRole = (ident: string, permissions: (number | PermissionDoc)[] = [], id = 1): Role => ({
  id,
  name: ident,
  ident,
  permissions,
  updatedAt: '',
  createdAt: '',
});

/** Builds a minimal User stub. */
const makeUser = (roles: (number | Role)[] = []): User => ({
  id: 1,
  username: 'test',
  email: 'test@example.com',
  roles,
  updatedAt: '',
  createdAt: '',
  collection: 'users',
});

// ─────────────────────────────────────────────────────────────────────────────
// getUserPermissions
// ─────────────────────────────────────────────────────────────────────────────

describe('getUserPermissions', () => {
  it('returns [] for null user', () => {
    expect(getUserPermissions(null)).toEqual([]);
  });

  it('returns [] for undefined user', () => {
    expect(getUserPermissions(undefined)).toEqual([]);
  });

  it('returns [] when roles are empty', () => {
    const user = makeUser([]);
    expect(getUserPermissions(user)).toEqual([]);
  });

  it('skips un-populated (numeric) role IDs gracefully', () => {
    const user = makeUser([42, 99]); // roles are just IDs, not objects
    expect(getUserPermissions(user)).toEqual([]);
  });

  it('skips un-populated (numeric) permission IDs within a role', () => {
    const role = makeRole('editor', [1, 2, 3]); // permissions are numeric IDs
    const user = makeUser([role]);
    expect(getUserPermissions(user)).toEqual([]);
  });

  it('returns all permissions from a single populated role', () => {
    const perm1 = makePermission(Permissions.WEDDING_IMAGES_READ, 1);
    const perm2 = makePermission(Permissions.WEDDING_IMAGES_CREATE, 2);
    const role = makeRole('editor', [perm1, perm2]);
    const user = makeUser([role]);

    expect(getUserPermissions(user)).toEqual(
      expect.arrayContaining([Permissions.WEDDING_IMAGES_READ, Permissions.WEDDING_IMAGES_CREATE]),
    );
  });

  it('deduplicates permissions shared by multiple roles', () => {
    const perm = makePermission(Permissions.WEDDING_IMAGES_READ, 1);
    const role1 = makeRole('editor', [perm], 1);
    const role2 = makeRole('viewer', [perm], 2);
    const user = makeUser([role1, role2]);

    const result = getUserPermissions(user);
    expect(result.filter((p) => p === Permissions.WEDDING_IMAGES_READ)).toHaveLength(1);
  });

  it('merges permissions from multiple roles', () => {
    const perm1 = makePermission(Permissions.WEDDING_IMAGES_READ, 1);
    const perm2 = makePermission(Permissions.WEDDING_CATEGORIES_READ, 2);
    const role1 = makeRole('editor', [perm1], 1);
    const role2 = makeRole('viewer', [perm2], 2);
    const user = makeUser([role1, role2]);

    expect(getUserPermissions(user)).toEqual(
      expect.arrayContaining([
        Permissions.WEDDING_IMAGES_READ,
        Permissions.WEDDING_CATEGORIES_READ,
      ]),
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// access
// ─────────────────────────────────────────────────────────────────────────────

describe('access', () => {
  it('returns false for null user', () => {
    expect(access(null, Permissions.WEDDING_IMAGES_READ)).toBe(false);
  });

  it('returns true when user has the required permission', () => {
    const perm = makePermission(Permissions.WEDDING_IMAGES_READ);
    const user = makeUser([makeRole('editor', [perm])]);
    expect(access(user, Permissions.WEDDING_IMAGES_READ)).toBe(true);
  });

  it('returns false when user is missing the required permission', () => {
    const perm = makePermission(Permissions.WEDDING_IMAGES_CREATE);
    const user = makeUser([makeRole('editor', [perm])]);
    expect(access(user, Permissions.WEDDING_IMAGES_READ)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isSuperAdmin
// ─────────────────────────────────────────────────────────────────────────────

describe('isSuperAdmin', () => {
  it('returns false for null user', () => {
    expect(isSuperAdmin(null)).toBe(false);
  });

  it('returns false when user has no roles', () => {
    expect(isSuperAdmin(makeUser([]))).toBe(false);
  });

  it('returns false when no role has ident === "super-admin"', () => {
    const user = makeUser([makeRole('wedding-editor')]);
    expect(isSuperAdmin(user)).toBe(false);
  });

  it('returns true when user has a populated super-admin role', () => {
    const user = makeUser([makeRole('super-admin')]);
    expect(isSuperAdmin(user)).toBe(true);
  });

  it('returns false when super-admin role is an un-populated numeric ID', () => {
    // If the role is just a number (not populated), we cannot check ident
    const user = makeUser([1]);
    expect(isSuperAdmin(user)).toBe(false);
  });

  it('returns true even when other roles are mixed in', () => {
    const user = makeUser([makeRole('wedding-editor', [], 2), makeRole('super-admin', [], 3)]);
    expect(isSuperAdmin(user)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// requirePermission (Access factory)
// ─────────────────────────────────────────────────────────────────────────────

describe('requirePermission', () => {
  const accessFn = requirePermission(Permissions.WEDDING_IMAGES_READ);

  const makeArgs = (user: User | null) => ({ req: { user } }) as any;

  it('returns false when user is null', () => {
    expect(accessFn(makeArgs(null))).toBe(false);
  });

  it('returns false when user lacks the permission', () => {
    const user = makeUser([
      makeRole('editor', [makePermission(Permissions.WEDDING_IMAGES_CREATE)]),
    ]);
    expect(accessFn(makeArgs(user))).toBe(false);
  });

  it('returns true when user holds the permission', () => {
    const perm = makePermission(Permissions.WEDDING_IMAGES_READ);
    const user = makeUser([makeRole('editor', [perm])]);
    expect(accessFn(makeArgs(user))).toBe(true);
  });

  it('returns true for a super-admin regardless of populated permissions', () => {
    // super-admin role exists but permissions array is empty (simulates depth issue)
    const user = makeUser([makeRole('super-admin', [])]);
    expect(accessFn(makeArgs(user))).toBe(true);
  });
});
