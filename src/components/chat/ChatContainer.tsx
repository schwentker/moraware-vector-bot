import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { EmptyState } from "./EmptyState";
import { Message } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  onRetry: () => void;
}

export function ChatContainer({
  messages,
  isLoading,
  error,
  onSendMessage,
  onRetry,
}: ChatContainerProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSuggestionClick = (question: string) => {
    onSendMessage(question);
  };

  const handleSend = (message: string) => {
    onSendMessage(message);
    setInputValue("");
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {isEmpty ? (
        <EmptyState onSuggestionClick={handleSuggestionClick} />
      ) : (
        <MessageList messages={messages} isLoading={isLoading} />
      )}
      
      {error && !isLoading && (
        <div className="mx-4 mb-2 flex items-center justify-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-7 gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </div>
      )}
      
      <MessageInput
        onSend={handleSend}
        isLoading={isLoading}
        initialValue={inputValue}
      />
    </div>
  );
}
