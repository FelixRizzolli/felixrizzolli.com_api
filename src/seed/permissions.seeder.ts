import { Payload } from 'payload';

import { CollectionSlug } from '@/lib/constants';
import { PERMISSION_GROUPS } from '@/lib/permissions';

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding permissions…');

  // ── Build the desired set from PERMISSION_GROUPS ────────────────────────
  const desired = new Map<string, string>(); // ident → name
  for (const { label, permissions } of PERMISSION_GROUPS) {
    for (const ident of permissions) {
      const action = ident.split(':')[1];
      desired.set(ident, `${label}: ${capitalize(action)}`);
    }
  }

  // ── Fetch all existing permission documents ──────────────────────────────
  const { docs: existingDocs } = await payload.find({
    collection: CollectionSlug.PERMISSIONS,
    limit: 1000,
    pagination: false,
  });

  const existingMap = new Map(existingDocs.map((d) => [d.ident, d]));

  let created: number;
  let updated: number;
  let deleted: number;
  let failed = 0;

  // ── Phase 1: Delete stale permissions ───────────────────────────────────
  const deleteResults = await Promise.allSettled(
    existingDocs
      .filter((d) => !desired.has(d.ident))
      .map(async (d) => {
        await payload.delete({
          collection: CollectionSlug.PERMISSIONS,
          id: d.id,
          overrideAccess: true,
        });
      }),
  );
  deleted = deleteResults.filter((r) => r.status === 'fulfilled').length;
  failed += deleteResults.filter((r) => r.status === 'rejected').length;

  // ── Phase 2 & 3: Upsert ─────────────────────────────────────────────────
  const upsertResults = await Promise.allSettled(
    Array.from(desired.entries()).map(async ([ident, name]) => {
      const existing = existingMap.get(ident);

      if (!existing) {
        // Create
        await payload.create({
          collection: CollectionSlug.PERMISSIONS,
          data: { name, ident },
          overrideAccess: true,
        });
        return 'created' as const;
      }

      if (existing.name !== name) {
        // Update (e.g. group label was renamed)
        await payload.update({
          collection: CollectionSlug.PERMISSIONS,
          id: existing.id,
          data: { name },
          overrideAccess: true,
        });
        return 'updated' as const;
      }

      return 'skipped' as const;
    }),
  );

  created = upsertResults.filter((r) => r.status === 'fulfilled' && r.value === 'created').length;
  updated = upsertResults.filter((r) => r.status === 'fulfilled' && r.value === 'updated').length;
  failed += upsertResults.filter((r) => r.status === 'rejected').length;

  const skipped =
    upsertResults.filter((r) => r.status === 'fulfilled' && r.value === 'skipped').length;

  if (failed > 0) {
    payload.logger.warn(
      `Permissions seeded: ${created} created, ${updated} updated, ${deleted} deleted, ${skipped} skipped, ${failed} failed.`,
    );
  } else {
    payload.logger.info(
      `Permissions seeded: ${created} created, ${updated} updated, ${deleted} deleted, ${skipped} skipped.`,
    );
  }
};

// ─────────────────────────────────────────────────────────────────────────────

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);
