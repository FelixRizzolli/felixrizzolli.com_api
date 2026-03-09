import type { CollectionConfig } from 'payload';

import { authenticated } from '@/access/authenticated';
import { setCookieBasedOnDomain } from '@/domains/global/hooks/setCookieBasedOnDomain';
import { CollectionGroup, CollectionSlug } from '@/lib/constants';

export const Users: CollectionConfig = {
  slug: CollectionSlug.USERS,
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
    group: CollectionGroup.GLOBAL,
  },
  auth: {
    depth: 1,
  },
  fields: [
    {
      admin: {
        position: 'sidebar',
      },
      name: 'roles',
      type: 'select',
      defaultValue: ['user'],
      hasMany: true,
      options: ['super-admin', 'user'],
      access: {
        update: () => true,
      },
    },
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
  hooks: {
    afterLogin: [setCookieBasedOnDomain],
  },
};
