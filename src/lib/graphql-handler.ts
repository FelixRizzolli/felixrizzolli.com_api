import type { NextRequest } from 'next/server';

type GraphQLRouteHandler = (req: NextRequest, ...args: unknown[]) => Promise<Response>;

/**
 * Wraps a Payload `GRAPHQL_POST` handler so that GraphQL errors carrying a
 * `statusCode` (or `http.status`) in their `extensions` object are re-emitted
 * as the actual HTTP response status.
 *
 * ## Behavior
 * This wrapper reads the **highest** error status found across all errors in
 * the response body and returns it as the real HTTP status, so that:
 *  - Standard HTTP clients can branch on 401 / 403 without inspecting the body.
 *  - Browser `fetch` rejects on non-2xx, surfacing the error naturally.
 *  - The `graphql-request` `ClientError.response.status` property reflects
 *    the semantic status code.
 *
 * ## Status-code resolution strategy
 * When a response contains multiple errors with different status codes the
 * *highest* code wins (e.g. a 500 in the same batch as a 403 returns 500).
 * If no error carries a recognisable status the original response is passed
 * through unchanged.
 *
 * ## Usage
 * ```ts
 * // app/(payload)/api/graphql/route.ts
 * import { withGraphQLStatus } from '@/lib/graphql-handler';
 * export const POST = withGraphQLStatus(GRAPHQL_POST(config));
 * ```
 */
export function withGraphQLStatus(handler: GraphQLRouteHandler): GraphQLRouteHandler {
  return async (req: NextRequest, ...args: unknown[]): Promise<Response> => {
    const response = await handler(req, ...args);

    // Buffer the body once so we can inspect and re-stream it.
    const text = await response.text();

    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      // Not JSON (e.g. a network-level error page) — pass through unchanged.
      return new Response(text, {
        status: response.status,
        headers: response.headers,
      });
    }

    // Walk all errors and find the highest semantic status code.
    if (
      body !== null &&
      typeof body === 'object' &&
      'errors' in body &&
      Array.isArray((body as Record<string, unknown>).errors) &&
      ((body as Record<string, unknown>).errors as unknown[]).length > 0
    ) {
      let maxStatus = 0;
      for (const err of (body as { errors: unknown[] }).errors) {
        // Payload uses extensions.statusCode; some other implementations use
        // extensions.http.status — support both.
        const ext = (err as Record<string, unknown>)?.extensions as
          | Record<string, unknown>
          | undefined;
        const s: unknown =
          ext?.statusCode ?? (ext?.http as Record<string, unknown> | undefined)?.status;
        if (typeof s === 'number' && s > maxStatus) maxStatus = s;
      }

      if (maxStatus >= 400) {
        // Preserve all original headers (e.g. CORS, Set-Cookie) and
        // override only the status.
        const headers = new Headers(response.headers);
        headers.set('Content-Type', 'application/json');
        return new Response(text, { status: maxStatus, headers });
      }
    }

    // No error status found — return the original response unchanged.
    return new Response(text, {
      status: response.status,
      headers: response.headers,
    });
  };
}
