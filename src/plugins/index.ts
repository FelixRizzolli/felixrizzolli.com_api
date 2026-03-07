import { Plugin } from 'payload';
import type { Config } from '@/payload-types';
import { payloadCloudPlugin } from '@payloadcms/payload-cloud';
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant';
import { isSuperAdmin } from '@/access/isSuperAdmin';

export const plugins: Plugin[] = [
  payloadCloudPlugin(),
  // Multi-tenant plugin: configure tenant collection and defaults

  multiTenantPlugin<Config>({
    collections: {
      'wedding-images': {},
    },
    userHasAccessToAllTenants: (user) => isSuperAdmin(user),
    tenantsArrayField: {
      includeDefaultField: false,
    },
  }),
];
