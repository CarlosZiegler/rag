/**
 * This file contains the tRPC http response handler and context creation for Next.js
 */
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "@/lib/server/context";
import { appRouter } from "@/lib/server/routers/router";
import { env } from "@/lib/env";

const handler = (req: Request) =>
  fetchRequestHandler({
    router: appRouter,
    req,
    endpoint: "/api/trpc",
    /**
     * @see https://trpc.io/docs/v11/context
     */
    createContext,
    /**
     * @see https://trpc.io/docs/v11/error-handling
     */
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

export const GET = handler;
export const POST = handler;
