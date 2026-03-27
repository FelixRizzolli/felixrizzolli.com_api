import type { CollectionConfig } from 'payload';

import { requirePermission } from '@/lib/access';
import { CollectionGroup, CollectionSlug } from '@/lib/constants';
import { Permissions } from '@/lib/permissions';

export const WeddingCategories: CollectionConfig = {
  slug: CollectionSlug.WEDDING_CATEGORIES,
  access: {
    create: requirePermission(Permissions.WEDDING_CATEGORIES_CREATE),
    read: requirePermission(Permissions.WEDDING_CATEGORIES_READ),
    update: requirePermission(Permissions.WEDDING_CATEGORIES_UPDATE),
    delete: requirePermission(Permissions.WEDDING_CATEGORIES_DELETE),
  },
  admin: {
    useAsTitle: 'name',
    group: CollectionGroup.WEDDING,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: {
            en: 'General',
            de: 'Generell',
            it: 'Generale',
          },
          fields: [
            {
              name: 'categoryGroup',
              type: 'relationship',
              relationTo: CollectionSlug.WEDDING_CATEGORY_GROUPS,
              hasMany: false,
              required: true,
              label: {
                en: 'Category Group',
                de: 'Kategorie Gruppe',
                it: 'Gruppo categoria',
              },
            },
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
        },
        {
          label: {
            en: 'Relationships',
            de: 'Beziehungen',
            it: 'Relazioni',
          },
          fields: [
            {
              name: 'assignedImages',
              type: 'join',
              collection: CollectionSlug.WEDDING_IMAGES,
              on: 'categories',
              admin: {
                allowCreate: false,
              },
            },
          ],
        },
      ],
    },
  ],
};
