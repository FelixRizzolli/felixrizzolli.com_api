import type { CollectionConfig } from 'payload';

import { requirePermission } from '@/lib/access';
import { CollectionGroup, CollectionSlug } from '@/lib/constants';
import { Permissions } from '@/lib/permissions';

export const WeddingCategoryGroups: CollectionConfig = {
  slug: CollectionSlug.WEDDING_CATEGORY_GROUPS,
  access: {
    create: requirePermission(Permissions.WEDDING_CATEGORY_GROUPS_CREATE),
    read: requirePermission(Permissions.WEDDING_CATEGORY_GROUPS_READ),
    update: requirePermission(Permissions.WEDDING_CATEGORY_GROUPS_UPDATE),
    delete: requirePermission(Permissions.WEDDING_CATEGORY_GROUPS_DELETE),
  },
  admin: {
    useAsTitle: 'name',
    group: CollectionGroup.WEDDING,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: {
        en: 'Category Group Name',
        de: 'Kategoriengruppenname',
        it: 'Nome del gruppo di categorie',
      },
      admin: {
        description: {
          en: 'Name of the category group, e.g. "Location", "Association", "Group", etc.',
          de: 'Name der Kategoriengruppe, z.B. "Ort", "Verein", "Gruppe", etc.',
          it: 'Nome del gruppo di categorie, ad esempio "Luogo", "Associazione", "Gruppo", ecc.',
        },
      },
    },
  ],
};
