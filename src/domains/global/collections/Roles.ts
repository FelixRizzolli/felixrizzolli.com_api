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
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'permissions',
      type: 'relationship',
      relationTo: CollectionSlug.PERMISSIONS,
      hasMany: true,
    },
    {
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({}),
    },
  ],
};
