import { Payload } from 'payload';

import { CollectionSlug } from '@/lib/constants';

/**
 * Seeds a development/staging WeddingUser so there is always a working guest
 * account available for manual testing and E2E tests.
 *
 * Environment variables:
 *  - WEDDING_GUEST_USERNAME — unique guest username (required to seed)
 *  - WEDDING_GUEST_TOKEN    — plain-text invitation token (required to seed)
 *
 * The seeder is idempotent: if the username already exists it is skipped.
 * The `wedding-guest` role is automatically assigned by the WeddingUser
 * collection's `beforeChange` hook when no roles are provided.
 */
export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding wedding users…');

  const username = process.env.WEDDING_GUEST_USERNAME;
  const invitationToken = process.env.WEDDING_GUEST_TOKEN;

  if (!username || !invitationToken) {
    payload.logger.info(
      'WEDDING_GUEST_USERNAME or WEDDING_GUEST_TOKEN not set; skipping wedding user creation.',
    );
    return;
  }

  const { totalDocs } = await payload.find({
    collection: CollectionSlug.WEDDING_USERS,
    where: { username: { equals: username } },
    limit: 1,
    overrideAccess: true,
  });

  if (totalDocs > 0) {
    payload.logger.info(`Wedding user "${username}" already exists; skipping.`);
    return;
  }

  await payload.create({
    collection: CollectionSlug.WEDDING_USERS,
    data: {
      username,
      invitationToken,
      // roles intentionally omitted — the beforeChange hook on WeddingUsers
      // will auto-assign the wedding-guest role.
    } as any,
    overrideAccess: true,
  });

  payload.logger.info(`Wedding user "${username}" created successfully.`);
};

