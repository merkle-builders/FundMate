import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Image, 
  File, 
  X,
  AtSign,
  Plus
} from "lucide-react";
// Popover not available, using dropdown menu instead
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

// Common emojis for quick access
const COMMON_EMOJIS = [
  "😀", "😂", "😊", "😍", "🤔", "😢", "😡", "👍", "👎", "❤️",
  "🔥", "💯", "🎉", "🚀", "⚡", "✨", "💪", "🙌", "👏", "🤝"
];

interface ChatInputProps extends React.ComponentProps<typeof Textarea> {
  value?: string;
  onSend?: (message: string, files?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
  onFileUpload?: (files: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  showEmojiPicker?: boolean;
  showFileUpload?: boolean;
  showVoiceRecording?: boolean;
  maxLength?: number;
  mentionSuggestions?: Array<{ id: string; name: string; avatar?: string }>;
  isLoading?: boolean;
  typingUsers?: string[];
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ 
    className, 
    value = "", 
    onSend, 
    onTyping, 
    onFileUpload, 
    placeholder = "Type your message...", 
    disabled = false,
    showEmojiPicker = true,
    showFileUpload = true,
    showVoiceRecording = false,
    maxLength = 1000,
    mentionSuggestions = [],
    isLoading = false,
    typingUsers = [],
    onChange,
    onKeyDown,
    ...props 
  }, _ref) => { 
    const [message, setMessage] = React.useState(value);
    const [attachedFiles, setAttachedFiles] = React.useState<File[]>([]);
    const [showMentions, setShowMentions] = React.useState(false);
    const [mentionQuery, setMentionQuery] = React.useState("");
    const [cursorPosition, setCursorPosition] = React.useState(0);
    const [isTyping, setIsTyping] = React.useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const typingTimeoutRef = React.useRef<NodeJS.Timeout>();

    // Auto-resize textarea
    React.useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
      }
    }, [message]);

    // Handle typing indicators
    React.useEffect(() => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (message.length > 0 && !isTyping) {
        setIsTyping(true);
        onTyping?.(true);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping?.(false);
      }, 1000);

      return () => {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }, [message, isTyping, onTyping]);

    // Handle @ mentions
    React.useEffect(() => {
      const words = message.split(" ");
      const lastWord = words[words.length - 1];
      
      if (lastWord.startsWith("@") && lastWord.length > 1) {
        setMentionQuery(lastWord.slice(1));
        setShowMentions(true);
      } else {
        setShowMentions(false);
        setMentionQuery("");
      }
    }, [message]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= maxLength) {
        setMessage(newValue);
        setCursorPosition(e.target.selectionStart || 0);
        onChange?.(e);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
      
      if (e.key === "Escape") {
        setShowMentions(false);
      }
      
      onKeyDown?.(e);
    };

    const handleSend = () => {
      if ((message.trim() || attachedFiles.length > 0) && !disabled && !isLoading) {
        onSend?.(message.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
        setMessage("");
        setAttachedFiles([]);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    };

    const handleEmojiSelect = (emoji: string) => {
      const newMessage = message.slice(0, cursorPosition) + emoji + message.slice(cursorPosition);
      setMessage(newMessage);
      setCursorPosition(cursorPosition + emoji.length);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        setAttachedFiles(prev => [...prev, ...files]);
        onFileUpload?.(files);
      }
    };

    const handleFileRemove = (index: number) => {
      setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleMentionSelect = (mention: { id: string; name: string }) => {
      const words = message.split(" ");
      words[words.length - 1] = `@${mention.name} `;
      setMessage(words.join(" "));
      setShowMentions(false);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    const filteredMentions = mentionSuggestions.filter(mention =>
      mention.name.toLowerCase().includes(mentionQuery.toLowerCase())
    );

    return (
      <div className="relative w-full">
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            {typingUsers.length === 1 
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.slice(0, -1).join(", ")} and ${typingUsers[typingUsers.length - 1]} are typing...`
            }
          </div>
        )}

        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-t-lg">
            {attachedFiles.map((file, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <File className="w-3 h-3" />
                <span className="text-xs max-w-20 truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleFileRemove(index)}
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Mention Suggestions */}
        {showMentions && filteredMentions.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border rounded-lg shadow-lg max-h-40 overflow-y-auto z-50">
            {filteredMentions.map((mention) => (
              <div
                key={mention.id}
                className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                onClick={() => handleMentionSelect(mention)}
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  {mention.avatar ? (
                    <img src={mention.avatar} alt={mention.name} className="w-6 h-6 rounded-full" />
                  ) : (
                    <AtSign className="w-3 h-3" />
                  )}
                </div>
                <span className="text-sm font-medium">{mention.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Main Input Area */}
        <div className="relative flex items-end gap-2 p-2 bg-background border rounded-lg shadow-sm">
          {/* File Upload */}
          {showFileUpload && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
                  disabled={disabled || isLoading}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attach File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Image className="w-4 h-4 mr-2" />
                  Upload Image
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Text Input */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={cn(
              "min-h-8 max-h-32 resize-none border-0 bg-transparent p-2 focus-visible:ring-0 focus-visible:ring-offset-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
              className
            )}
            style={{ height: "auto" }}
            {...props}
          />

          {/* Character Counter */}
          {maxLength && (
            <div className="absolute bottom-1 right-20 text-xs text-muted-foreground">
              {message.length}/{maxLength}
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 shrink-0"
                  disabled={disabled || isLoading}
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-2">
                <div className="grid grid-cols-10 gap-1">
                  {COMMON_EMOJIS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Voice Recording */}
          {showVoiceRecording && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 shrink-0"
              disabled={disabled || isLoading}
              title="Voice message (coming soon)"
            >
              <Mic className="w-4 h-4" />
            </Button>
          )}

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={(!message.trim() && attachedFiles.length === 0) || disabled || isLoading}
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";

// Typing Indicator Component
interface TypingIndicatorProps {
  users: string[];
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users, className }) => {
  if (users.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground", className)}>
      <div className="flex gap-1">
        <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
        <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
        <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
      </div>
      <span>
        {users.length === 1 
          ? `${users[0]} is typing...`
          : `${users.slice(0, -1).join(", ")} and ${users[users.length - 1]} are typing...`
        }
      </span>
    </div>
  );
};

export { ChatInput, TypingIndicator };
