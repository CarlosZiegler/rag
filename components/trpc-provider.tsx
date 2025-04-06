"use client";
import { getBaseUrl, getQueryClient, TRPCProvider } from "@/lib/trpc";
import { AppRouter } from "@/lib/server/routers/router";

import { QueryClientProvider } from "@tanstack/react-query";
import {
  httpBatchLink,
  httpBatchStreamLink,
  httpLink,
  httpSubscriptionLink,
  isNonJsonSerializable,
  loggerLink,
  splitLink,
} from "@trpc/client";

import { createTRPCClient } from "@trpc/client";
import { useState } from "react";
import superJSON from "superjson";
import { DataTransformer } from "@trpc/server/unstable-core-do-not-import";

export class FormDataTransformer implements DataTransformer {
  serialize(object: unknown) {
    if (!(object instanceof FormData)) {
      throw new Error("Expected FormData");
    }

    return object;
  }

  deserialize(object: unknown) {
    return object as JSON;
  }
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        // httpBatchLink({
        //   url: getBaseUrl() + "/api/trpc",
        //   transformer: superJSON,
        //   headers: () => {
        //     const headers = new Headers();
        //     headers.set("x-trpc-source", "nextjs-react");
        //     return headers;
        //   },
        // }),
        splitLink({
          condition: (op) =>
            !isNonJsonSerializable(op.input) &&
            op.type !== "subscription" &&
            !op.context["stream"],
          true: httpBatchLink({
            url: getBaseUrl() + "/api/trpc",
            transformer: superJSON,
          }),
          false: splitLink({
            condition: (op) =>
              isNonJsonSerializable(op.input) &&
              op.type !== "subscription" &&
              !op.context["stream"],
            true: httpLink({
              url: getBaseUrl() + "/api/trpc",
              transformer: new FormDataTransformer(),
            }),
            false: splitLink({
              condition: (op) =>
                op.type === "subscription" && !op.context["stream"],
              true: httpSubscriptionLink({
                url: getBaseUrl() + "/api/trpc",
                transformer: superJSON,
              }),
              false: httpBatchStreamLink({
                url: getBaseUrl() + "/api/trpc",
                transformer: superJSON,
              }),
            }),
          }),
        }),
      ],
    })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
