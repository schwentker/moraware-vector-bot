import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card px-4 py-3">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <span>Powered by Claude</span>
        <a
          href="https://help.countergo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          Full Knowledge Base
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </footer>
  );
}
