import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MessageLoading from "./message-loading";
import { Button, ButtonProps } from "../button";
import { Badge } from "../badge";
import { 
  Copy, 
  MoreHorizontal, 
  Reply, 
  Edit, 
  Trash2, 
  Heart, 
  ThumbsUp, 
  Smile, 
  Check, 
  CheckCheck,
  Clock,
  User
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../dropdown-menu";

export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

// ChatBubble
const chatBubbleVariant = cva(
  "flex gap-2 max-w-[60%] items-end relative group transition-all duration-200 hover:scale-[1.02] animate-in fade-in-0 slide-in-from-bottom-5", 
  {
    variants: {
      variant: {
        received: "self-start",
        sent: "self-end flex-row-reverse",
      },
      layout: {
        default: "",
        ai: "max-w-full w-full items-center",
      },
    },
    defaultVariants: {
      variant: "received",
      layout: "default",
    },
  }
);

interface ChatBubbleProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof chatBubbleVariant> {
  timestamp?: string;
  status?: MessageStatus;
  showAvatar?: boolean;
  isGrouped?: boolean;
  onCopy?: () => void;
  onReact?: (emoji: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReply?: () => void;
  reactions?: Array<{ emoji: string; count: number; users: string[] }>;
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ 
    className, 
    variant, 
    layout, 
    timestamp, 
    status, 
    showAvatar = true, 
    isGrouped = false, 
    onCopy, 
    onReact, 
    onEdit, 
    onDelete, 
    onReply,
    reactions = [],
    children, 
    ...props 
  }, ref) => {
    const [showActions, setShowActions] = React.useState(false);
    
    return (
      <div
        className={cn(
          chatBubbleVariant({ variant, layout, className }),
          "relative group",
          isGrouped && "mb-1"
        )}
        ref={ref}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        {...props}
      >
        {React.Children.map(children, child =>
          React.isValidElement(child) && typeof child.type !== 'string'
            ? React.cloneElement(child, { 
                variant, 
                layout, 
                showAvatar: showAvatar && !isGrouped, 
                status, 
                timestamp 
              } as React.ComponentProps<typeof child.type>)
            : child
        )}
        
        {/* Message Actions */}
        {showActions && (
          <ChatBubbleActionWrapper variant={variant!}>
            <div className="flex items-center gap-1 bg-background border rounded-lg shadow-lg p-1">
              <ChatBubbleAction
                icon={<Reply className="w-4 h-4" />}
                onClick={onReply}
                variant="ghost"
                size="sm"
              />
              <ChatBubbleAction
                icon={<Heart className="w-4 h-4" />}
                onClick={() => onReact?.("❤️")}
                variant="ghost"
                size="sm"
              />
              <ChatBubbleAction
                icon={<Copy className="w-4 h-4" />}
                onClick={onCopy}
                variant="ghost"
                size="sm"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </ChatBubbleActionWrapper>
        )}
        
        {/* Message Reactions */}
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {reactions.map((reaction, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => onReact?.(reaction.emoji)}
              >
                {reaction.emoji} {reaction.count}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }
);
ChatBubble.displayName = "ChatBubble";

// ChatBubbleAvatar
interface ChatBubbleAvatarProps {
  src?: string;
  fallback?: string;
  className?: string;
  showAvatar?: boolean;
  variant?: "sent" | "received";
}

const ChatBubbleAvatar: React.FC<ChatBubbleAvatarProps> = ({
  src,
  fallback,
  className,
  showAvatar = true,
  variant = "received",
}) => {
  if (!showAvatar) {
    return <div className="w-8 h-8" />; // Placeholder to maintain alignment
  }
  
  return (
    <Avatar className={cn("w-8 h-8 border-2 border-background", className)}>
      <AvatarImage src={src} alt="Avatar" />
      <AvatarFallback className="text-xs">
        {fallback || <User className="w-4 h-4" />}
      </AvatarFallback>
    </Avatar>
  );
};

// ChatBubbleMessage
const chatBubbleMessageVariants = cva("p-3 relative", {
  variants: {
    variant: {
      received:
        "bg-secondary text-secondary-foreground rounded-r-lg rounded-tl-lg shadow-sm",
      sent: "bg-primary text-primary-foreground rounded-l-lg rounded-tr-lg shadow-sm",
    },
    layout: {
      default: "",
      ai: "border-t w-full rounded-none bg-transparent",
    },
  },
  defaultVariants: {
    variant: "received",
    layout: "default",
  },
});

interface ChatBubbleMessageProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof chatBubbleMessageVariants> {
  isLoading?: boolean;
  status?: MessageStatus;
  timestamp?: string;
}

const ChatBubbleMessage = React.forwardRef<
  HTMLDivElement,
  ChatBubbleMessageProps
>(
  (
    { 
      className, 
      variant, 
      layout, 
      isLoading = false, 
      status, 
      timestamp, 
      children, 
      ...props 
    },
    ref,
  ) => (
    <div
      className={cn(
        chatBubbleMessageVariants({ variant, layout, className }),
        "break-words max-w-full whitespace-pre-wrap",
      )}
      ref={ref}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <MessageLoading />
        </div>
      ) : (
        <>
          {children}
          {(timestamp || status) && (
            <div className={cn(
              "flex items-center gap-1 mt-1 text-xs opacity-70",
              variant === "sent" ? "justify-end" : "justify-start"
            )}>
              {timestamp && (
                <span className="text-xs">
                  {new Date(timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              )}
              {status && variant === "sent" && (
                <MessageStatusIndicator status={status} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  ),
);
ChatBubbleMessage.displayName = "ChatBubbleMessage";

// Message Status Indicator
interface MessageStatusIndicatorProps {
  status: MessageStatus;
}

const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({ status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case "sending":
        return <Clock className="w-3 h-3 animate-spin" />;
      case "sent":
        return <Check className="w-3 h-3" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case "failed":
        return <div className="w-3 h-3 rounded-full bg-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center" title={status}>
      {getStatusIcon()}
    </div>
  );
};

// ChatBubbleTimestamp
interface ChatBubbleTimestampProps
  extends React.HTMLAttributes<HTMLDivElement> {
  timestamp: string;
}

const ChatBubbleTimestamp: React.FC<ChatBubbleTimestampProps> = ({
  timestamp,
  className,
  ...props
}) => (
  <div
    className={cn(
      "text-xs text-muted-foreground px-2 py-1",
      className
    )}
    {...props}
  >
    {new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}
  </div>
);

// ChatBubbleAction
type ChatBubbleActionProps = ButtonProps & {
  icon: React.ReactNode;
};

const ChatBubbleAction: React.FC<ChatBubbleActionProps> = ({
  icon,
  onClick,
  className,
  variant = "ghost",
  size = "sm",
  ...props
}) => (
  <Button
    variant={variant}
    size={size}
    className={cn("h-8 w-8 p-0", className)}
    onClick={onClick}
    {...props}
  >
    {icon}
  </Button>
);

interface ChatBubbleActionWrapperProps {
  variant?: "sent" | "received";
  className?: string;
  children: React.ReactNode;
}

// ChatBubbleActionWrapper
const ChatBubbleActionWrapper: React.FC<ChatBubbleActionWrapperProps> = ({ 
  variant = "received", 
  className, 
  children 
}) => (
  <div className={cn(
    "absolute top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10",
    variant === "sent" ? "-left-2 -translate-x-full" : "-right-2 translate-x-full",
    className
  )}>
    {children}
  </div>
);

// Date Separator Component
interface DateSeparatorProps {
  date: string;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => (
  <div className="flex items-center justify-center py-4">
    <div className="bg-muted px-3 py-1 rounded-full">
      <span className="text-xs text-muted-foreground font-medium">
        {new Date(date).toLocaleDateString([], { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </span>
    </div>
  </div>
);

export {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  chatBubbleVariant,
  chatBubbleMessageVariants,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
  MessageStatusIndicator,
  DateSeparator,
};
