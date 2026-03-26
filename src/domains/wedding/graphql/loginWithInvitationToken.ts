import type { GraphQLFieldConfig } from 'graphql';
import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { APIError, getFieldsToSign, jwtSign } from 'payload';
import type { PayloadRequest } from 'payload';

import type { WeddingUser } from '@/payload-types';
import { CollectionSlug } from '@/lib/constants';

/**
 * GraphQL field config for the `loginWithInvitationToken` wedding-domain mutation.
 *
 * Wedding guests authenticate with a **username + plain-text invitation token**
 * instead of the standard email + password pair. This trades a small amount of
 * security for convenience: guests simply copy the token from their printed or
 * digital invitation — no password to remember or reset.
 *
 * The token is stored as plain text in the database so administrators can look
 * it up and re-send it to any guest who asks for a reminder.
 *
 * On success a Payload-compatible signed JWT is returned. The client must
 * attach it as `Authorization: JWT <token>` on every subsequent request.
 *
 * ### What this does vs. Payload's standard loginOperation
 *
 * This resolver is a drop-in replacement for Payload's built-in login that
 * swaps two things:
 *  1. **Lookup**: finds the user by `username` instead of email.
 *  2. **Credential check**: compares a plain-text `invitationToken` instead
 *     of verifying a bcrypt password hash.
 *
 * Everything else — session creation, `getFieldsToSign`, `jwtSign` — is
 * identical to what Payload's own `loginOperation` does, so the resulting JWT
 * is fully compatible with all of Payload's auth middleware.
 *
 * @example GraphQL usage
 * ```graphql
 * mutation LoginGuest($username: String!, $invitationToken: String!) {
 *   loginWithInvitationToken(username: $username, invitationToken: $invitationToken) {
 *     token
 *     exp
 *     username
 *   }
 * }
 * ```
 */
export const loginWithInvitationTokenMutation: GraphQLFieldConfig<
  unknown,
  { req: PayloadRequest }
> = {
  description:
    'Authenticate a wedding guest using their username and invitation token. ' +
    'Returns a signed JWT to be used as a JWT token for subsequent requests.',

  type: new GraphQLObjectType({
    name: 'LoginWithInvitationTokenResult',
    fields: {
      token: {
        type: GraphQLString,
        description: 'Signed JWT — attach as "Authorization: JWT <token>".',
      },
      exp: {
        type: GraphQLString,
        description: 'ISO-8601 timestamp at which the token expires.',
      },
      username: {
        type: GraphQLString,
        description: 'Username of the authenticated guest.',
      },
    },
  }),

  args: {
    username: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The unique username of the wedding guest.',
    },
    invitationToken: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The plain-text invitation token from the guest's invitation.",
    },
  },

  async resolve(_root, args: { username: string; invitationToken: string }, { req }) {
    const { username, invitationToken } = args;
    const { payload } = req;

    const collectionConfig = payload.collections[CollectionSlug.WEDDING_USERS].config;
    const { secret } = payload;
    const tokenExpiration = collectionConfig.auth.tokenExpiration ?? 60 * 60 * 24 * 30;

    // ── Step 1: Find wedding-user by username
    const user = (await payload.db.findOne({
      collection: CollectionSlug.WEDDING_USERS,
      req,
      where: { username: { equals: username } },
    })) as WeddingUser | null;

    // ── Step 2: Validate invitation token
    if (!user || !user.invitationToken || user.invitationToken !== invitationToken) {
      // APIError ensures extensions.statusCode: 403 appears in the GraphQL
      // error body, which the withGraphQLStatus wrapper promotes to HTTP 403.
      throw new APIError('Invalid credentials.', 403);
    }

    // ── Step 3: Build JWT claims and sign
    // Sessions are disabled on this collection (useSessions: false) so no
    // server-side session is created.  The 30-day JWT expiry is sufficient
    // for the wedding-guest use case.
    const fieldsToSign = getFieldsToSign({
      collectionConfig,
      email: '',
      user: user as unknown as Parameters<typeof getFieldsToSign>[0]['user'],
    });

    const { token, exp } = await jwtSign({
      fieldsToSign,
      secret,
      tokenExpiration,
    });

    return {
      token,
      exp: new Date(exp * 1000).toISOString(),
      username: user.username,
    };
  },
};
