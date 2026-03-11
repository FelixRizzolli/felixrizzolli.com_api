import { Payload } from 'payload';

import { CollectionSlug } from '@/lib/constants';
import { ROLE_PRESETS } from '@/lib/permissions';

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding roles...');

  let created = 0;
  let synced = 0;

  for (const preset of ROLE_PRESETS) {
    // Resolve permission document IDs for this preset
    const { docs: permissionDocs } = await payload.find({
      collection: CollectionSlug.PERMISSIONS,
      where: { ident: { in: preset.permissions } },
      limit: preset.permissions.length,
    });

    const permissionIds = permissionDocs.map((p) => p.id);

    const { docs: existingRoles } = await payload.find({
      collection: CollectionSlug.ROLES,
      where: { ident: { equals: preset.ident } },
      limit: 1,
    });

    if (existingRoles.length > 0) {
      // Always sync permissions so new entries in ROLE_PRESETS take effect on the next deploy
      await payload.update({
        collection: CollectionSlug.ROLES,
        id: existingRoles[0].id,
        data: { permissions: permissionIds },
        overrideAccess: true,
      });
      synced++;
      continue;
    }

    await payload.create({
      collection: CollectionSlug.ROLES,
      data: {
        name: preset.name,
        ident: preset.ident,
        permissions: permissionIds,
      },
      overrideAccess: true,
    });

    created++;
  }

  payload.logger.info(`Roles seeded: ${created} created, ${synced} synced.`);
};
