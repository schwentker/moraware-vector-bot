import { useState } from "react";
import { Header } from "./Header";
import { CategorySidebar } from "./CategorySidebar";
import { CategoryDrawer } from "./CategoryDrawer";
import { ChatContainer } from "./ChatContainer";
import { Footer } from "./Footer";
import { useChat } from "@/hooks/useChat";
import { getCategoryById } from "@/config/knowledgeBase";

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const { messages, isLoading, error, sendMessage, retryLastMessage, clearMessages } = useChat();

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    
    const category = getCategoryById(categoryId);
    const message = category?.question || `Tell me about ${categoryId}`;
    sendMessage(message);
  };

  const handleClearChat = () => {
    clearMessages();
    setActiveCategoryId(null);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header
        onClearChat={handleClearChat}
        onToggleSidebar={() => setDrawerOpen(true)}
        hasMessages={messages.length > 0}
      />

      <div className="flex flex-1 overflow-hidden">
        <CategorySidebar 
          onCategoryClick={handleCategoryClick}
          activeCategoryId={activeCategoryId}
        />

        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden">
            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              error={error}
              onSendMessage={sendMessage}
              onRetry={retryLastMessage}
              activeCategoryId={activeCategoryId}
            />
          </div>
          <Footer />
        </main>
      </div>

      <CategoryDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onCategoryClick={handleCategoryClick}
        activeCategoryId={activeCategoryId}
      />
    </div>
  );
}
