/**
 * Single source of truth for all permissions in the application.
 *
 * Naming convention: `domain.resource:action`
 *   - domain   → top-level area (global, wedding, …)
 *   - resource → camelCase collection name (users, categoryGroups, …)
 *   - action   → create | read | update | delete
 *
 * Example: `wedding.categoryGroups:create`
 */

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────

export const Actions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export type Action = (typeof Actions)[keyof typeof Actions];

// ─────────────────────────────────────────────────────────────────────────────
// Permission Definitions
// ─────────────────────────────────────────────────────────────────────────────

export const Permissions = {
  // ── Global: Users ──────────────────────────────────────────────────────────
  GLOBAL_USERS_CREATE: 'global.users:create',
  GLOBAL_USERS_READ: 'global.users:read',
  GLOBAL_USERS_UPDATE: 'global.users:update',
  GLOBAL_USERS_DELETE: 'global.users:delete',

  // ── Global: Roles ──────────────────────────────────────────────────────────
  GLOBAL_ROLES_CREATE: 'global.roles:create',
  GLOBAL_ROLES_READ: 'global.roles:read',
  GLOBAL_ROLES_UPDATE: 'global.roles:update',
  GLOBAL_ROLES_DELETE: 'global.roles:delete',

  // ── Wedding: Config ────────────────────────────────────────────────────────
  WEDDING_CONFIG_READ: 'wedding.config:read',
  WEDDING_CONFIG_UPDATE: 'wedding.config:update',

  // ── Wedding: User ──────────────────────────────────────────────────────────
  WEDDING_USERS_CREATE: 'wedding.users:create',
  WEDDING_USERS_READ: 'wedding.users:read',
  WEDDING_USERS_UPDATE: 'wedding.users:update',
  WEDDING_USERS_DELETE: 'wedding.users:delete',

  // ── Wedding: Images ────────────────────────────────────────────────────────
  WEDDING_IMAGES_CREATE: 'wedding.images:create',
  WEDDING_IMAGES_READ: 'wedding.images:read',
  WEDDING_IMAGES_UPDATE: 'wedding.images:update',
  WEDDING_IMAGES_DELETE: 'wedding.images:delete',

  // ── Wedding: Categories ────────────────────────────────────────────────────
  WEDDING_CATEGORIES_CREATE: 'wedding.categories:create',
  WEDDING_CATEGORIES_READ: 'wedding.categories:read',
  WEDDING_CATEGORIES_UPDATE: 'wedding.categories:update',
  WEDDING_CATEGORIES_DELETE: 'wedding.categories:delete',

  // ── Wedding: Category Groups ───────────────────────────────────────────────
  WEDDING_CATEGORY_GROUPS_CREATE: 'wedding.categoryGroups:create',
  WEDDING_CATEGORY_GROUPS_READ: 'wedding.categoryGroups:read',
  WEDDING_CATEGORY_GROUPS_UPDATE: 'wedding.categoryGroups:update',
  WEDDING_CATEGORY_GROUPS_DELETE: 'wedding.categoryGroups:delete',

  // ── Wedding: Issues ────────────────────────────────────────────────────────
  WEDDING_ISSUES_CREATE: 'wedding.issues:create',
  WEDDING_ISSUES_READ: 'wedding.issues:read',
  WEDDING_ISSUES_UPDATE: 'wedding.issues:update',
  WEDDING_ISSUES_DELETE: 'wedding.issues:delete',
} as const;

/** Union type of every permission string, e.g. `'wedding.images:create'` */
export type Permission = (typeof Permissions)[keyof typeof Permissions];

/** All permission values as a readonly array — used for seeding & validation */
export const ALL_PERMISSIONS = Object.values(Permissions) as Permission[];

// ─────────────────────────────────────────────────────────────────────────────
// Permission Groups  (for admin UI, bulk-assignment, docs, etc.)
// ─────────────────────────────────────────────────────────────────────────────

