import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Unit tests for the `loginWithInvitationToken` GraphQL mutation resolver.
 *
 * These tests exercise the resolver function in isolation by mocking:
 *  - `payload.db.findOne`          — database lookup
 *  - `payload.collections`         — collection config (for auth settings)
 *  - `payload.secret`              — JWT signing secret
 *  - `payload/getFieldsToSign`     — JWT claims builder
 *  - `payload/jwtSign`             — JWT signer
 *
 * The GraphQL type-system wrappers (args, return type) are NOT tested here;
 * those are covered by the integration/E2E suite.
 */

// ── Mock the payload module's named exports used by the resolver ────────────
vi.mock('payload', async (importOriginal) => {
  const original = await importOriginal<typeof import('payload')>();
  return {
    ...original,
    getFieldsToSign: vi.fn(() => ({
      id: 10,
      email: '',
      collection: CollectionSlug.WEDDING_USERS,
    })),
    jwtSign: vi.fn(async () => ({
      token: 'mocked-jwt-token',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })),
  };
});

import { loginWithInvitationTokenMutation } from '@/domains/wedding/graphql/loginWithInvitationToken';
import { getFieldsToSign, jwtSign } from 'payload';
import { CollectionSlug } from '@/lib/constants';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_SECRET = 'test-secret-key';
const TOKEN_EXPIRATION = 60 * 60 * 24 * 30;

const collectionConfig = {
  slug: CollectionSlug.WEDDING_USERS,
  auth: { tokenExpiration: TOKEN_EXPIRATION },
};

/** Creates a mock PayloadRequest with a configurable `db.findOne` result. */
function makeContext(findOneResult: unknown = null) {
  return {
    req: {
      payload: {
        db: {
          findOne: vi.fn().mockResolvedValue(findOneResult),
        },
        collections: {
          'wedding-users': { config: collectionConfig },
        },
        secret: MOCK_SECRET,
      },
    },
  } as any;
}

/** A valid WeddingUser document as returned by `payload.db.findOne`. */
const validUser = {
  id: 10,
  username: 'elisabeth.lobis',
  invitationToken: 'ABC123',
  roles: [1],
  updatedAt: '',
  createdAt: '',
  collection: CollectionSlug.WEDDING_USERS,
};

/** Extracts the resolve function from the mutation field config. */
const resolve = loginWithInvitationTokenMutation.resolve!;

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('loginWithInvitationToken resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Happy path ──────────────────────────────────────────────────────────

  it('returns a signed JWT on valid credentials', async () => {
    const ctx = makeContext(validUser);
    const args = { username: 'elisabeth.lobis', invitationToken: 'ABC123' };

    const result = (await resolve({}, args, ctx, {} as any)) as {
      token: string;
      exp: string;
      username: string;
    };

    // Verify the DB lookup
    expect(ctx.req.payload.db.findOne).toHaveBeenCalledWith({
      collection: CollectionSlug.WEDDING_USERS,
      req: ctx.req,
      where: { username: { equals: 'elisabeth.lobis' } },
    });

    // Verify getFieldsToSign was called with the collection config and user
    expect(getFieldsToSign).toHaveBeenCalledWith({
      collectionConfig,
      email: '',
      user: validUser,
    });

    // Verify jwtSign was called with the correct params
    expect(jwtSign).toHaveBeenCalledWith({
      fieldsToSign: expect.objectContaining({ id: 10, collection: CollectionSlug.WEDDING_USERS }),
      secret: MOCK_SECRET,
      tokenExpiration: TOKEN_EXPIRATION,
    });

    // Verify the response shape
    expect(result).toEqual({
      token: 'mocked-jwt-token',
      exp: expect.any(String), // ISO-8601 string
      username: 'elisabeth.lobis',
    });

    // exp should be a valid ISO date
    expect(() => new Date(result.exp).toISOString()).not.toThrow();
  });

  // ── Error paths ─────────────────────────────────────────────────────────

  it('throws 403 when username does not exist', async () => {
    const ctx = makeContext(null); // no user found
    const args = { username: 'nobody', invitationToken: 'ABC123' };

    await expect(resolve({}, args, ctx, {} as any)).rejects.toMatchObject({
      message: 'Invalid credentials.',
      status: 403,
    });
  });

  it('throws 403 when invitation token does not match', async () => {
    const ctx = makeContext(validUser);
    const args = { username: 'elisabeth.lobis', invitationToken: 'WRONG' };

    await expect(resolve({}, args, ctx, {} as any)).rejects.toMatchObject({
      message: 'Invalid credentials.',
      status: 403,
    });
  });

  it('throws 403 when user has no invitationToken field', async () => {
    const userWithoutToken = { ...validUser, invitationToken: '' };
    const ctx = makeContext(userWithoutToken);
    const args = { username: 'elisabeth.lobis', invitationToken: 'ABC123' };

    await expect(resolve({}, args, ctx, {} as any)).rejects.toMatchObject({
      message: 'Invalid credentials.',
      status: 403,
    });
  });

  it('throws 403 when user invitationToken is null', async () => {
    const userNullToken = { ...validUser, invitationToken: null };
    const ctx = makeContext(userNullToken);
    const args = { username: 'elisabeth.lobis', invitationToken: 'ABC123' };

    await expect(resolve({}, args, ctx, {} as any)).rejects.toMatchObject({
      message: 'Invalid credentials.',
      status: 403,
    });
  });
});
