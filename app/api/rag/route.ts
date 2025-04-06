import { createResource } from "@/lib/actions/resources";
import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";
import { findRelevantContent } from "@/lib/ai/embedding";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  //   const formData = await req.formData();
  //   const file = formData.get("pdf") as File;

  //   //   console.log("messages-backend", JSON.stringify(messages, null, 2));

  //   const messages: CoreMessage[] = [
  //     {
  //       role: "user",
  //       content: "Check this file",
  //       experimental_attachments: [{ url: URL.createObjectURL(file), contentType: "application/pdf", name: file.name },
  //       ],
  //     },
  //   ];
  const result = streamText({
    model: openai("gpt-4o"),
    messages: [
      ...messages,
      // {
      //     role: "user",
      //     content: [
      //       {
      //         type: "text",
      //         text: "Create a multiple choice test based on this document.",
      //       },
      //       {
      //         type: "file",
      //         data: firstFile,
      //         mimeType: "application/pdf",
      //       },
      //     ],
      // }
    ],
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted or a file, use this tool without asking for confirmation.`,
        parameters: z.object({
          content: z
            .string()
            .describe("the content or resource to add to the knowledge base"),
        }),
        execute: async ({ content }) => createResource({ content }),
      }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe("the users question"),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
    },
  });

  return result.toDataStreamResponse();
}
