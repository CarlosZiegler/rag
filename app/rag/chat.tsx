"use client";

import { useChat } from "@ai-sdk/react";
import Image from "next/image";
import { useRef, useEffect } from "react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/rag",
    maxSteps: 3,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col w-full py-24 mx-auto stretch min-w-[50vw] px-14">
      <div className="space-y-4 max-h-[calc(100vh-10rem)] overflow-y-auto">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            <div key={m.id}>
              <div className="font-bold">{m.role}</div>
              {m.parts &&
                m.parts.map((ti) =>
                  ti.type === "tool-invocation" &&
                  ti.toolInvocation.state === "call" ? (
                    ti.toolInvocation.toolName === "addResource" ? (
                      <p>Calling addResource tool</p>
                    ) : (
                      <div
                        key={ti.toolInvocation.toolCallId}
                        className="animate-pulse"
                      >
                        Calling getInformation tool
                      </div>
                    )
                  ) : null
                )}
              <p>{m.content}</p>
            </div>
            <div>
              {m?.experimental_attachments
                ?.filter(
                  (attachment) =>
                    attachment?.contentType?.startsWith("image/") ||
                    attachment?.contentType?.startsWith("application/pdf")
                )
                .map((attachment, index) =>
                  attachment.contentType?.startsWith("image/") ? (
                    <Image
                      key={`${m.id}-${index}`}
                      src={attachment.url}
                      width={500}
                      height={500}
                      alt={attachment.name ?? `attachment-${index}`}
                    />
                  ) : attachment.contentType?.startsWith("application/pdf") ? (
                    <iframe
                      key={`${m.id}-${index}`}
                      src={attachment.url}
                      width="500"
                      height="600"
                      title={attachment.name ?? `attachment-${index}`}
                    />
                  ) : null
                )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl">
        <form onSubmit={handleSubmit}>
          <input
            className="w-full p-2"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </div>
  );
}
