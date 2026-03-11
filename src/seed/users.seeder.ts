import { Payload } from 'payload';

import { CollectionSlug } from '@/lib/constants';

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding users...');

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    payload.logger.info('ADMIN_EMAIL or ADMIN_PASSWORD not set; skipping admin user creation.');
    return;
  }

  const username = email.split('@')[0];

  const { totalDocs: existingCount } = await payload.find({
    collection: CollectionSlug.USERS,
    where: { email: { equals: email } },
    limit: 1,
  });

  if (existingCount > 0) {
    payload.logger.info('Admin user already exists; skipping.');
    return;
  }

  const { docs: roles } = await payload.find({
    collection: CollectionSlug.ROLES,
    where: { ident: { equals: 'super-admin' } },
    limit: 1,
  });

  if (roles.length === 0) {
    payload.logger.warn('Super Admin role not found; skipping admin user creation.');
    return;
  }

  await payload.create({
    collection: CollectionSlug.USERS,
    data: {
      username,
      email,
      password,
      roles: [roles[0].id],
    },
    draft: false,
  } as any);

  payload.logger.info('Admin user created successfully.');
};
