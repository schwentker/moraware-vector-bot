import { useState } from "react";
import { Bot, Trash2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HeaderProps {
  onClearChat: () => void;
  onToggleSidebar?: () => void;
  hasMessages: boolean;
}

export function Header({ onClearChat, onToggleSidebar, hasMessages }: HeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClear = () => {
    onClearChat();
    setDialogOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card" role="banner">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden min-h-[44px] min-w-[44px]"
              onClick={onToggleSidebar}
              aria-label="Open help categories menu"
            >
              <Menu className="h-5 w-5" />
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
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-destructive min-h-[44px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Clear chat history"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Clear chat</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all messages in this conversation. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClear}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Clear chat
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </header>
  );
}
