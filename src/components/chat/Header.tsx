import { Bot, Trash2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onClearChat: () => void;
  onToggleSidebar?: () => void;
  hasMessages: boolean;
}

export function Header({ onClearChat, onToggleSidebar, hasMessages }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onToggleSidebar}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold">CounterGo Assistant</h1>
          </div>
        </div>
        
        {hasMessages && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearChat}
            className="gap-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clear chat</span>
          </Button>
        )}
      </div>
    </header>
  );
}
