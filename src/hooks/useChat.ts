import { useState, useEffect, useCallback } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const STORAGE_KEY = "countergo-chat-messages";

const generateId = () => Math.random().toString(36).substring(2, 9);

const mockResponses: Record<string, string> = {
  "how do i create a new quote?":
    "To create a new quote in CounterGo:\n\n1. Click the **New Quote** button in the top toolbar\n2. Enter the customer information\n3. Add line items for your countertop pieces\n4. Use the drawing tools to sketch the layout\n5. Review pricing and save your quote\n\nWould you like more details on any of these steps?",
  "how do i connect to systemize?":
    "To connect CounterGo to Systemize:\n\n1. Go to **Settings** > **Integrations**\n2. Click on **Systemize Connection**\n3. Enter your Systemize API credentials\n4. Click **Test Connection** to verify\n5. Enable sync options for orders and customers\n\nOnce connected, your quotes can be automatically synced to Systemize for production scheduling.",
  "how do i set up my price list?":
    "Setting up your price list in CounterGo:\n\n1. Navigate to **Settings** > **Price Lists**\n2. Click **Create New Price List** or edit an existing one\n3. Add materials with their costs per square foot\n4. Set up edge profiles and their pricing\n5. Configure labor rates and markups\n6. Save and set as default if needed\n\nYou can create multiple price lists for different customer types or regions.",
  "how do i print or email quotes?":
    "To print or email quotes from CounterGo:\n\n**Printing:**\n1. Open the quote you want to print\n2. Click **File** > **Print** or use Ctrl+P\n3. Select your printer and preferences\n4. Click Print\n\n**Emailing:**\n1. Open the quote\n2. Click **Share** > **Email Quote**\n3. Enter the recipient's email address\n4. Customize the message if needed\n5. Click Send\n\nYou can also export as PDF for manual sharing.",
};

const getDefaultResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase().trim();

  for (const [key, response] of Object.entries(mockResponses)) {
    if (lowerMessage.includes(key) || key.includes(lowerMessage)) {
      return response;
    }
  }

  return `Thank you for your question about "${message}". I'm a mock assistant for now, but once connected to the API, I'll be able to provide detailed help with CounterGo features including:\n\n• Drawing and quoting\n• Price list management\n• Printing and emailing\n• Systemize integration\n• And much more!\n\nIs there something specific about CounterGo I can help you with?`;
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(
          parsed.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  }, []);

  // Save messages to localStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save chat history:", error);
      }
    }
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const assistantMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: getDefaultResponse(content),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}
