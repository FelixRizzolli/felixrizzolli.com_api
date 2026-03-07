import type { AccessArgs, CollectionConfig } from 'payload';

import type { Tenant, User } from '@/payload-types';
import { CollectionGroup, CollectionSlug } from '@/lib/constants';

const weddingTenantSlug = 'wedding';

const userMatchesWeddingTenant = (user: Partial<User> | null | undefined): boolean => {
  if (!user) {
    return false;
  }

  if (Array.isArray(user.roles) && user.roles.includes('super-admin')) {
    return true;
  }

  const assignments = Array.isArray(user.tenants) ? user.tenants : [];
  return assignments.some(({ tenant }) => {
    if (!tenant) {
      return false;
    }

    if (typeof tenant === 'object') {
      return tenant.slug === weddingTenantSlug;
    }

    return false;
  });
};

const resolveWeddingTenantAccess = async ({ req }: AccessArgs<User>): Promise<boolean> => {
  const { user, payload } = req;

  if (userMatchesWeddingTenant(user)) {
    return true;
  }

  const assignments = user?.tenants || [];
  if (!assignments.length) {
    return false;
  }

  const tenantIDs = assignments
    .map(({ tenant }) => {
      if (!tenant) {
        return null;
      }

      if (typeof tenant === 'object' && tenant.id) {
        return tenant.id;
      }

      return tenant;
    })
    .filter((id): id is Tenant['id'] => Boolean(id));

  if (!tenantIDs.length) {
    return false;
  }

  const tenantResult = await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: tenantIDs.length,
    where: {
      id: {
        in: tenantIDs,
      },
    },
  });

  return tenantResult.docs.some((tenantDoc) => {
    const tenant = tenantDoc as unknown as Tenant;
    return tenant.slug === weddingTenantSlug;
  });
};

const restrictToWeddingTenant = (args: AccessArgs<User>): Promise<boolean> => {
  return resolveWeddingTenantAccess(args);
};

export const WeddingCategoryGroups: CollectionConfig = {
  slug: CollectionSlug.WEDDING_CATEGORY_GROUPS,
  access: {
    create: restrictToWeddingTenant,
    delete: restrictToWeddingTenant,
    read: restrictToWeddingTenant,
    update: restrictToWeddingTenant,
  },
  admin: {
    hidden: ({ user }) => {
      return !userMatchesWeddingTenant(user as Partial<User> | null | undefined);
    },
    useAsTitle: 'name',
    group: CollectionGroup.WEDDING,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
};
