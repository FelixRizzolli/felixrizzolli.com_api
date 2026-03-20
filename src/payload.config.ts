// storage-adapter-import-placeholder
import { en } from '@payloadcms/translations/languages/en';
import { de } from '@payloadcms/translations/languages/de';
import { it } from '@payloadcms/translations/languages/it';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { Users } from './domains/global/collections/Users';
import { loginWithInvitationTokenMutation } from '@/domains/wedding/graphql/loginWithInvitationToken';
import { WeddingImages } from './domains/wedding/collections/WeddingImages';
import { WeddingCategories } from './domains/wedding/collections/WeddingCategories';
import { WeddingCategoryGroups } from './domains/wedding/collections/WeddingCategoryGroups';
import { CollectionSlug } from '@/lib/constants';
import { Roles } from '@/domains/global/collections/Roles';
import { Permissions } from '@/domains/global/collections/Permissions';
import { WeddingIssues } from '@/domains/wedding/collections/WeddingIssues';
import { WeddingConfig } from '@/domains/wedding/globals/WeddingConfig';
import { migrations } from '@/migrations';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  serverURL: process.env.API_URL || 'http://localhost:3000',
  cors: [
    ...(process.env.WWW_URL ? [process.env.WWW_URL] : []),
    ...(process.env.DOCS_URL ? [process.env.DOCS_URL] : []),
    ...(process.env.WEDDING_URL ? [process.env.WEDDING_URL] : []),
    ...(process.env.TRAVELING_URL ? [process.env.TRAVELING_URL] : []),
    ...(process.env.NODE_ENV === 'development' ? ['https://studio.apollographql.com'] : []),
  ].filter(Boolean),
  csrf: [
    ...(process.env.WWW_URL ? [process.env.WWW_URL] : []),
    ...(process.env.DOCS_URL ? [process.env.DOCS_URL] : []),
    ...(process.env.WEDDING_URL ? [process.env.WEDDING_URL] : []),
    ...(process.env.TRAVELING_URL ? [process.env.TRAVELING_URL] : []),
    ...(process.env.NODE_ENV === 'development' ? ['https://studio.apollographql.com'] : []),
  ].filter(Boolean),
  i18n: {
    supportedLanguages: { en, de, it },
    fallbackLanguage: 'en',
  },
  admin: {
    user: CollectionSlug.USERS,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    timezones: {
      defaultTimezone: 'Europe/Rome',
    },
    meta: {
      titleSuffix: '- Felix Rizzolli Admin',
    },
    autoLogin:
      process.env.NODE_ENV === 'development' &&
      process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD
        ? {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            prefillOnly: true,
          }
        : false,
  },
  collections: [
    // Global
    Users,
    Roles,
    Permissions,
    // Wedding
    WeddingImages,
    WeddingCategories,
    WeddingCategoryGroups,
    WeddingIssues,
  ],
  globals: [
    // Global
    // Wedding
    WeddingConfig,
  ],
  editor: lexicalEditor(),
  secret: process.env.API_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    prodMigrations: migrations,
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: process.env.NODE_ENV !== 'production',
    blocksAsJSON: true,
  }),
  sharp,
  graphQL: {
    disable: false,
    disablePlaygroundInProduction: true,
    mutations: (_graphQL, { Mutation }) => ({
      ...Mutation.fields,
      loginWithInvitationToken: loginWithInvitationTokenMutation,
    }),
  },
});
