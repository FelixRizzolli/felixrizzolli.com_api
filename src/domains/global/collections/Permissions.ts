import type { CollectionConfig } from 'payload';

import { CollectionGroup, CollectionSlug } from '@/lib/constants';

/**
 * Each Permission record represents a single atomic capability: one resource × one action.
 * ident format: `domain.resource:action`  e.g. `wedding.images:create`
 */
export const Permissions: CollectionConfig = {
  slug: CollectionSlug.PERMISSIONS,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'ident'],
    group: CollectionGroup.GLOBAL,
  },
  // Permissions are managed entirely through seeders — no manual creation needed.
  access: {
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: {
        en: 'Name',
        de: 'Name',
        it: 'Nome',
      },
      admin: {
        description: {
          en: 'Human-readable label, e.g. "Wedding – Images: Create"',
          de: 'Menschlich lesbares Label, z.B. "Hochzeit – Bilder: Erstellen"',
          it: 'Etichetta leggibile dall\'uomo, ad esempio "Matrimonio – Immagini: Crea"',
        },
        readOnly: true,
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
          en: 'Immutable identifier used in access checks. Format: domain.resource:action',
          de: 'Unveränderlicher Bezeichner, der in Zugriffskontrollen verwendet wird. Format: domain.resource:action',
          it: 'Identificatore immutabile utilizzato nei controlli di accesso. Formato: domain.resource:action',
        },
        readOnly: true,
      },
    },
  ],
};
