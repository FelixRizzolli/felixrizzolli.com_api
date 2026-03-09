import type { CollectionConfig } from 'payload';

import { CollectionGroup, CollectionSlug } from '@/lib/constants';

export const WeddingCategoryGroups: CollectionConfig = {
  slug: CollectionSlug.WEDDING_CATEGORY_GROUPS,
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
