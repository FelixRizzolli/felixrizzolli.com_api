// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { Users } from './domains/global/collections/Users';
import { Tenants } from './domains/global/collections/Tenants';
import { WeddingImages } from './domains/wedding/collections/WeddingImages';
import { plugins } from './plugins';
import { CollectionSlug } from '@/lib/constants';
import { Roles } from '@/domains/global/collections/Roles';
import { Permissions } from '@/domains/global/collections/Permissions';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  cors: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.WEDDING_URL || '',
    ...[process.env.NODE_ENV === 'development' ? 'https://studio.apollographql.com' : ''],
  ].filter(Boolean),
  csrf: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.WEDDING_URL || '',
    ...[process.env.NODE_ENV === 'development' ? 'https://studio.apollographql.com' : ''],
  ].filter(Boolean),
  admin: {
    user: CollectionSlug.USERS,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    // Global
    Users,
    Roles,
    Permissions,
    Tenants,
    // Wedding
    WeddingImages,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: process.env.NODE_ENV !== 'production',
    blocksAsJSON: true,
  }),
  sharp,
  plugins,
  graphQL: {
    disable: false,
    disablePlaygroundInProduction: true,
  },
});
