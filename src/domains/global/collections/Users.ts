import type { CollectionConfig } from 'payload';

import { requirePermission } from '@/lib/access';
import { CollectionGroup, CollectionSlug } from '@/lib/constants';
import { Permissions } from '@/lib/permissions';

export const Users: CollectionConfig = {
  slug: CollectionSlug.USERS,
  access: {
    create: requirePermission(Permissions.GLOBAL_USERS_CREATE),
    read: requirePermission(Permissions.GLOBAL_USERS_READ),
    update: requirePermission(Permissions.GLOBAL_USERS_UPDATE),
    delete: requirePermission(Permissions.GLOBAL_USERS_DELETE),
  },
  admin: {
    defaultColumns: ['username', 'email'],
    useAsTitle: 'username',
    group: CollectionGroup.GLOBAL,
  },
  auth: {
    // depth 2: user → roles → permissions (so access can read idents)
    depth: 2,
    // 30 days — guests log in once for the wedding and should stay authenticated
    tokenExpiration: 60 * 60 * 24 * 30,
    loginWithUsername: {
      allowEmailLogin: true,
      requireEmail: false,
      requireUsername: false,
    },
    disableLocalStrategy: {
      enableFields: true,
      optionalPassword: true,
    },
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
              name: 'roles',
              type: 'relationship',
              relationTo: CollectionSlug.ROLES,
              hasMany: true,
              label: {
                en: 'Roles',
                de: 'Rollen',
                it: 'Ruoli',
              },
              admin: {
                description: {
                  en: 'Assign one or more roles to this user. Permissions are derived from the assigned roles.',
                  de: 'Diesem Benutzer eine oder mehrere Rollen zuweisen. Berechtigungen werden aus den zugewiesenen Rollen abgeleitet.',
                  it: 'Assegna uno o più ruoli a questo utente. I permessi vengono derivati dai ruoli assegnati.',
                },
              },
            },
          ],
        },
        {
          label: {
            en: 'Wedding',
            de: 'Hochzeit',
            it: 'Matrimonio',
          },
          fields: [
            {
              name: 'invitationToken',
              type: 'text',
              label: {
                en: 'Invitation Token',
                de: 'Einladungscode',
                it: 'Token di invito',
              },
              admin: {
                description: {
                  en: 'One-time invitation token for user registration. Generate and share with the user.',
                  de: 'Einmaliger Einladungscode für die Benutzerregistrierung. Generieren und an den Benutzer weitergeben.',
                  it: "Token di invito monouso per la registrazione dell'utente. Genera e condividi con l'utente.",
                },
                components: {
                  Field: '@/domains/global/components/InvitationTokenField#InvitationTokenField',
                },
              },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
};
