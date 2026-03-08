import { Payload } from 'payload';

import { CollectionSlug } from '@/lib/constants';

const USER_ROLE_SUPER_ADMIN = 'super-admin' as const;

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding users...');

  if (process.env.ADMIN_EMAIL || process.env.ADMIN_PASSWORD) {
    await payload.create({
      collection: CollectionSlug.USERS,
      data: {
        email: process.env.ADMIN_EMAIL as string,
        password: process.env.ADMIN_PASSWORD as string,
        roles: [USER_ROLE_SUPER_ADMIN],
      },
    });
  }

  payload.logger.info('Users seeded successfully');
};
