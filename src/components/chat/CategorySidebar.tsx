import {
  Rocket,
  PlayCircle,
  Sparkles,
  PenTool,
  FileText,
  ShoppingCart,
  DollarSign,
  Printer,
  Eye,
  Link,
  Settings,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const categories = [
  { id: "get-started", label: "Get Started", icon: Rocket },
  { id: "how-to-videos", label: "How-To Videos", icon: PlayCircle },
  { id: "whats-new", label: "What's New", icon: Sparkles },
  { id: "drawing", label: "Drawing", icon: PenTool },
  { id: "quoting", label: "Quoting", icon: FileText },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "price-lists", label: "Price Lists", icon: DollarSign },
  { id: "printing-emailing", label: "Printing & Emailing", icon: Printer },
  { id: "sample-views", label: "Sample Views", icon: Eye },
  { id: "connect-systemize", label: "Connect to Systemize", icon: Link },
  { id: "manage-account", label: "Manage Account", icon: Settings },
  { id: "quickbooks", label: "QuickBooks Integration", icon: Calculator },
];

interface CategorySidebarProps {
  onCategoryClick?: (categoryId: string) => void;
  className?: string;
}

export function CategorySidebar({ onCategoryClick, className }: CategorySidebarProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex w-64 flex-col border-r bg-card",
        className
      )}
    >
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Help Categories
        </h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {categories.map((category) => (
            <li key={category.id}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-left font-normal hover:bg-secondary"
                onClick={() => onCategoryClick?.(category.id)}
              >
                <category.icon className="h-4 w-4 text-muted-foreground" />
                <span>{category.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export { categories };
