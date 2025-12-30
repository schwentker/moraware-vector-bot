import { useState } from "react";
import { Bot, Plus } from "lucide-react";
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
  hasMessages: boolean;
}

export function Header({ onClearChat, hasMessages }: HeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClear = () => {
    onClearChat();
    setDialogOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card" role="banner">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Moraware</span>
              </div>
              <h1 className="text-lg font-semibold leading-tight">CounterGo AI Assistant</h1>
              <p className="text-xs text-muted-foreground/70 hidden sm:block">
                Powered by Moraware AI • Supports CounterGo, Systemize & Inventory
              </p>
            </div>
          </div>
        </div>
        
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Start new chat"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start new conversation?</AlertDialogTitle>
              <AlertDialogDescription>
                {hasMessages 
                  ? "This will clear your current conversation and start fresh. This action cannot be undone."
                  : "Start a fresh conversation with the AI assistant."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClear}>
                New Chat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
