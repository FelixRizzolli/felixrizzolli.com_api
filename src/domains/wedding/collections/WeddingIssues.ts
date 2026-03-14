import type { CollectionConfig } from 'payload';

import { requirePermission } from '@/lib/access';
import { CollectionGroup, CollectionSlug } from '@/lib/constants';
import { Permissions } from '@/lib/permissions';

export const WeddingIssues: CollectionConfig = {
  slug: CollectionSlug.WEDDING_ISSUES,
  access: {
    create: requirePermission(Permissions.WEDDING_ISSUES_CREATE),
    read: requirePermission(Permissions.WEDDING_ISSUES_READ),
    update: requirePermission(Permissions.WEDDING_ISSUES_UPDATE),
    delete: requirePermission(Permissions.WEDDING_ISSUES_DELETE),
  },
  admin: {
    useAsTitle: 'title',
    group: CollectionGroup.WEDDING,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: {
        en: 'Title',
        de: 'Titel',
        it: 'Titolo',
      },
      admin: {
        description: {
          en: 'The title of the issue, e.g. "Parking", "Accommodation", "Transportation", etc.',
          de: 'Der Titel des Problems, z.B. "Parken", "Unterkunft", "Transport", etc.',
          it: 'Il titolo del problema, es. "Parcheggio", "Alloggio", "Trasporto", ecc.',
        },
      },
    },
    {
      name: 'githubIssueId',
      type: 'text',
      required: true,
      unique: true,
      label: {
        en: 'GitHub Issue ID',
        de: 'GitHub Issue ID',
        it: 'GitHub Issue ID',
      },
      admin: {
        description: {
          en: 'The unique identifier of the corresponding GitHub issue, used for syncing data between Payload and GitHub.',
          de: 'Der eindeutige Bezeichner des entsprechenden GitHub-Issues, der für die Synchronisierung von Daten zwischen Payload und GitHub verwendet wird.',
          it: "L'identificatore univoco del corrispondente problema di GitHub, utilizzato per sincronizzare i dati tra Payload e GitHub.",
        },
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        {
          value: 'enhancement',
          label: {
            en: 'Enhancement',
            de: 'Verbesserung',
            it: 'Miglioramento',
          },
        },
        {
          value: 'bug',
          label: {
            en: 'Bug',
            de: 'Fehler',
            it: 'Errore',
          },
        },
        {
          value: 'question',
          label: {
            en: 'Question',
            de: 'Frage',
            it: 'Domanda',
          },
        },
      ],
    },
  ],
};
