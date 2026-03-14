import type { GlobalConfig } from 'payload';
import { CollectionGroup, CollectionSlug } from '@/lib/constants';
import { requirePermission } from '@/lib/access';
import { Permissions } from '@/lib/permissions';

export const WeddingConfig: GlobalConfig = {
  slug: CollectionSlug.WEDDING_CONFIG,
  access: {
    read: requirePermission(Permissions.WEDDING_CONFIG_READ),
    update: requirePermission(Permissions.WEDDING_CONFIG_UPDATE),
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
