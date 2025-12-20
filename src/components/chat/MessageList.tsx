import { useEffect, useRef, useState } from "react";
import { Bot, User, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/hooks/useChat";
import { MessageFeedback } from "./MessageFeedback";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in" role="status" aria-label="Assistant is typing">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      <div className="rounded-2xl rounded-tl-sm border bg-chat-assistant-bg px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-typing-dot"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-typing-dot"
            style={{ animationDelay: "200ms" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-typing-dot"
            style={{ animationDelay: "400ms" }}
          />
        </div>
      </div>
    </div>
  );
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        description: "Copied to clipboard!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy to clipboard",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground transition-colors"
      aria-label={copied ? "Copied" : "Copy response"}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

function MessageBubble({ message, isLast }: { message: Message; isLast: boolean }) {
  const isUser = message.role === "user";
  const showFeedback = !isUser && isLast && message.content.length > 0;
  const showCopy = !isUser && message.content.length > 0;

  return (
    <div
      className={cn(
        "flex items-start gap-3 animate-fade-in",
        isUser && "flex-row-reverse"
      )}
      role="article"
      aria-label={`${isUser ? "Your" : "Assistant"} message`}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105",
          isUser ? "bg-primary" : "bg-secondary"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>
      <div className="flex flex-col gap-1 max-w-[80%] group">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm transition-shadow hover:shadow-md",
            isUser
              ? "rounded-tr-sm bg-chat-user-bg text-chat-user-fg"
              : "rounded-tl-sm border bg-chat-assistant-bg text-chat-assistant-fg"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={cn(
          "flex items-center gap-2",
          isUser && "flex-row-reverse"
        )}>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
          {showCopy && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton content={message.content} />
            </div>
          )}
        </div>
        {showFeedback && (
          <MessageFeedback messageId={message.id} />
        )}
      </div>
    </div>
  );
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto chat-scrollbar p-4 space-y-4"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      {messages.map((message, index) => (
        <MessageBubble 
          key={message.id} 
          message={message} 
          isLast={index === messages.length - 1 && !isLoading}
        />
      ))}
      {isLoading && <TypingIndicator />}
    </div>
  );
}
