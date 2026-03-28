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
      const roleId = existingRoles[0].id;
      // Sync permissions + English name together
      await payload.update({
        collection: CollectionSlug.ROLES,
        id: roleId,
        locale: 'en',
        data: { name: preset.name.en, permissions: permissionIds },
        overrideAccess: true,
      });
      // Sync remaining locales
      for (const locale of ['de', 'it'] as const) {
        await payload.update({
          collection: CollectionSlug.ROLES,
          id: roleId,
          locale,
          data: { name: preset.name[locale] },
          overrideAccess: true,
        });
      }
      synced++;
      continue;
    }

    // Create with the default locale (en) including all non-localized fields
    const createdRole = await payload.create({
      collection: CollectionSlug.ROLES,
      locale: 'en',
      data: {
        name: preset.name.en,
        ident: preset.ident,
        permissions: permissionIds,
      },
      overrideAccess: true,
    });

    // Set names for the remaining locales
    for (const locale of ['de', 'it'] as const) {
      await payload.update({
        collection: CollectionSlug.ROLES,
        id: createdRole.id,
        locale,
        data: { name: preset.name[locale] },
        overrideAccess: true,
      });
    }

    created++;
  }

  payload.logger.info(`Roles seeded: ${created} created, ${synced} synced.`);
};
