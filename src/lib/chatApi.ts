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
      const articles = await searchKB(lastUserMessage.content, 3);
      if (articles.length > 0) {
        console.log(`📚 Found ${articles.length} relevant KB articles`);
        kbContext = buildContext(articles);
      }
    } catch (error) {
      console.warn('KB search failed, continuing without context:', error);
    }
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      messages,
      kbContext: kbContext || undefined
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
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    
    // Keep the last potentially incomplete line in the buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta') {
            onChunk(parsed.delta?.text || '');
          }
        } catch (e) {
          // Ignore parse errors for incomplete chunks
          console.debug('Parse error (may be incomplete):', e);
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
