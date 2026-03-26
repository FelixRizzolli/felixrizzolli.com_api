import { describe, it, expect, vi } from 'vitest';

import {
  getUserPermissions,
  access,
  requirePermission,
  isSuperAdmin,
  getPopulatedUser,
} from '@/lib/access';
import { Permissions } from '@/lib/permissions';
import type { User, WeddingUser, Role, Permission as PermissionDoc } from '@/payload-types';
import type { PayloadRequest } from 'payload';

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

/** Builds a minimal WeddingUser stub. */
const makeWeddingUser = (roles: (number | Role)[] = []): WeddingUser => ({
  id: 10,
  username: 'guest',
  invitationToken: 'ABC123',
  roles,
  updatedAt: '',
  createdAt: '',
  collection: 'wedding-users',
});

/**
 * Creates a minimal mock PayloadRequest for access-function testing.
 *
 * When `user` has already-populated roles (objects), `getPopulatedUser` returns
 * early without touching `payload`. When roles are plain IDs (depth-0), the
 * `findByID` mock is used for the re-fetch.
 */
const makeReq = (
  user: User | WeddingUser | null,
  findByIDResult?: unknown,
): PayloadRequest => {
  return {
    user,
    payload: {
      findByID: vi.fn().mockResolvedValue(findByIDResult ?? user),
      logger: {
        warn: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
      },
    },
  } as unknown as PayloadRequest;
};

/** Shorthand to create AccessArgs wrapping a request. */
const makeArgs = (req: PayloadRequest) => ({ req }) as any;

// ─────────────────────────────────────────────────────────────────────────────
// getUserPermissions  (pure, synchronous)
// ─────────────────────────────────────────────────────────────────────────────

