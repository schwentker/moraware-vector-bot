import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_CHARS = 500;
const MAX_ROWS = 4;

interface MessageInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export function MessageInput({ onSend, isLoading, initialValue = "" }: MessageInputProps) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialValue) {
      setValue(initialValue);
      textareaRef.current?.focus();
    }
  }, [initialValue]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const lineHeight = 24;
      const maxHeight = lineHeight * MAX_ROWS;
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if (value.trim() && !isLoading) {
      onSend(value);
      setValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = value.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSend = value.trim().length > 0 && !isLoading && !isOverLimit;

  return (
    <div className="border-t bg-card p-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about CounterGo..."
              disabled={isLoading}
              className="min-h-[48px] max-h-[120px] resize-none pr-12"
              rows={1}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              <span className={isOverLimit ? "text-destructive font-medium" : ""}>
                {charCount}
              </span>
              /{MAX_CHARS}
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!canSend}
            size="icon"
            className="h-12 w-12 shrink-0"
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-center">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
