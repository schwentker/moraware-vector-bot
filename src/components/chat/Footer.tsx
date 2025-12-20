import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card px-4 py-3" role="contentinfo">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <span>Powered by Claude</span>
        <a
          href="https://countergohelp.moraware.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 min-h-[44px] min-w-[44px] justify-center hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md px-2"
          aria-label="Open full knowledge base in new tab"
        >
          Full Knowledge Base
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
