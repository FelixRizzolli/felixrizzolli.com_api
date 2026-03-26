/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config';
import { GRAPHQL_POST, REST_OPTIONS } from '@payloadcms/next/routes';

import { withGraphQLStatus } from '@/lib/graphql-handler';

// Wrapped: re-emits the highest error `extensions.statusCode` as the real
// HTTP status so clients get 403/401 instead of the spec-mandated 200.
// If Payload regenerates this file, re-apply the withGraphQLStatus wrapper.
export const POST = withGraphQLStatus(GRAPHQL_POST(config));

export const OPTIONS = REST_OPTIONS(config);
