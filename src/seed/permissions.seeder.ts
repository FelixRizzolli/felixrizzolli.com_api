import { Payload } from 'payload';

import { CollectionSlug } from '@/lib/constants';
import { PERMISSION_GROUPS } from '@/lib/permissions';

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding permissions...');

  const results = await Promise.allSettled(
    PERMISSION_GROUPS.flatMap(({ label, permissions }) =>
      permissions.map((ident) => {
        // Derive a readable name from the group label and the action part of the ident.
        // e.g. group "Wedding – Category Groups" + ident "wedding.categoryGroups:create"
        //   → name "Wedding – Category Groups: Create"
        const action = ident.split(':')[1];
        const name = `${label}: ${capitalize(action)}`;

        return payload.create({
          collection: CollectionSlug.PERMISSIONS,
          data: { name, ident },
        });
      }),
    ),
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  if (failed > 0) {
    payload.logger.warn(
      `Permissions seeded: ${succeeded} created, ${failed} skipped (likely duplicates).`,
    );
  } else {
    payload.logger.info(`Permissions seeded: ${succeeded} created.`);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);
