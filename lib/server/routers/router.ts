import { createCallerFactory } from "@trpc/server/unstable-core-do-not-import";
import { resourcesRouter } from "./resources";
import { cache } from "react";
import { Context } from "../context";
import { router } from "../trpc";
export const appRouter = router({
  resources: resourcesRouter,
});

export type AppRouter = typeof appRouter;

const createCallerContext = cache(
  async (): Promise<Context> => ({
    session: null,
  })
);

export const caller = createCallerFactory()(appRouter)(createCallerContext);
