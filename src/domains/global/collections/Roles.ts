import type { CollectionConfig } from 'payload';

import { CollectionGroup, CollectionSlug } from '@/lib/constants';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

export const Roles: CollectionConfig = {
  slug: CollectionSlug.ROLES,
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
