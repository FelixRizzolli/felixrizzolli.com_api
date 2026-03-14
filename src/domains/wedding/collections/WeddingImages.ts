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
    defaultColumns: ['ident', 'cloudflareLink', 'updatedAt'],
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
      name: 'cloudflareLink',
      type: 'text',
      required: false,
      unique: true,
      label: {
        en: 'Cloudflare Link',
        de: 'Cloudflare-Link',
        it: 'Link di Cloudflare',
      },
      admin: {
        components: {
          Cell: '@/domains/wedding/components/WeddingImageCell#WeddingImageCell',
        },
        description: {
          en: 'The URL link to the image hosted on Cloudflare.',
          de: 'Der URL-Link zum Bild, das auf Cloudflare gehostet wird.',
          it: "L'URL del link all'immagine ospitata su Cloudflare.",
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
  ],
};
