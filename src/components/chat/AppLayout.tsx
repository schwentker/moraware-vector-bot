import { Header } from "./Header";
import { ChatContainer } from "./ChatContainer";
import { Footer } from "./Footer";
import { useChat } from "@/hooks/useChat";

export function AppLayout() {
  const { messages, isLoading, error, sendMessage, retryLastMessage, clearMessages } = useChat();

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header
        onClearChat={clearMessages}
        hasMessages={messages.length > 0}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden">
          <ChatContainer
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSendMessage={sendMessage}
            onRetry={retryLastMessage}
          />
        </div>
        <Footer />
      </main>
    </div>
  );
}
