import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  X, 
  ArrowDown, 
  Loader2,
  MessageCircle 
} from "lucide-react";
import { DateSeparator } from "./chat-bubble";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  messages?: Array<{
    id: string;
    timestamp: string;
    content: string;
    sender: string;
    type?: string;
  }>;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onMessageSearch?: (query: string) => void;
  searchResults?: Array<{ id: string; index: number }>;
  autoScroll?: boolean;
  showDateSeparators?: boolean;
  onScrollToMessage?: (messageId: string) => void;
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ 
    className, 
    children, 
    messages = [],
    isLoading = false,
    hasMore = false,
    onLoadMore,
    onMessageSearch,
    searchResults = [],
    autoScroll = true,
    showDateSeparators = true,
    onScrollToMessage,
    ...props 
  }, _ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [showScrollToBottom, setShowScrollToBottom] = React.useState(false);
    const [showSearch, setShowSearch] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [newMessageCount, setNewMessageCount] = React.useState(0);
    const [isNearBottom, setIsNearBottom] = React.useState(true);
    const [_lastScrollTop, setLastScrollTop] = React.useState(0); 
    const prevMessagesLength = React.useRef(messages.length);

    // Auto-scroll to bottom when new messages arrive
    React.useEffect(() => {
      if (autoScroll && isNearBottom && containerRef.current) {
        scrollToBottom();
      } else if (messages.length > prevMessagesLength.current) {
        setNewMessageCount(prev => prev + (messages.length - prevMessagesLength.current));
      }
      prevMessagesLength.current = messages.length;
    }, [messages.length, autoScroll, isNearBottom]);

    // Handle scroll events
    React.useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        
        setIsNearBottom(isAtBottom);
        setShowScrollToBottom(!isAtBottom);
        
        if (isAtBottom) {
          setNewMessageCount(0);
        }

        // Load more messages when scrolling to top
        if (scrollTop === 0 && hasMore && onLoadMore && !isLoading) {
          onLoadMore();
        }

        setLastScrollTop(scrollTop);
      };

      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }, [hasMore, onLoadMore, isLoading]);

    // Scroll to bottom function
    const scrollToBottom = (smooth = true) => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: smooth ? "smooth" : "auto",
        });
      }
    };

    // Handle search
    const handleSearch = (query: string) => {
      setSearchQuery(query);
      onMessageSearch?.(query);
    };

    // Clear search
    const clearSearch = () => {
      setSearchQuery("");
      setShowSearch(false);
      onMessageSearch?.("");
    };

    // Group messages by date
    const groupMessagesByDate = (messages: ChatMessageListProps["messages"]) => {
      if (!messages || !showDateSeparators) return [];
      
      const grouped: Array<{ type: "date" | "message"; date?: string; message?: any; messages?: any[] }> = [];
      let currentDate = "";
      
      messages.forEach((message) => {
        const messageDate = new Date(message.timestamp).toDateString();
        
        if (messageDate !== currentDate) {
          grouped.push({ type: "date", date: messageDate });
          currentDate = messageDate;
        }
        
        grouped.push({ type: "message", message });
      });
      
      return grouped;
    };

    const groupedMessages = groupMessagesByDate(messages);

    // Scroll to specific message
    const scrollToMessage = (messageId: string) => {
      const messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
        messageElement.classList.add("highlight-message");
        setTimeout(() => {
          messageElement.classList.remove("highlight-message");
        }, 2000);
      }
    };

    return (
      <div className="relative flex flex-col h-full">
        {/* Search Bar */}
        {showSearch && (
          <div className="flex items-center gap-2 p-2 border-b bg-background">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 h-8"
            />
            <Button variant="ghost" size="sm" onClick={clearSearch}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="px-2 py-1 bg-muted/50 border-b">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {searchResults.length} result{searchResults.length > 1 ? "s" : ""} found
              </span>
              <div className="flex gap-1">
                {searchResults.slice(0, 3).map((result) => (
                  <Button
                    key={result.id}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => scrollToMessage(result.id)}
                  >
                    #{result.index}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div
          ref={containerRef}
          className={cn(
            "flex flex-col flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth",
            "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
            className
          )}
          {...props}
        >
          {/* Loading indicator at top */}
          {isLoading && hasMore && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Messages with date separators */}
          {showDateSeparators && groupedMessages.length > 0 ? (
            groupedMessages.map((item, index) => (
              <div key={index}>
                {item.type === "date" && item.date && (
                  <DateSeparator date={item.date} />
                )}
                {item.type === "message" && item.message && (
                  <div id={`message-${item.message.id}`} className="message-item">
                    {/* Message content would be rendered here */}
                    {/* This is handled by the children prop */}
                  </div>
                )}
              </div>
            ))
          ) : (
            children
          )}

          {/* Empty state */}
          {messages.length === 0 && !isLoading && !children && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No messages yet</h3>
              <p className="text-sm text-muted-foreground">Start a conversation by sending a message</p>
            </div>
          )}
        </div>

        {/* Floating Action Buttons */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          {/* Search Button */}
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0 rounded-full shadow-lg"
            onClick={() => setShowSearch(!showSearch)}
            title="Search messages"
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* New Messages Badge */}
          {newMessageCount > 0 && (
            <Badge
              variant="default"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs cursor-pointer"
              onClick={() => {
                scrollToBottom();
                setNewMessageCount(0);
              }}
            >
              {newMessageCount > 99 ? "99+" : newMessageCount}
            </Badge>
          )}

          {/* Scroll to Bottom Button */}
          {showScrollToBottom && (
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0 rounded-full shadow-lg"
              onClick={() => scrollToBottom()}
              title="Scroll to bottom"
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }
);

ChatMessageList.displayName = "ChatMessageList";

// Enhanced Message Container for better integration
interface EnhancedChatMessageListProps extends ChatMessageListProps {
  children: React.ReactNode;
}

const EnhancedChatMessageList = React.forwardRef<HTMLDivElement, EnhancedChatMessageListProps>(
  ({ children, ...props }, ref) => {
    return (
      <ChatMessageList ref={ref} {...props}>
        {children}
      </ChatMessageList>
    );
  }
);

EnhancedChatMessageList.displayName = "EnhancedChatMessageList";

export { ChatMessageList, EnhancedChatMessageList };
