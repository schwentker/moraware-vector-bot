import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { categories } from "@/config/knowledgeBase";

interface CategorySidebarProps {
  onCategoryClick?: (categoryId: string) => void;
  activeCategoryId?: string | null;
  className?: string;
}

export function CategorySidebar({ 
  onCategoryClick, 
  activeCategoryId,
  className 
}: CategorySidebarProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex w-64 flex-col border-r bg-card",
        className
      )}
      role="navigation"
      aria-label="Help categories"
    >
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Help Categories
        </h2>
      </div>
      <nav className="flex-1 overflow-y-auto chat-scrollbar p-2">
        <ul className="space-y-1" role="list">
          {categories.map((category) => (
            <li key={category.id}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-left font-normal min-h-[44px] transition-all duration-200",
                  "hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  activeCategoryId === category.id && "bg-secondary text-primary"
                )}
                onClick={() => onCategoryClick?.(category.id)}
                aria-current={activeCategoryId === category.id ? "true" : undefined}
              >
                <category.icon className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  activeCategoryId === category.id ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="truncate">{category.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
