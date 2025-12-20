import { useState } from "react";
import { ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageFeedbackProps {
  messageId: string;
  articleUrl?: string;
}

export function MessageFeedback({ messageId, articleUrl }: MessageFeedbackProps) {
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(null);

  const handleFeedback = (type: "helpful" | "not-helpful") => {
    setFeedback(type);
    // In future: send feedback to analytics
    console.log(`Feedback for message ${messageId}:`, type);
  };

  if (feedback) {
    return (
      <div className="mt-2 text-xs text-muted-foreground">
        Thanks for your feedback!
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Was this helpful?</span>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-6 px-2 text-muted-foreground hover:text-primary",
          feedback === "helpful" && "text-primary"
        )}
        onClick={() => handleFeedback("helpful")}
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-6 px-2 text-muted-foreground hover:text-destructive",
          feedback === "not-helpful" && "text-destructive"
        )}
        onClick={() => handleFeedback("not-helpful")}
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
      {articleUrl && (
        <a
          href={articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Full article
        </a>
      )}
    </div>
  );
}
