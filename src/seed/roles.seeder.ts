import { Payload } from 'payload';

import { CollectionSlug } from '@/lib/constants';
import { ROLE_PRESETS } from '@/lib/permissions';

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding roles...');

  let created = 0;
  let skipped = 0;

  for (const preset of ROLE_PRESETS) {
    const { totalDocs } = await payload.find({
      collection: CollectionSlug.ROLES,
      where: { ident: { equals: preset.ident } },
      limit: 1,
    });

    if (totalDocs > 0) {
      skipped++;
      continue;
    }

    // Resolve the permission document IDs for this preset
    const { docs: permissionDocs } = await payload.find({
      collection: CollectionSlug.PERMISSIONS,
      where: { ident: { in: preset.permissions } },
      limit: preset.permissions.length,
    });

    await payload.create({
      collection: CollectionSlug.ROLES,
      data: {
        name: preset.name,
        ident: preset.ident,
        permissions: permissionDocs.map((p) => p.id),
      },
    });

    created++;
  }

  payload.logger.info(`Roles seeded: ${created} created, ${skipped} skipped.`);
};
