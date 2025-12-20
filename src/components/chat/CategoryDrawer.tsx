import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { categories } from "@/config/knowledgeBase";
import { cn } from "@/lib/utils";

interface CategoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryClick?: (categoryId: string) => void;
  activeCategoryId?: string | null;
}

export function CategoryDrawer({
  open,
  onOpenChange,
  onCategoryClick,
  activeCategoryId,
}: CategoryDrawerProps) {
  const handleCategoryClick = (categoryId: string) => {
    onCategoryClick?.(categoryId);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle>Help Categories</DrawerTitle>
        </DrawerHeader>
        <nav className="overflow-y-auto p-4">
          <ul className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-auto flex-col gap-2 py-4 hover:bg-secondary",
                    activeCategoryId === category.id && "border-primary bg-secondary"
                  )}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <category.icon className={cn(
                    "h-5 w-5",
                    activeCategoryId === category.id ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="text-xs text-center">{category.label}</span>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
