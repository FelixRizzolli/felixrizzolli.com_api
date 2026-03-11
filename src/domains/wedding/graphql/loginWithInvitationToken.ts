import type { GraphQLFieldConfig } from 'graphql';
import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { getFieldsToSign, jwtSign } from 'payload';
import type { PayloadRequest } from 'payload';

import type { User } from '@/payload-types';

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
 * attach it as `Authorization: Bearer <token>` on every subsequent request.
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
    'Returns a signed JWT to be used as a Bearer token for subsequent requests.',

  type: new GraphQLObjectType({
    name: 'LoginWithInvitationTokenResult',
    fields: {
      token: {
        type: GraphQLString,
        description: 'Signed JWT — attach as "Authorization: Bearer <token>".',
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

    // 1. Find the guest by username.
    //    Access control is bypassed here — this resolver IS the authentication
    //    gate and must be able to read any user record to perform the check.
    const { docs } = await payload.find({
      collection: 'users',
      where: { username: { equals: username } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    const guest = docs[0] as User | undefined;

    // Generic error message — avoids leaking whether the username exists.
    if (!guest || !guest.invitationToken || guest.invitationToken !== invitationToken) {
      throw new Error('Invalid credentials.');
    }

    // 2. Build JWT claims via Payload's own helper so the token is fully
    //    compatible with Payload's auth middleware on subsequent requests.
    const collectionConfig = payload.collections['users'].config;
    const fieldsToSign = getFieldsToSign({
      collectionConfig,
      email: guest.email ?? '',
      user: guest as Parameters<typeof getFieldsToSign>[0]['user'],
    });

    // 3. Sign with Payload's built-in utility
    const tokenExpiration = collectionConfig.auth.tokenExpiration ?? 60 * 60 * 24 * 7; // 7-day default
    const { token, exp } = await jwtSign({
      fieldsToSign,
      secret: payload.secret,
      tokenExpiration,
    });

    return {
      token,
      exp: new Date(exp * 1000).toISOString(),
      username: guest.username,
    };
  },
};
