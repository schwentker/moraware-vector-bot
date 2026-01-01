import { searchKB, buildContext } from './kbSearch';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '/api/chat';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessage(
  messages: ChatMessage[],
  onChunk: (text: string) => void
): Promise<void> {
  // Get the last user message for KB search
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  let kbContext = '';
  
  if (lastUserMessage) {
    try {
      const articles = await searchKB(lastUserMessage.content, 10);
      if (articles.length > 0) {
        console.log(`📚 Found ${articles.length} relevant KB articles`);
        kbContext = buildContext(articles);
      }
    } catch (error) {
      console.warn('KB search failed, continuing without context:', error);
    }
  }

  const apiMessages = messages
    .filter(m => m.content && m.content.trim() !== '')
    .map(m => ({
      role: m.role,
      content: m.content
    }));

  // CRITICAL FIX: Inject KB context into user's LAST message
  // This ensures Claude sees it even if Worker drops systemPrompt
  const lastMessageIndex = apiMessages.length - 1;
  if (kbContext && lastMessageIndex >= 0 && apiMessages[lastMessageIndex].role === 'user') {
    const originalQuestion = apiMessages[lastMessageIndex].content;
    apiMessages[lastMessageIndex].content = `Use ONLY these Moraware KB articles to answer. NO generic tutorials, NO numbered lists, NO headers.

${kbContext}

USER QUESTION: ${originalQuestion}

ANSWER RULES: 2-4 sentences max. KB content only. No Step 1/Step 2. No "##" headers.`;
  }

  const systemPrompt = `You are the Moraware AI Assistant - product specialist for CounterGo, Systemize, and Inventory software.

CORE RULES:
- Use ONLY the KB articles provided in the user message
- NO numbered lists, NO headers (##), NO tutorial format
- 2-4 sentences maximum unless complexity requires more
- If KB doesn't have info, say: "Moraware documentation doesn't cover this. Contact support at support.moraware.com"
- Compressed prose only

Answer with KB-backed specificity and compressed clarity.`;

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      messages: apiMessages,
      system: systemPrompt,
      temperature: 0
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('429: Rate limit reached. Please try again in a moment.');
    }
    throw new Error(`API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error('No response body');

  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    console.log('Stream chunk received:', decoder.decode(value));
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    
    // Keep the last potentially incomplete line in the buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

      if (trimmedLine.startsWith('data: ')) {
        try {
          const jsonString = trimmedLine.slice(6);
          const parsed = JSON.parse(jsonString);
          console.log('Parsed event:', parsed);
          
          // Anthropic format: look for content_block_delta
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            onChunk(parsed.delta.text);
          }
        } catch (e) {
          console.error('Error parsing SSE data:', e);
        }
      }
    }
  }

  // Process any remaining buffer
  if (buffer.startsWith('data: ')) {
    const data = buffer.slice(6).trim();
    if (data && data !== '[DONE]') {
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'content_block_delta') {
          onChunk(parsed.delta?.text || '');
        }
      } catch (e) {
        console.debug('Final buffer parse error:', e);
      }
    }
  }
}