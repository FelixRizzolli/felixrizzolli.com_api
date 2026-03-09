import type { CollectionConfig } from 'payload';

import { CollectionGroup, CollectionSlug } from '@/lib/constants';

export const WeddingCategories: CollectionConfig = {
  slug: CollectionSlug.WEDDING_CATEGORIES,
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
        en: 'Category Name',
        de: 'Kategoriename',
        it: 'Nome Categoria',
      },
      admin: {
        description: {
          en: 'The name of the category, e.g. "Church", "Aperitivo", "Firefighters", etc.',
          de: 'Der Name der Kategorie, z.B. "Kirche", "Aperitivo", "Feuerwehr", etc.',
          it: 'Il nome della categoria, es. "Chiesa", "Aperitivo", "Vigili del Fuoco", etc.',
        },
      },
    },
    {
      name: 'isNavItem',
      type: 'checkbox',
      defaultValue: false,
      required: true,
      label: {
        en: 'Show in Navigation',
        de: 'In Navigation anzeigen',
        it: 'Mostra nella navigazione',
      },
      admin: {
        description: {
          en: 'If checked, this category will be shown in the navigation menu.',
          de: 'Wenn aktiviert, wird diese Kategorie im Navigationsmenü angezeigt.',
          it: 'Se selezionato, questa categoria sarà mostrata nel menu di navigazione.',
        },
      },
    },
  ],
};
