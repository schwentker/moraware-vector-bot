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
  LucideIcon,
} from "lucide-react";

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  question: string;
  description: string;
  suggestions: string[];
  articleUrl?: string;
}

export const categories: Category[] = [
  {
    id: "get-started",
    label: "Get Started",
    icon: Rocket,
    question: "How do I get started with CounterGo?",
    description: "Initial setup, account creation, first steps",
    suggestions: [
      "How do I create my first quote?",
      "What are the system requirements for CounterGo?",
      "How do I set up my company profile?",
      "Can I import existing customer data?",
    ],
    articleUrl: "https://countergohelp.moraware.com/getting-started",
  },
  {
    id: "how-to-videos",
    label: "How-To Videos",
    icon: PlayCircle,
    question: "Where can I find how-to videos for CounterGo?",
    description: "Video tutorials and walkthroughs",
    suggestions: [
      "Are there beginner tutorial videos?",
      "Where can I watch drawing tutorials?",
      "Do you have videos on quoting?",
      "Are there advanced training videos?",
    ],
    articleUrl: "https://countergohelp.moraware.com/videos",
  },
  {
    id: "whats-new",
    label: "What's New",
    icon: Sparkles,
    question: "What's new in the latest CounterGo update?",
    description: "Recent updates and new features",
    suggestions: [
      "What features were added recently?",
      "Are there any upcoming features?",
      "How do I enable new features?",
      "Where can I see the changelog?",
    ],
    articleUrl: "https://countergohelp.moraware.com/whats-new",
  },
  {
    id: "drawing",
    label: "Drawing",
    icon: PenTool,
    question: "How do I use the drawing tools in CounterGo?",
    description: "Layout tools, measurements, shapes",
    suggestions: [
      "How do I draw a countertop with a sink cutout?",
      "How do I add measurements to my drawing?",
      "Can I import a floor plan image?",
      "How do I create curved edges?",
    ],
    articleUrl: "https://countergohelp.moraware.com/drawing",
  },
  {
    id: "quoting",
    label: "Quoting",
    icon: FileText,
    question: "How do I create and manage quotes?",
    description: "Price calculation, templates, discounts",
    suggestions: [
      "How do I apply discounts to a quote?",
      "Can I create quote templates?",
      "How do I add labor costs?",
      "How do I duplicate an existing quote?",
    ],
    articleUrl: "https://countergohelp.moraware.com/quoting",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCart,
    question: "How do I manage orders in CounterGo?",
    description: "Order management, tracking, status",
    suggestions: [
      "How do I convert a quote to an order?",
      "How do I track order status?",
      "Can I edit an order after creation?",
      "How do I cancel an order?",
    ],
    articleUrl: "https://countergohelp.moraware.com/orders",
  },
  {
    id: "price-lists",
    label: "Price Lists",
    icon: DollarSign,
    question: "How do I set up my price list?",
    description: "Material pricing, labor rates, markups",
    suggestions: [
      "How do I add new materials to my price list?",
      "Can I have different price lists for different customers?",
      "How do I set up edge profile pricing?",
      "How do I apply markups to materials?",
    ],
    articleUrl: "https://countergohelp.moraware.com/price-lists",
  },
  {
    id: "printing-emailing",
    label: "Printing & Emailing",
    icon: Printer,
    question: "How do I print or email quotes?",
    description: "Output formats, templates, sharing",
    suggestions: [
      "Can I customize the quote PDF template?",
      "How do I email a quote to a customer?",
      "What print formats are supported?",
      "Can I include drawings in the email?",
    ],
    articleUrl: "https://countergohelp.moraware.com/printing",
  },
  {
    id: "sample-views",
    label: "Sample Views",
    icon: Eye,
    question: "What are sample views and how do I use them?",
    description: "Visual examples and templates",
    suggestions: [
      "How do I view sample layouts?",
      "Can I use samples as templates?",
      "Are there industry-specific samples?",
      "How do I share sample views?",
    ],
    articleUrl: "https://countergohelp.moraware.com/samples",
  },
  {
    id: "connect-systemize",
    label: "Connect to Systemize",
    icon: Link,
    question: "How do I connect to Systemize?",
    description: "Job management sync, integration",
    suggestions: [
      "What data syncs between CounterGo and Systemize?",
      "How do I troubleshoot sync issues?",
      "Can I sync existing orders?",
      "How often does data sync?",
    ],
    articleUrl: "https://countergohelp.moraware.com/systemize",
  },
  {
    id: "manage-account",
    label: "Manage Account",
    icon: Settings,
    question: "How do I manage my CounterGo account?",
    description: "Users, permissions, billing",
    suggestions: [
      "How do I add new users?",
      "How do I reset my password?",
      "How do I update billing information?",
      "Can I set user permissions?",
    ],
    articleUrl: "https://countergohelp.moraware.com/account",
  },
  {
    id: "quickbooks",
    label: "QuickBooks Integration",
    icon: Calculator,
    question: "How do I set up QuickBooks integration?",
    description: "Accounting integration, invoicing",
    suggestions: [
      "Which QuickBooks versions are supported?",
      "How do I sync invoices to QuickBooks?",
      "Can I import customers from QuickBooks?",
      "How do I troubleshoot QuickBooks sync?",
    ],
    articleUrl: "https://countergohelp.moraware.com/quickbooks",
  },
];

// Default suggestions shown in empty state
export const defaultSuggestions = [
  "How do I create a new quote?",
  "How do I connect to Systemize?",
  "How do I set up my price list?",
  "How do I print or email quotes?",
];

// Get category by ID
export const getCategoryById = (id: string): Category | undefined => {
  return categories.find((cat) => cat.id === id);
};

// Get suggestions for a category, or default if not found
export const getSuggestionsForCategory = (categoryId: string | null): string[] => {
  if (!categoryId) return defaultSuggestions;
  const category = getCategoryById(categoryId);
  return category?.suggestions || defaultSuggestions;
};

// System prompt context for the knowledge base
export const knowledgeBaseContext = `
CounterGo has these main sections:
1. Get Started: Initial setup, account creation, first steps
2. How-To Videos: Video tutorials and walkthroughs  
3. What's New: Recent updates and new features
4. Drawing: Layout tools, measurements, shapes, sink cutouts
5. Quoting: Price calculation, templates, discounts, labor costs
6. Orders: Order management, tracking, status updates
7. Price Lists: Material pricing, labor rates, markups
8. Printing & Emailing: Output formats, PDF templates, sharing
9. Sample Views: Visual examples and layout templates
10. Systemize Integration: Job management sync, data flow
11. Account Management: Users, permissions, billing
12. QuickBooks Integration: Accounting sync, invoicing

Reference specific sections when relevant. If a topic maps to a section, mention where users can find more detailed help.
`;
