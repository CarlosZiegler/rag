"use client";

import { useChat } from "@ai-sdk/react";
import Image from "next/image";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/image",
  });

  console.log(
    messages?.map((m) => m?.parts).map((p) => p.map((p) => console.log(p)))
  );

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            <div key={m.id}>
              <div className="font-bold">{m.role}</div>
              {m.parts
                ? m.parts.map((ti) =>
                    ti.type === "tool-invocation" ? (
                      ti.toolInvocation.toolName === "generateImage" &&
                      ti.toolInvocation.state === "result" ? (
                        <Image
                          key={ti.toolInvocation.toolCallId}
                          src={`data:image/png;base64,${ti.toolInvocation.result.image}`}
                          alt={ti.toolInvocation.result.prompt}
                          height={400}
                          width={400}
                        />
                      ) : (
                        <div
                          key={ti.toolInvocation.toolCallId}
                          className="animate-pulse"
                        >
                          Generating image...
                        </div>
                      )
                    ) : null
                  )
                : null}
              <p>{m.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
