"use client";

import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Button } from "@/components/ui/button";
import { CornerDownLeft } from "lucide-react";
import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeDisplayBlock from "@/components/ui/code-display-block";

interface Message {
  id: string;
  createdAt?: Date;
  content: string;
  tool_call_id?: string;
  role: "user" | "friend";
}
export default function Message() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({}); // setMessages and reload add (optional)

  const messagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // const userMessage: Message = {
    //   id: crypto.randomUUID(), // Generate a unique ID for each message
    //   content: input,
    //   createdAt: new Date(),
    //   role: "user",
    // };

    // Add the user's message to the array
    // setMessages([...messages, userMessage]);
    e.preventDefault();
    handleSubmit(e);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isLoading || !input) return;
      onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  //   const handleActionClick = async (action: string, messageIndex: number) => {
  //     console.log("Action clicked:", action, "Message index:", messageIndex);
  //     if (action === "Refresh") {
  //       try {
  //         await reload();
  //       } catch (error) {
  //         console.error("Error reloading:", error);
  //       }
  //     }

  //     if (action === "Copy") {
  //       const message = messages[messageIndex];
  //       if (message && message.role === "assistant") {
  //         navigator.clipboard.writeText(message.content);
  //       }
  //     }
  //   };

  return (
    <main className="flex h-screen w-full max-w-full sm:max-w-3xl flex-col items-center mx-auto py-2 sm:py-6 px-2 sm:px-4">
      <ChatMessageList ref={messagesRef} className="flex-grow w-full">
        {/* Messages */}
        {messages &&
          messages.map((message, index) => (
            <ChatBubble key={index} variant={message.role == "user" ? "sent" : "received"} className="mb-2 sm:mb-4">
              <ChatBubbleAvatar src="" fallback={message.role == "user" ? "👨🏽" : "🤖"} />
              <ChatBubbleMessage className="max-w-[85%] sm:max-w-none text-sm sm:text-base">
                {message.content.split("```").map((part: string, index: number) => {
                  if (index % 2 === 0) {
                    return (
                      <Markdown key={index} remarkPlugins={[remarkGfm]}>
                        {part}
                      </Markdown>
                    );
                  } else {
                    return (
                      <pre className="whitespace-pre-wrap pt-2 overflow-x-auto text-xs sm:text-sm" key={index}>
                        <CodeDisplayBlock code={part} lang="" />
                      </pre>
                    );
                  }
                })}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}

        {/* Loading */}
      </ChatMessageList>
      <div className="w-full px-2 sm:px-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3 sm:mb-5">
          <Button className="rounded-2xl text-sm sm:text-base py-2 sm:py-3 flex-1 sm:flex-none">Pay</Button>
          <Button className="rounded-2xl text-sm sm:text-base py-2 sm:py-3 flex-1 sm:flex-none">Request Payment</Button>
        </div>
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
        >
          <ChatInput
            value={input}
            onKeyDown={onKeyDown}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="min-h-10 sm:min-h-12 resize-none rounded-lg bg-background border-0 p-2 sm:p-3 shadow-none focus-visible:ring-0 text-sm sm:text-base"
          />
          <div className="flex items-center p-2 sm:p-3 pt-0">
            <Button disabled={!input || isLoading} type="submit" size="sm" className="ml-auto gap-1.5 text-xs sm:text-sm">
              Send Message
              <CornerDownLeft className="size-3 sm:size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
