"use client";

import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { type AppRouter } from "../server/routers/router";
import { getBaseUrl } from "../trpc";
import superjson from "superjson";

export const api = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
