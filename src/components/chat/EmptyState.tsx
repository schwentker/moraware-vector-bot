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
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 animate-scale-in">
        <Bot className="h-8 w-8 text-primary" aria-hidden="true" />
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
          <MessageCircle className="mr-2 inline-block h-4 w-4" aria-hidden="true" />
          Try asking:
        </p>
        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Suggested questions">
          {suggestions.map((question, index) => (
            <Button
              key={question}
              variant="outline"
              className="h-auto whitespace-normal py-3 px-4 text-left text-sm min-h-[44px] transition-all duration-200 hover:bg-secondary hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => onSuggestionClick(question)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {question}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
