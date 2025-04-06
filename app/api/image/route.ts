import { openai } from "@ai-sdk/openai";
import { experimental_generateImage, Message, streamText, tool } from "ai";
import { z } from "zod";

const generateImageTool = tool({
  description: "Generate an image",
  parameters: z.object({
    prompt: z.string().describe("The prompt to generate the image from"),
  }),
  execute: async ({ prompt }) => {
    const { image } = await experimental_generateImage({
      model: openai.image("dall-e-3"),
      prompt,
    });
    // in production, save this image to blob storage and return a URL
    return { image: image.base64, prompt };
  },
});

const tools = {
  generateImage: generateImageTool,
};

export async function POST(request: Request) {
  const { messages }: { messages: Message[] } = await request.json();

  // filter through messages and remove base64 image data to avoid sending to the model
  const formattedMessages = messages.map((m) => {
    if (m.role === "assistant" && m.parts && m.parts.length > 0) {
      m.parts.forEach((part) => {
        if (
          part.type === "tool-invocation" &&
          part.toolInvocation.toolName === "generateImage" &&
          part.toolInvocation.state === "result"
        ) {
          part.toolInvocation.result.image = `redacted-for-length`;
        }
      });
    }
    return m;
  });

  const result = streamText({
    model: openai("gpt-4o"),
    messages: formattedMessages,
    tools,
  });
  return result.toDataStreamResponse();
}
