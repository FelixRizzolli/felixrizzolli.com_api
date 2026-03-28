import type { CollectionConfig } from 'payload';

import { requirePermission } from '@/lib/access';
import { CollectionGroup, CollectionSlug } from '@/lib/constants';
import { Permissions } from '@/lib/permissions';

export const WeddingImages: CollectionConfig = {
  slug: CollectionSlug.WEDDING_IMAGES,
  access: {
    create: requirePermission(Permissions.WEDDING_IMAGES_CREATE),
    read: requirePermission(Permissions.WEDDING_IMAGES_READ),
    update: requirePermission(Permissions.WEDDING_IMAGES_UPDATE),
    delete: requirePermission(Permissions.WEDDING_IMAGES_DELETE),
  },
  admin: {
    useAsTitle: 'ident',
    group: CollectionGroup.WEDDING,
    defaultColumns: ['ident', 'cdnLink', 'updatedAt'],
  },
  fields: [
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
          en: 'A unique identifier for the image, used for referencing in code.',
          de: 'Ein eindeutiger Bezeichner für das Bild, der zur Referenzierung im Code verwendet wird.',
          it: "Un identificatore univoco per l'immagine, utilizzato per fare riferimento nel codice.",
        },
      },
    },
    {
      name: 'imagePreview',
      type: 'ui',
      admin: {
        components: {
          Field: '@/domains/wedding/components/WeddingImagePreview#WeddingImagePreview',
        },
      },
    },
    {
      name: 'cdnLink',
      type: 'text',
      required: false,
      unique: true,
      label: {
        en: 'CDN Link',
        de: 'CDN-Link',
        it: 'Link di CDN',
      },
      admin: {
        description: {
          en: 'The URL link to the image hosted on the CDN (e.g. Cloudflare R2). Takes priority over the OneDrive link.',
          de: 'Der URL-Link zum Bild, das auf dem CDN (z. B. Cloudflare R2) gehostet wird. Hat Vorrang vor dem OneDrive-Link.',
          it: "L'URL del link all'immagine ospitata sul CDN (es. Cloudflare R2). Ha la priorità sul link OneDrive.",
        },
        components: {
          Cell: '@/domains/wedding/components/WeddingImageCell#WeddingImageCell',
        },
      },
    },
    {
      name: 'onedriveLink',
      type: 'text',
      required: false,
      unique: true,
      label: {
        en: 'OneDrive Link',
        de: 'OneDrive-Link',
        it: 'Link di OneDrive',
      },
      admin: {
        description: {
          en: 'The URL link to the image hosted on OneDrive.',
          de: 'Der URL-Link zum Bild, das auf OneDrive gehostet wird.',
          it: "L'URL del link all'immagine ospitata su OneDrive.",
        },
      },
    },
    {
      type: 'group',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'categories',
          type: 'relationship',
          relationTo: CollectionSlug.WEDDING_CATEGORIES,
          hasMany: true,
          filterOptions: {
            type: { equals: 'images' },
          },
          admin: {
            allowCreate: false,
          },
        },
        {
          name: 'guestsInFocus',
          type: 'relationship',
          relationTo: CollectionSlug.WEDDING_USERS,
          hasMany: true,
          admin: {
            allowCreate: false,
          },
        },
        {
          name: 'guestsWithAppereance',
          type: 'relationship',
          relationTo: CollectionSlug.WEDDING_USERS,
          hasMany: true,
          admin: {
            allowCreate: false,
          },
        },
      ],
    },
  ],
};
