import type { GlobalConfig } from 'payload';
import { CollectionGroup, CollectionSlug } from '@/lib/constants';
import { requirePermission } from '@/access/hasPermission';
import { Permissions } from '@/lib/permissions';

export const WeddingGlobals: GlobalConfig = {
  slug: CollectionSlug.WEDDING_GLOBALS,
  access: {
    read: requirePermission(Permissions.WEDDING_GLOBALS_READ),
    update: requirePermission(Permissions.WEDDING_GLOBALS_UPDATE),
  },
  admin: {
    group: CollectionGroup.WEDDING,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'Header',
            de: 'Header',
            it: 'Header',
          },
          fields: [],
        },
        {
          label: {
            en: 'Footer',
            de: 'Footer',
            it: 'Footer',
          },
          fields: [],
        },
        {
          label: {
            en: 'Login',
            de: 'Login',
            it: 'Login',
          },
          fields: [
            {
              name: 'loginImage',
              type: 'relationship',
              relationTo: CollectionSlug.WEDDING_IMAGES,
              hasMany: false,
            },
          ],
        },
      ],
    },
  ],
};
