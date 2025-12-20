import { useState } from "react";
import { Header } from "./Header";
import { CategorySidebar } from "./CategorySidebar";
import { CategoryDrawer } from "./CategoryDrawer";
import { ChatContainer } from "./ChatContainer";
import { Footer } from "./Footer";
import { useChat } from "@/hooks/useChat";

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { messages, isLoading, error, sendMessage, retryLastMessage, clearMessages } = useChat();

  const handleCategoryClick = (categoryId: string) => {
    // For now, send a message asking about the category
    const categoryMessages: Record<string, string> = {
      "get-started": "How do I get started with CounterGo?",
      "how-to-videos": "Where can I find how-to videos for CounterGo?",
      "whats-new": "What's new in the latest CounterGo update?",
      drawing: "How do I use the drawing tools in CounterGo?",
      quoting: "How do I create and manage quotes?",
      orders: "How do I manage orders in CounterGo?",
      "price-lists": "How do I set up my price list?",
      "printing-emailing": "How do I print or email quotes?",
      "sample-views": "What are sample views and how do I use them?",
      "connect-systemize": "How do I connect to Systemize?",
      "manage-account": "How do I manage my CounterGo account?",
      quickbooks: "How do I set up QuickBooks integration?",
    };

    const message = categoryMessages[categoryId] || `Tell me about ${categoryId}`;
    sendMessage(message);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header
        onClearChat={clearMessages}
        onToggleSidebar={() => setDrawerOpen(true)}
        hasMessages={messages.length > 0}
      />

      <div className="flex flex-1 overflow-hidden">
        <CategorySidebar onCategoryClick={handleCategoryClick} />

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

      <CategoryDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onCategoryClick={handleCategoryClick}
      />
    </div>
  );
}
