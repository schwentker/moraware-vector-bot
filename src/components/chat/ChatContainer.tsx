import { useState } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { EmptyState } from "./EmptyState";
import { Message } from "@/hooks/useChat";

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export function ChatContainer({
  messages,
  isLoading,
  onSendMessage,
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
      <MessageInput
        onSend={handleSend}
        isLoading={isLoading}
        initialValue={inputValue}
      />
    </div>
  );
}
