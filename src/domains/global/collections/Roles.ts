import type { CollectionConfig } from 'payload';

import { access, getPopulatedUser, isSuperAdmin, requirePermission } from '@/lib/access';
import { CollectionGroup, CollectionSlug } from '@/lib/constants';
import { Permissions, ROLE_PRESETS } from '@/lib/permissions';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

/**
 * Idents of roles that are managed exclusively by the seeder.
 * No user — including super-admin — may create, update, or delete these roles
 * through the API or admin panel. Their permissions are always synced by the seeder.
 */
const SEEDER_MANAGED_IDENTS = ROLE_PRESETS.map((r) => r.ident);

export const Roles: CollectionConfig = {
  slug: CollectionSlug.ROLES,
  access: {
    create: async ({ req, data }) => {
      const user = await getPopulatedUser(req);
      // Super-admins bypass the permission check but still cannot shadow seeder-managed idents.
      if (!isSuperAdmin(user) && !access(user, Permissions.GLOBAL_ROLES_CREATE))
        return false;
      // Prevent shadowing a seeder-managed role ident (applies to everyone)
      return !(data?.ident && SEEDER_MANAGED_IDENTS.includes(data.ident));
    },
    read: requirePermission(Permissions.GLOBAL_ROLES_READ),
    update: async ({ req }) => {
      const user = await getPopulatedUser(req);
      if (!isSuperAdmin(user) && !access(user, Permissions.GLOBAL_ROLES_UPDATE))
        return false;
      // Seeder-managed roles are immutable — block updates for all users
      return { ident: { not_in: SEEDER_MANAGED_IDENTS } };
    },
    delete: async ({ req }) => {
      const user = await getPopulatedUser(req);
      if (!isSuperAdmin(user) && !access(user, Permissions.GLOBAL_ROLES_DELETE))
        return false;
      // Seeder-managed roles are immutable — block deletes for all users
      return { ident: { not_in: SEEDER_MANAGED_IDENTS } };
    },
  },
  admin: {
    useAsTitle: 'name',
    group: CollectionGroup.GLOBAL,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: {
        en: 'Role Name',
        de: 'Rollenname',
        it: 'Nome del ruolo',
      },
      admin: {
        description: {
          en: 'Human-readable name for the role, e.g. "Wedding Admin"',
          de: 'Menschlich lesbarer Name für die Rolle, z.B. "Hochzeits-Admin"',
          it: 'Nome leggibile dall\'uomo per il ruolo, ad esempio "Admin del matrimonio"',
        },
      },
    },
    {
      name: 'ident',
      type: 'text',
      required: true,
      unique: true,
      label: {
        en: 'Identifier',
        de: 'Bezeichner',
        it: 'Identificatore',
      },
      admin: {
        description: {
          en: 'Immutable identifier used in access checks. Format: domain.roleName',
          de: 'Unveränderlicher Bezeichner, der in Zugriffskontrollen verwendet wird. Format: domain.roleName',
          it: 'Identificatore immutabile utilizzato nei controlli di accesso. Formato: domain.roleName',
        },
      },
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({}),
      label: {
        en: 'Description',
        de: 'Beschreibung',
        it: 'Descrizione',
      },
      admin: {
        description: {
          en: 'Optional description to provide more context about this role.',
          de: 'Optionale Beschreibung, um mehr Kontext zu dieser Rolle zu geben.',
          it: 'Descrizione opzionale per fornire più contesto su questo ruolo.',
        },
      },
    },
    {
      name: 'permissions',
      type: 'relationship',
      relationTo: CollectionSlug.PERMISSIONS,
      hasMany: true,
      label: {
        en: 'Permissions',
        de: 'Berechtigungen',
        it: 'Permessi',
      },
      admin: {
        description: {
          en: 'Select the permissions that belong to this role.',
          de: 'Wählen Sie die Berechtigungen aus, die zu dieser Rolle gehören.',
          it: 'Seleziona i permessi che appartengono a questo ruolo.',
        },
      },
    },
  ],
};
