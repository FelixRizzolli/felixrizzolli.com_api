import type { CollectionConfig } from 'payload';

import { requirePermission } from '@/lib/access';
import { CollectionGroup, CollectionSlug } from '@/lib/constants';
import { Permissions } from '@/lib/permissions';

/** The only role ident that may be assigned to a WeddingUser. */
const WEDDING_GUEST_IDENT = 'wedding-guest';

export const WeddingUsers: CollectionConfig = {
  slug: CollectionSlug.WEDDING_USERS,
  /**
   * Enable Payload's JWT auth infrastructure without exposing a local
   * (email + password) login endpoint. The only login path is the custom
   * `loginWithInvitationToken` GraphQL mutation.
   *
   * `useSessions: false` — wedding guests authenticate with a single
   * invitation token and hold a long-lived JWT (30 days). Server-side
   * session management adds no value here and would require a
   * `wedding_users_sessions` DB table that we deliberately omit.
   * Disabling sessions also means the JWT validator never tries to look up
   * a session row that doesn't exist, which was the root cause of the
   * "You are not allowed to perform this action." 403 on every request.
   */
  auth: {
    disableLocalStrategy: true,
    useSessions: false,
    // depth 2: wedding-user → roles → permissions
    depth: 2,
    // 30 days — guests log in once for the wedding
    tokenExpiration: 60 * 60 * 24 * 30,
  },
  hooks: {
    /**
     * Auto-assign the `wedding-guest` role when a WeddingUser is created
     * without any roles.
     */
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && (!data.roles || data.roles.length === 0)) {
          const { docs } = await req.payload.find({
            collection: CollectionSlug.ROLES,
            where: { ident: { equals: WEDDING_GUEST_IDENT } },
            limit: 1,
            overrideAccess: true,
          });

          if (docs.length > 0) {
            data.roles = [docs[0].id];
          }
        }

        return data;
      },
    ],
  },
  access: {
    create: requirePermission(Permissions.WEDDING_USERS_CREATE),
    read: requirePermission(Permissions.WEDDING_USERS_READ),
    update: requirePermission(Permissions.WEDDING_USERS_UPDATE),
    delete: requirePermission(Permissions.WEDDING_USERS_DELETE),
  },
  admin: {
    useAsTitle: 'username',
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
              name: 'username',
              type: 'text',
              required: true,
              unique: true,
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
              // Limit the picker in the admin UI to the wedding-guest role only.
              filterOptions: {
                ident: { equals: WEDDING_GUEST_IDENT },
              },
              admin: {
                description: {
                  en: "Only the 'wedding-guest' role may be assigned to a Wedding User.",
                  de: "Einem Wedding User darf nur die Rolle 'wedding-guest' zugewiesen werden.",
                  it: "Solo il ruolo 'wedding-guest' può essere assegnato a un Wedding User.",
                },
              },
            },
            {
              name: 'invitationToken',
              type: 'text',
              required: true,
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
        {
          name: 'settings',
          label: {
            en: 'Settings',
            de: 'Einstellungen',
            it: 'Settings',
          },
          fields: [
            {
              type: 'group',
              label: {
                en: 'General',
                de: 'Generell',
                it: 'Generale',
              },
              fields: [
                {
                  name: 'language',
                  type: 'select',
                  options: ['english', 'deutsch', 'italiano'],
                },
              ],
            },
            {
              name: 'gallery',
              type: 'group',
              fields: [
                {
                  name: 'gridGap',
                  type: 'select',
                  options: ['none', 'small', 'medium', 'large'],
                },
                {
                  name: 'view',
                  type: 'select',
                  options: ['default', 'tiles', 'masonry'],
                },
              ],
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
              name: 'imagesInFogus',
              type: 'join',
              collection: CollectionSlug.WEDDING_IMAGES,
              on: 'guestsInFocus',
              admin: {
                allowCreate: false,
              },
            },
            {
              name: 'imagesWithAppereance',
              type: 'join',
              collection: CollectionSlug.WEDDING_IMAGES,
              on: 'guestsWithAppereance',
              admin: {
                allowCreate: false,
              },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
};
