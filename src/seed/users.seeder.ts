import { Payload } from 'payload';

import { CollectionSlug } from '@/lib/constants';

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding users...');

  if (process.env.ADMIN_EMAIL || process.env.ADMIN_PASSWORD) {
    // Find the existing Super Admin role record created by the roles seeder
    const { docs: roles } = await payload.find({
      collection: CollectionSlug.ROLES,
      where: { ident: { equals: 'super-admin' } },
      limit: 1,
    });

    // Create the admin user with the Super Admin role if it exists
    if (!roles || roles.length === 0) {
      payload.logger.warn('Super Admin role not found; skipping admin user creation.');
    } else {
      const role = roles[0];

      await payload.create({
        collection: CollectionSlug.USERS,
        data: {
          email: process.env.ADMIN_EMAIL as string,
          password: process.env.ADMIN_PASSWORD as string,
          roles: [role.id],
        },
        draft: false,
      } as any);
    }
  }

  payload.logger.info('Users seeded successfully');
};
