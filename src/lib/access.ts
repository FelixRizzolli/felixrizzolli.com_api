import type { Access, AccessArgs, PayloadRequest } from 'payload';

import type { Permission as PermissionDoc, Role, User } from '@/payload-types';
import type { Permission } from '@/lib/permissions';

/**
 * Returns `true` when the authenticated user has a role whose `ident` is
 * `"super-admin"`.  Works at depth 1 (roles populated as objects).
 */
export function isSuperAdmin(user: User | null | undefined): boolean {
  if (!user?.roles?.length) return false;

  return user.roles.some(
    (roleOrId) => typeof roleOrId === 'object' && (roleOrId as Role).ident === 'super-admin',
  );
}

/**
 * Extracts every distinct permission `ident` string from a fully-populated user.
 */
export function getUserPermissions(user: User | null | undefined): Permission[] {
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
export function access(user: User | null | undefined, permission: Permission): boolean {
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
 */
export async function getPopulatedUser(req: PayloadRequest): Promise<User | null> {
  const { user, payload } = req;
  if (!user) return null;

  // Already fully populated or no roles assigned → nothing to do.
  if (!user.roles?.length || typeof (user.roles as unknown[])[0] === 'object') {
    return user as User;
  }

  // Roles are plain IDs (depth-0). Re-fetch at depth 2.
  const populated = (await payload.findByID({
    collection: 'users',
    id: user.id as number,
    depth: 2,
    overrideAccess: true,
  })) as User;

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
