import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { categories } from "./CategorySidebar";

interface CategoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryClick?: (categoryId: string) => void;
}

export function CategoryDrawer({
  open,
  onOpenChange,
  onCategoryClick,
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
                  className="w-full h-auto flex-col gap-2 py-4 hover:bg-secondary"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <category.icon className="h-5 w-5 text-primary" />
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
