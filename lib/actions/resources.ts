"use server";

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from "@/lib/db/schema/resources";
import { db } from "../db";
import { generateEmbeddings } from "../ai/embedding";
import { embeddings as embeddingsTable } from "../db/schema/embeddings";
import { TRPCError } from "@trpc/server/unstable-core-do-not-import";

export const createResource = async (input: NewResourceParams) => {
  try {
    const { content } = insertResourceSchema.parse(input);

    const [resource] = await db
      .insert(resources)
      .values({ content })
      .returning();

    const embeddings = await generateEmbeddings(content);
    const [dbContent] = await db
      .insert(embeddingsTable)
      .values(
        embeddings.map((embedding) => ({
          resourceId: resource.id,
          ...embedding,
        }))
      )
      .returning();

    return {
      id: dbContent.id,
      error: null,
    };
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        error instanceof Error ? error.message : "Error, please try again.",
    });
  }
};
