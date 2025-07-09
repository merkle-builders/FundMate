"use client";

import * as React from "react";
import { 
  ChatBubble, 
  ChatBubbleAvatar, 
  ChatBubbleMessage, 
  ChatBubbleTimestamp,
  MessageStatus,
  DateSeparator
} from "./chat-bubble";
import { ChatInput, TypingIndicator } from "./chat-input";
import { EnhancedChatMessageList } from "./chat-message-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Heart, Reply, Edit } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  status: MessageStatus;
  type: "message" | "payment";
  reactions?: Array<{ emoji: string; count: number; users: string[] }>;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  isTyping?: boolean;
}

const EnhancedChatDemo: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      content: "Hey! How's it going?",
      sender: "user1",
      timestamp: "2024-01-15T10:00:00Z",
      status: "read",
      type: "message",
      reactions: [{ emoji: "👍", count: 1, users: ["user2"] }]
    },
    {
      id: "2",
      content: "Good morning! I'm doing well, thanks for asking 😊",
      sender: "user2",
      timestamp: "2024-01-15T10:05:00Z",
      status: "read",
      type: "message",
    },
    {
      id: "3",
      content: "Just sent you $50 for lunch yesterday",
      sender: "user1",
      timestamp: "2024-01-15T10:10:00Z",
      status: "delivered",
      type: "payment",
    },
    {
      id: "4",
      content: "Thanks! Got it. Let me know if you need anything else",
      sender: "user2",
      timestamp: "2024-01-15T10:15:00Z",
      status: "read",
      type: "message",
      reactions: [
        { emoji: "❤️", count: 1, users: ["user1"] },
        { emoji: "🙏", count: 1, users: ["user1"] }
      ]
    },
  ]);

  const [currentUser] = React.useState("user1");
  const [typingUsers, setTypingUsers] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Array<{ id: string; index: number }>>([]);

  const users: Record<string, User> = {
    user1: { id: "user1", name: "You", avatar: "👤" },
    user2: { id: "user2", name: "Alice", avatar: "👩" },
  };

  // Handle sending new message
  const handleSendMessage = (content: string, files?: File[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: currentUser,
      timestamp: new Date().toISOString(),
      status: "sent",
      type: "message",
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: "delivered" as MessageStatus } : msg
      ));
    }, 1000);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: "read" as MessageStatus } : msg
      ));
    }, 2000);

    // Simulate typing indicator
    setTypingUsers(["Alice"]);
    setTimeout(() => {
      setTypingUsers([]);
      // Simulate response
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: "Got it! 👍",
        sender: "user2",
        timestamp: new Date().toISOString(),
        status: "read",
        type: "message",
      };
      setMessages(prev => [...prev, response]);
    }, 3000);
  };

  // Handle message copy
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Handle message reactions
  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          if (existingReaction.users.includes(currentUser)) {
            // Remove reaction
            return {
              ...msg,
              reactions: reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== currentUser) }
                  : r
              ).filter(r => r.count > 0)
            };
          } else {
            // Add reaction
            return {
              ...msg,
              reactions: reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count + 1, users: [...r.users, currentUser] }
                  : r
              )
            };
          }
        } else {
          // Add new reaction
          return {
            ...msg,
            reactions: [...reactions, { emoji, count: 1, users: [currentUser] }]
          };
        }
      }
      return msg;
    }));
  };

  // Handle typing indicator
  const handleTyping = (isTyping: boolean) => {
    // In a real app, this would send typing status to other users
    console.log(`User is ${isTyping ? "typing" : "not typing"}`);
  };

  // Handle message search
  const handleMessageSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = messages
        .map((msg, index) => ({ msg, index }))
        .filter(({ msg }) => msg.content.toLowerCase().includes(query.toLowerCase()))
        .map(({ msg, index }) => ({ id: msg.id, index }));
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Mention suggestions
  const mentionSuggestions = Object.values(users).filter(user => user.id !== currentUser);

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="py-4">
        <CardTitle className="flex items-center gap-2">
          <span>Enhanced Chat Demo</span>
          <Badge variant="secondary" className="text-xs">
            {messages.length} messages
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <div className="border-t" />
      
      <CardContent className="flex-1 p-0 flex flex-col">
        {/* Chat Messages */}
        <EnhancedChatMessageList
          messages={messages}
          onMessageSearch={handleMessageSearch}
          searchResults={searchResults}
          autoScroll={true}
          showDateSeparators={true}
          className="flex-1"
        >
          {messages.map((message, index) => {
            const isCurrentUser = message.sender === currentUser;
            const user = users[message.sender];
            const prevMessage = messages[index - 1];
            const isGrouped = prevMessage?.sender === message.sender && 
              new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() < 60000;

            return (
              <div key={message.id} id={`message-${message.id}`}>
                {/* Date separator */}
                {index === 0 || 
                 new Date(message.timestamp).toDateString() !== new Date(prevMessage.timestamp).toDateString() && (
                  <DateSeparator date={message.timestamp} />
                )}
                
                <ChatBubble
                  variant={isCurrentUser ? "sent" : "received"}
                  timestamp={message.timestamp}
                  status={message.status}
                  isGrouped={isGrouped}
                  reactions={message.reactions}
                  onCopy={() => handleCopyMessage(message.content)}
                  onReact={(emoji) => handleReaction(message.id, emoji)}
                  onReply={() => console.log("Reply to:", message.id)}
                  onEdit={isCurrentUser ? () => console.log("Edit:", message.id) : undefined}
                  onDelete={isCurrentUser ? () => console.log("Delete:", message.id) : undefined}
                  className="mb-2"
                >
                  <ChatBubbleAvatar
                    fallback={user?.avatar || "👤"}
                    showAvatar={!isGrouped}
                    variant={isCurrentUser ? "sent" : "received"}
                  />
                  <ChatBubbleMessage
                    variant={isCurrentUser ? "sent" : "received"}
                    status={message.status}
                    timestamp={message.timestamp}
                    className={message.type === "payment" ? "bg-blue-100 dark:bg-blue-900" : ""}
                  >
                    {message.type === "payment" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💰</span>
                        <div>
                          <p className="font-medium">{message.content}</p>
                          <p className="text-sm opacity-75">Payment sent</p>
                        </div>
                      </div>
                    ) : (
                      message.content
                    )}
                  </ChatBubbleMessage>
                </ChatBubble>
              </div>
            );
          })}
        </EnhancedChatMessageList>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2">
            <TypingIndicator users={typingUsers} />
          </div>
        )}

        {/* Chat Input */}
        <div className="p-4 border-t bg-muted/10">
          <ChatInput
            onSend={handleSendMessage}
            onTyping={handleTyping}
            placeholder="Type a message..."
            showEmojiPicker={true}
            showFileUpload={true}
            showVoiceRecording={true}
            maxLength={1000}
            mentionSuggestions={mentionSuggestions}
            typingUsers={typingUsers}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedChatDemo; 