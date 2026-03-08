import { Payload } from 'payload';

import { CollectionSlug } from '@/lib/constants';
import { ROLE_PRESETS } from '@/lib/permissions';

const SUPER_ADMIN_PRESET = ROLE_PRESETS.find((r) => r.ident === 'super-admin')!;

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding roles...');

  await payload.create({
    collection: CollectionSlug.ROLES,
    data: {
      name: SUPER_ADMIN_PRESET.name,
      ident: SUPER_ADMIN_PRESET.ident,
    },
  });

  payload.logger.info('Roles seeded successfully');
};