describe('getUserPermissions', () => {
  it('returns [] for null user', () => {
    expect(getUserPermissions(null)).toEqual([]);
  });

  it('returns [] for undefined user', () => {
    expect(getUserPermissions(undefined)).toEqual([]);
  });

  it('returns [] when roles are empty', () => {
    expect(getUserPermissions(makeUser([]))).toEqual([]);
  });

  it('skips un-populated (numeric) role IDs gracefully', () => {
    expect(getUserPermissions(makeUser([42, 99]))).toEqual([]);
  });

  it('skips un-populated (numeric) permission IDs within a role', () => {
    const role = makeRole('editor', [1, 2, 3]);
    expect(getUserPermissions(makeUser([role]))).toEqual([]);
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

  it('works with WeddingUser the same as User', () => {
    const perm = makePermission(Permissions.WEDDING_IMAGES_READ);
    const role = makeRole('wedding-guest', [perm]);
    const weddingUser = makeWeddingUser([role]);

    expect(getUserPermissions(weddingUser)).toEqual([Permissions.WEDDING_IMAGES_READ]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// access  (pure, synchronous)
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

  it('works with WeddingUser', () => {
    const perm = makePermission(Permissions.WEDDING_IMAGES_READ);
    const weddingUser = makeWeddingUser([makeRole('wedding-guest', [perm])]);
    expect(access(weddingUser, Permissions.WEDDING_IMAGES_READ)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isSuperAdmin  (pure, synchronous)
// ─────────────────────────────────────────────────────────────────────────────

describe('isSuperAdmin', () => {
  it('returns false for null user', () => {
    expect(isSuperAdmin(null)).toBe(false);
  });

  it('returns false when user has no roles', () => {
    expect(isSuperAdmin(makeUser([]))).toBe(false);
  });

  it('returns false when no role has ident === "super-admin"', () => {
    expect(isSuperAdmin(makeUser([makeRole('wedding-editor')]))).toBe(false);
  });

  it('returns true when user has a populated super-admin role', () => {
    expect(isSuperAdmin(makeUser([makeRole('super-admin')]))).toBe(true);
  });

  it('returns false when super-admin role is an un-populated numeric ID', () => {
    expect(isSuperAdmin(makeUser([1]))).toBe(false);
  });

  it('returns true even when other roles are mixed in', () => {
    const user = makeUser([makeRole('wedding-editor', [], 2), makeRole('super-admin', [], 3)]);
    expect(isSuperAdmin(user)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getPopulatedUser  (async — interacts with payload.findByID)
// ─────────────────────────────────────────────────────────────────────────────

describe('getPopulatedUser', () => {
  it('returns null when req.user is null', async () => {
    const req = makeReq(null);
    expect(await getPopulatedUser(req)).toBeNull();
  });

  it('returns null and logs warning for unrecognised collection', async () => {
    const user = { ...makeUser(), collection: 'unknown-collection' } as any;
    const req = makeReq(user);
    req.user = user;

    expect(await getPopulatedUser(req)).toBeNull();
    expect(req.payload.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('unknown-collection'),
    );
  });

  it('returns null and logs warning when collection is undefined', async () => {
    const user = { ...makeUser() } as any;
    delete user.collection;
    const req = makeReq(user);
    req.user = user;

    expect(await getPopulatedUser(req)).toBeNull();
  });

  it('returns user as-is when roles are already populated (depth >= 1)', async () => {
    const perm = makePermission(Permissions.WEDDING_IMAGES_READ);
    const role = makeRole('wedding-guest', [perm]);
    const user = makeUser([role]);
    const req = makeReq(user);

    const result = await getPopulatedUser(req);
    expect(result).toBe(user);
    expect(req.payload.findByID).not.toHaveBeenCalled();
  });

  it('returns user as-is when roles array is empty', async () => {
    const user = makeUser([]);
    const req = makeReq(user);

    const result = await getPopulatedUser(req);
    expect(result).toBe(user);
    expect(req.payload.findByID).not.toHaveBeenCalled();
  });

  it('re-fetches at depth 2 when roles are plain IDs (depth-0 JWT)', async () => {
    const perm = makePermission(Permissions.WEDDING_IMAGES_READ);
    const role = makeRole('wedding-guest', [perm]);
    const populatedUser = makeUser([role]);
    const depthZeroUser = { ...makeUser([1]) };

    const req = makeReq(depthZeroUser, populatedUser);

    const result = await getPopulatedUser(req);

    expect(req.payload.findByID).toHaveBeenCalledWith({
      collection: 'users',
      id: depthZeroUser.id,
      depth: 2,
      overrideAccess: true,
    });
    expect(result).toEqual(populatedUser);
    // The populated user should be cached on req.user
    expect(req.user).toEqual(populatedUser);
  });

  it('re-fetches WeddingUser at depth 2 when roles are plain IDs', async () => {
    const perm = makePermission(Permissions.WEDDING_IMAGES_READ);
    const role = makeRole('wedding-guest', [perm]);
    const populatedWedding = makeWeddingUser([role]);
    const depthZeroWedding = { ...makeWeddingUser([1]) };

    const req = makeReq(depthZeroWedding, populatedWedding);

    const result = await getPopulatedUser(req);

    expect(req.payload.findByID).toHaveBeenCalledWith({
      collection: 'wedding-users',
      id: depthZeroWedding.id,
      depth: 2,
      overrideAccess: true,
    });
    expect(result).toEqual(populatedWedding);
  });

  it('caches the populated user so a second call does not re-fetch', async () => {
    const perm = makePermission(Permissions.WEDDING_IMAGES_READ);
    const role = makeRole('wedding-guest', [perm]);
    const populatedUser = makeUser([role]);
    const depthZeroUser = { ...makeUser([1]) };

    const req = makeReq(depthZeroUser, populatedUser);

    await getPopulatedUser(req);
    expect(req.payload.findByID).toHaveBeenCalledTimes(1);

    // Second call uses cached result (req.user was replaced with populated)
    await getPopulatedUser(req);
    expect(req.payload.findByID).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// requirePermission  (async Access factory — delegates to getPopulatedUser)
// ─────────────────────────────────────────────────────────────────────────────

describe('requirePermission', () => {
  const accessFn = requirePermission(Permissions.WEDDING_IMAGES_READ);

  it('returns false when user is null', async () => {
    const req = makeReq(null);
    await expect(accessFn(makeArgs(req))).resolves.toBe(false);
  });

  it('returns false when user lacks the permission', async () => {
    const user = makeUser([
      makeRole('editor', [makePermission(Permissions.WEDDING_IMAGES_CREATE)]),
    ]);
    const req = makeReq(user);
    await expect(accessFn(makeArgs(req))).resolves.toBe(false);
  });

  it('returns true when user holds the permission', async () => {
    const perm = makePermission(Permissions.WEDDING_IMAGES_READ);
    const user = makeUser([makeRole('editor', [perm])]);
    const req = makeReq(user);
    await expect(accessFn(makeArgs(req))).resolves.toBe(true);
  });

  it('returns true for a super-admin regardless of populated permissions', async () => {
    const user = makeUser([makeRole('super-admin', [])]);
    const req = makeReq(user);
    await expect(accessFn(makeArgs(req))).resolves.toBe(true);
  });

  it('returns true for a WeddingUser with the right permission', async () => {
    const perm = makePermission(Permissions.WEDDING_IMAGES_READ);
    const weddingUser = makeWeddingUser([makeRole('wedding-guest', [perm])]);
    const req = makeReq(weddingUser);
    await expect(accessFn(makeArgs(req))).resolves.toBe(true);
  });

  it('returns false for a WeddingUser without the right permission', async () => {
    const perm = makePermission(Permissions.WEDDING_CATEGORIES_READ);
    const weddingUser = makeWeddingUser([makeRole('wedding-guest', [perm])]);
    const req = makeReq(weddingUser);
    await expect(accessFn(makeArgs(req))).resolves.toBe(false);
  });

  it('re-fetches and grants access when roles are plain IDs (GraphQL depth-0)', async () => {
    const perm = makePermission(Permissions.WEDDING_IMAGES_READ);
    const role = makeRole('wedding-guest', [perm]);
    const populatedUser = makeWeddingUser([role]);
    const depthZeroUser = { ...makeWeddingUser([1]) };

    const req = makeReq(depthZeroUser, populatedUser);
    await expect(accessFn(makeArgs(req))).resolves.toBe(true);
    expect(req.payload.findByID).toHaveBeenCalledTimes(1);
  });

  it('re-fetches and denies access when re-fetched user lacks permission', async () => {
    const perm = makePermission(Permissions.WEDDING_CATEGORIES_READ);
    const role = makeRole('wedding-guest', [perm]);
    const populatedUser = makeWeddingUser([role]);
    const depthZeroUser = { ...makeWeddingUser([1]) };

    const req = makeReq(depthZeroUser, populatedUser);
    await expect(accessFn(makeArgs(req))).resolves.toBe(false);
  });
});
