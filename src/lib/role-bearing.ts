import { CollectionSlug } from '@/lib/constants';
import type { Config } from '@/payload-types';

/**
 * Registry of collection slugs whose documents carry roles and participate
 * in the role-based access control (RBAC) system.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  HOW TO ADD A NEW ROLE-BEARING COLLECTION
 * ─────────────────────────────────────────────────────────────────────────────
 *  1. Create the collection with a `roles` relationship field (→ Roles) and
 *     set `auth: { depth: 2 }` in its Payload config so that
 *     roles → permissions are populated when Payload fetches the user.
 *
 *  2. Append its `CollectionSlug` constant to ROLE_BEARING_COLLECTIONS below.
 *
 *  3. Run `payload generate:types` to regenerate `payload-types.ts`.
 *
 *  4. `AnyRoleBearingUser` and every access helper in `lib/access.ts` update
 *     automatically — no further changes required.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const ROLE_BEARING_COLLECTIONS = [
  CollectionSlug.USERS,
  CollectionSlug.WEDDING_USERS,
] as const;

/** Union type of all role-bearing collection slugs. */
export type RoleBearingCollectionSlug = (typeof ROLE_BEARING_COLLECTIONS)[number];

/**
 * Union type of every role-bearing user document, automatically derived from
 * the registry above.
 *
 * When you append to `ROLE_BEARING_COLLECTIONS` and regenerate types, this
 * union expands with no extra work:
 *
 * @example  User | WeddingUser               (current)
 * @example  User | WeddingUser | TravelUser  (after adding TravelUser)
 */
export type AnyRoleBearingUser = Config['collections'][RoleBearingCollectionSlug];

/**
 * Returns `true` when `slug` belongs to the role-bearing registry.
 *
 * Use this guard in `getPopulatedUser` and anywhere a JWT's collection
 * claim must be validated before trusting it.
 */
export function isRoleBearingCollection(slug: string): slug is RoleBearingCollectionSlug {
  return (ROLE_BEARING_COLLECTIONS as ReadonlyArray<string>).includes(slug);
}
