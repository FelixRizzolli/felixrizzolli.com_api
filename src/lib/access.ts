import type { Access, AccessArgs } from 'payload';

import type { Permission as PermissionDoc, Role, User } from '@/payload-types';
import type { Permission } from '@/lib/permissions';

/**
 * Returns `true` when the authenticated user has a role whose `ident` is
 * `"super-admin"`.  Works at depth 1 (roles populated as objects) — it does
 * **not** need the nested permissions to be populated.
 */
export function isSuperAdmin(user: User | null | undefined): boolean {
  if (!user?.roles?.length) return false;

  return user.roles.some(
    (roleOrId) => typeof roleOrId === 'object' && (roleOrId as Role).ident === 'super-admin',
  );
}

/**
 * Extracts every distinct permission `ident` string from a fully-populated user.
 *
 * Payload populates `user.roles` with `Role` objects (depth ≥ 1) and each
 * `role.permissions` with `Permission` objects (depth ≥ 2). This helper
 * tolerates un-populated (numeric id) values by skipping them gracefully.
 */
export function getUserPermissions(user: User | null | undefined): Permission[] {
  if (!user?.roles?.length) return [];

  const set = new Set<Permission>();

  for (const roleOrId of user.roles) {
    // Skip un-populated references (numeric ids)
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
 *
 * Usage inside a collection access function:
 * ```ts
 * create: ({ req: { user } }) => access(user, Permissions.WEDDING_IMAGES_CREATE),
 * ```
 */
export function access(user: User | null | undefined, permission: Permission): boolean {
  return getUserPermissions(user).includes(permission);
}

/**
 * Factory that produces a Payload `Access` function for a single permission.
 * Super-admins always pass regardless of populated permissions depth.
 *
 * Usage:
 * ```ts
 * access: {
 *   create: requirePermission(Permissions.WEDDING_IMAGES_CREATE),
 * }
 * ```
 */
export function requirePermission(permission: Permission): Access {
  return ({ req: { user } }: AccessArgs): boolean => isSuperAdmin(user) || access(user, permission);
}
