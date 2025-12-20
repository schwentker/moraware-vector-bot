import { useState, useRef, useEffect, KeyboardEvent, useCallback } from "react";
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

  // Resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const lineHeight = 24;
      const maxHeight = lineHeight * MAX_ROWS;
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  }, [value]);

  const handleSubmit = useCallback(() => {
    if (value.trim() && !isLoading) {
      onSend(value);
      setValue("");
    }
  }, [value, isLoading, onSend]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  }, []);

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
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about CounterGo..."
              disabled={isLoading}
              className="min-h-[48px] max-h-[120px] resize-none pr-16 transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
              rows={1}
              aria-label="Type your message"
              aria-describedby="char-count input-help"
            />
            <div 
              id="char-count"
              className="absolute bottom-2 right-2 text-xs text-muted-foreground"
              aria-live="polite"
            >
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
            className="h-12 w-12 shrink-0 min-h-[44px] min-w-[44px] transition-transform active:scale-95"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
        <p id="input-help" className="mt-2 text-xs text-muted-foreground text-center">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
