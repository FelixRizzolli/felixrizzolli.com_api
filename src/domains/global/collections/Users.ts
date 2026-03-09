import type { CollectionConfig } from 'payload';

import { requirePermission } from '@/access/hasPermission';
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
    // depth 2: user → roles → permissions (so hasPermission can read idents)
    depth: 2,
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
              name: 'username',
              type: 'text',
              required: true,
              unique: true,
              label: {
                en: 'Username',
                de: 'Benutzername',
                it: 'Nome utente',
              },
              admin: {
                description: {
                  en: 'Unique username for the user. Can be used for login and identification.',
                  de: 'Eindeutiger Benutzername für den Benutzer. Kann für die Anmeldung und Identifikation verwendet werden.',
                  it: "Nome utente univoco per l'utente. Può essere utilizzato per l'accesso e l'identificazione.",
                },
              },
            },
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
