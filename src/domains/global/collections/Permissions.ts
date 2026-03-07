import type { CollectionConfig } from 'payload';

import { CollectionGroup, CollectionSlug } from '@/lib/constants';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

export const Permissions: CollectionConfig = {
  slug: CollectionSlug.PERMISSIONS,
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
      name: 'description',
      type: 'richText',
      editor: lexicalEditor({}),
    },
  ],
};
