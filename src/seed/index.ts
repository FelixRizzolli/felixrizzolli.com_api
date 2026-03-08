import { getPayload } from 'payload';

import config from '@payload-config';

import { seed as seedPermissions } from './permissions.seeder';
import { seed as seedRoles } from './roles.seeder';
import { seed as seedUsers } from './users.seeder';

/**
 * Main seed entry point.
 *
 * Order matters:
 *   1. Permissions must exist before roles reference them.
 *   2. The super-admin Role record must exist before the admin User is created.
 */
const run = async (): Promise<void> => {
  const payload = await getPayload({ config });

  try {
    await seedPermissions(payload);
    await seedRoles(payload);
    await seedUsers(payload);

    payload.logger.info('✔ Database seeded successfully.');
  } catch (err) {
    payload.logger.error('✘ Seeding failed:');
    payload.logger.error(err);
    process.exit(1);
  }

  process.exit(0);
};

run();
