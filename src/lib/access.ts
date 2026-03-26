import type { Access, AccessArgs, PayloadRequest } from 'payload';

import type { Permission as PermissionDoc, Role } from '@/payload-types';
import type { Permission } from '@/lib/permissions';
import {
  type AnyRoleBearingUser,
  type RoleBearingCollectionSlug,
  isRoleBearingCollection,
} from '@/lib/role-bearing';

export type { AnyRoleBearingUser };

/**
 * Returns `true` when the authenticated user has a role whose `ident` is
 * `"super-admin"`.  Works at depth 1 (roles populated as objects).
 */
export function isSuperAdmin(user: AnyRoleBearingUser | null | undefined): boolean {
  if (!user?.roles?.length) return false;

  return user.roles.some(
    (roleOrId) => typeof roleOrId === 'object' && (roleOrId as Role).ident === 'super-admin',
  );
}

/**
 * Extracts every distinct permission `ident` string from a fully-populated user.
 */
export function getUserPermissions(user: AnyRoleBearingUser | null | undefined): Permission[] {
  if (!user?.roles?.length) return [];

  const set = new Set<Permission>();

  for (const roleOrId of user.roles) {
    if (typeof roleOrId !== 'object') continue;

    const role = roleOrId as Role;
    if (!role.permissions?.length) continue;

    for (const permOrId of role.permissions) {
      if (typeof permOrId !== 'object') continue;

      const perm = permOrId as PermissionDoc;
      if (perm.ident) {
        set.add(perm.ident as Permission);
      }
    }
  }

  return Array.from(set);
}

/**
 * Returns `true` when the authenticated user holds the given permission.
 */
export function access(
  user: AnyRoleBearingUser | null | undefined,
  permission: Permission,
): boolean {
  return getUserPermissions(user).includes(permission);
}

/**
 * Returns the user populated at depth 2 (roles → permissions).
 *
 * Payload's JWT strategy always fetches the user at depth 0 for GraphQL
 * requests (`isGraphQL ? 0 : collection.config.auth.depth`). This means
 * `req.user.roles` is an array of plain IDs rather than populated Role objects,
 * which breaks every role/permission check.
 *
 * This helper detects that situation, re-fetches the user at depth 2 once,
 * and caches the result back on `req.user` so subsequent access calls within
 * the same request do not hit the database again.
 *
 * Supports every collection registered in `ROLE_BEARING_COLLECTIONS`
 * (lib/role-bearing.ts). To add support for a new auth collection simply
 * append its slug there — no changes needed here.
 */
export async function getPopulatedUser(req: PayloadRequest): Promise<AnyRoleBearingUser | null> {
  const { user, payload } = req;
  if (!user) return null;

  // Determine the collection this user belongs to from the JWT claim.
  const collection = (user as any).collection as string | undefined;

  // Guard: only process users from known role-bearing collections.
  // An undefined or unrecognised collection means the JWT is from a
  // non-role-bearing collection or is malformed — deny safely.
  if (!collection || !isRoleBearingCollection(collection)) {
    payload.logger.warn(
      `getPopulatedUser: collection "${collection}" is not registered in ` +
        'ROLE_BEARING_COLLECTIONS. Access denied. ' +
        'Add it to lib/role-bearing.ts to enable RBAC for this collection.',
    );
    return null;
  }

  // Already fully populated or no roles assigned → nothing to do.
  if (!user.roles?.length || typeof (user.roles as unknown[])[0] === 'object') {
    return user as AnyRoleBearingUser;
  }

  // Roles are plain IDs (depth-0). Re-fetch at depth 2.
  const populated = (await payload.findByID({
    collection: collection as RoleBearingCollectionSlug,
    id: user.id as number,
    depth: 2,
    overrideAccess: true,
  })) as AnyRoleBearingUser;

  // Cache on req so every subsequent access check in this request is free.
  req.user = populated as typeof req.user;
  return populated;
}

/**
 * Factory that produces a Payload `Access` function for a single permission.
 * Super-admins always pass regardless of populated permissions depth.
 */
export function requirePermission(permission: Permission): Access {
  return async ({ req }: AccessArgs): Promise<boolean> => {
    const user = await getPopulatedUser(req);
    return isSuperAdmin(user) || access(user, permission);
  };
}