export type PermissionGroup = {
  /** Human-readable label shown in the admin panel */
  label: string;
  permissions: Permission[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: 'Global – Users',
    permissions: [
      Permissions.GLOBAL_USERS_CREATE,
      Permissions.GLOBAL_USERS_READ,
      Permissions.GLOBAL_USERS_UPDATE,
      Permissions.GLOBAL_USERS_DELETE,
    ],
  },
  {
    label: 'Global – Roles',
    permissions: [
      Permissions.GLOBAL_ROLES_CREATE,
      Permissions.GLOBAL_ROLES_READ,
      Permissions.GLOBAL_ROLES_UPDATE,
      Permissions.GLOBAL_ROLES_DELETE,
    ],
  },
  {
    label: 'Wedding - Config',
    permissions: [Permissions.WEDDING_CONFIG_READ, Permissions.WEDDING_CONFIG_UPDATE],
  },
  {
    label: 'Wedding – User',
    permissions: [
      Permissions.WEDDING_USERS_CREATE,
      Permissions.WEDDING_USERS_READ,
      Permissions.WEDDING_USERS_UPDATE,
      Permissions.WEDDING_USERS_DELETE,
    ],
  },
  {
    label: 'Wedding – Images',
    permissions: [
      Permissions.WEDDING_IMAGES_CREATE,
      Permissions.WEDDING_IMAGES_READ,
      Permissions.WEDDING_IMAGES_UPDATE,
      Permissions.WEDDING_IMAGES_DELETE,
    ],
  },
  {
    label: 'Wedding – Categories',
    permissions: [
      Permissions.WEDDING_CATEGORIES_CREATE,
      Permissions.WEDDING_CATEGORIES_READ,
      Permissions.WEDDING_CATEGORIES_UPDATE,
      Permissions.WEDDING_CATEGORIES_DELETE,
    ],
  },
  {
    label: 'Wedding – Category Groups',
    permissions: [
      Permissions.WEDDING_CATEGORY_GROUPS_CREATE,
      Permissions.WEDDING_CATEGORY_GROUPS_READ,
      Permissions.WEDDING_CATEGORY_GROUPS_UPDATE,
      Permissions.WEDDING_CATEGORY_GROUPS_DELETE,
    ],
  },
  {
    label: 'Wedding – Issues',
    permissions: [
      Permissions.WEDDING_ISSUES_CREATE,
      Permissions.WEDDING_ISSUES_READ,
      Permissions.WEDDING_ISSUES_UPDATE,
      Permissions.WEDDING_ISSUES_DELETE,
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Role Presets  (used by the seeder to create default roles)
// ─────────────────────────────────────────────────────────────────────────────

export type LocalizedString = {
  en: string;
  de: string;
  it: string;
};

export type RolePreset = {
  name: LocalizedString;
  ident: string;
  description: string;
  permissions: Permission[];
};

export const ROLE_PRESETS: RolePreset[] = [
  {
    name: {
      en: 'Super Admin',
      de: 'Super Admin',
      it: 'Super Admin',
    },
    ident: 'super-admin',
    description: 'Unrestricted access to every resource.',
    permissions: ALL_PERMISSIONS,
  },
  {
    name: {
      en: 'Wedding Editor',
      de: 'Hochzeits-Editor',
      it: 'Editor Matrimonio',
    },
    ident: 'wedding-editor',
    description: 'Full CRUD access to all Wedding resources.',
    permissions: [
      Permissions.WEDDING_CONFIG_READ,
      Permissions.WEDDING_CONFIG_UPDATE,
      Permissions.WEDDING_USERS_CREATE,
      Permissions.WEDDING_USERS_READ,
      Permissions.WEDDING_USERS_UPDATE,
      Permissions.WEDDING_USERS_DELETE,
      Permissions.WEDDING_IMAGES_CREATE,
      Permissions.WEDDING_IMAGES_READ,
      Permissions.WEDDING_IMAGES_UPDATE,
      Permissions.WEDDING_IMAGES_DELETE,
      Permissions.WEDDING_CATEGORIES_CREATE,
      Permissions.WEDDING_CATEGORIES_READ,
      Permissions.WEDDING_CATEGORIES_UPDATE,
      Permissions.WEDDING_CATEGORIES_DELETE,
      Permissions.WEDDING_CATEGORY_GROUPS_CREATE,
      Permissions.WEDDING_CATEGORY_GROUPS_READ,
      Permissions.WEDDING_CATEGORY_GROUPS_UPDATE,
      Permissions.WEDDING_CATEGORY_GROUPS_DELETE,
      Permissions.WEDDING_ISSUES_CREATE,
      Permissions.WEDDING_ISSUES_READ,
      Permissions.WEDDING_ISSUES_UPDATE,
      Permissions.WEDDING_ISSUES_DELETE,
    ],
  },
  {
    name: {
      en: 'Wedding Guest',
      de: 'Hochzeitsgast',
      it: 'Ospite Matrimonio',
    },
    ident: 'wedding-guest',
    description: 'Read-only access to all Wedding resources.',
    permissions: [
      Permissions.WEDDING_CONFIG_READ,
      Permissions.WEDDING_USERS_READ,
      Permissions.WEDDING_IMAGES_READ,
      Permissions.WEDDING_CATEGORIES_READ,
      Permissions.WEDDING_CATEGORY_GROUPS_READ,
      Permissions.WEDDING_ISSUES_READ,
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Utility Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Narrows an unknown string to `Permission`. */
export function isValidPermission(value: string): value is Permission {
  return ALL_PERMISSIONS.includes(value as Permission);
}

/** Returns `true` when the user holds **every** required permission. */
export function hasAllPermissions(userPermissions: Permission[], required: Permission[]): boolean {
  return required.every((p) => userPermissions.includes(p));
}

/** Returns `true` when the user holds **at least one** required permission. */
export function hasAnyPermission(userPermissions: Permission[], required: Permission[]): boolean {
  return required.some((p) => userPermissions.includes(p));
}
