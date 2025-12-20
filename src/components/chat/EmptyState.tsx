import { Bot, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSuggestionsForCategory } from "@/config/knowledgeBase";

interface EmptyStateProps {
  onSuggestionClick: (question: string) => void;
  activeCategoryId?: string | null;
}

export function EmptyState({ onSuggestionClick, activeCategoryId }: EmptyStateProps) {
  const suggestions = getSuggestionsForCategory(activeCategoryId || null);

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Bot className="h-8 w-8 text-primary" />
      </div>
      
      <h2 className="mb-2 text-2xl font-semibold">
        Welcome to CounterGo Assistant
      </h2>
      
      <p className="mb-8 max-w-md text-muted-foreground">
        Ask me anything about CounterGo. I can help you with drawing, quoting,
        pricing, integrations, and more.
      </p>

      <div className="w-full max-w-lg">
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          <MessageCircle className="mr-2 inline-block h-4 w-4" />
          Try asking:
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {suggestions.map((question) => (
            <Button
              key={question}
              variant="outline"
              className="h-auto whitespace-normal py-3 text-left text-sm hover:bg-secondary"
              onClick={() => onSuggestionClick(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
