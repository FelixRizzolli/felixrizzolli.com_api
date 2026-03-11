import { Payload } from 'payload';

import { CollectionSlug } from '@/lib/constants';
import { PERMISSION_GROUPS } from '@/lib/permissions';

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding permissions...');

  const results = await Promise.allSettled(
    PERMISSION_GROUPS.flatMap(({ label, permissions }) =>
      permissions.map(async (ident) => {
        const { totalDocs } = await payload.find({
          collection: CollectionSlug.PERMISSIONS,
          where: { ident: { equals: ident } },
          limit: 1,
        });

        if (totalDocs > 0) return 'skipped' as const;

        const action = ident.split(':')[1];
        const name = `${label}: ${capitalize(action)}`;

        await payload.create({
          collection: CollectionSlug.PERMISSIONS,
          data: { name, ident },
        });

        return 'created' as const;
      }),
    ),
  );

  const created = results.filter((r) => r.status === 'fulfilled' && r.value === 'created').length;
  const skipped = results.filter((r) => r.status === 'fulfilled' && r.value === 'skipped').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  if (failed > 0) {
    payload.logger.warn(
      `Permissions seeded: ${created} created, ${skipped} skipped, ${failed} failed.`,
    );
  } else {
    payload.logger.info(`Permissions seeded: ${created} created, ${skipped} skipped.`);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);
