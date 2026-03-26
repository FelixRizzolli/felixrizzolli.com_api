import { Payload } from 'payload';

import { seed as seedPermissions } from './permissions.seeder';
import { seed as seedRoles } from './roles.seeder';
import { seed as seedUsers } from './users.seeder';
import { seed as seedWeddingUsers } from './wedding-users.seeder';
import { seed as seedWeddingImages } from './wedding-images.seeder';

/**
 * Runs all seeders in dependency order.
 * Safe to call on every startup because every seeder is idempotent.
 */
export const runSeeders = async (payload: Payload): Promise<void> => {
  await seedPermissions(payload);
  await seedRoles(payload);
  await seedUsers(payload);
  await seedWeddingUsers(payload);
  await seedWeddingImages(payload);
  payload.logger.info('✔ Database seeded successfully.');
};
