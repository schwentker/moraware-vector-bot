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
const apiMessages = messages
  .filter(m => m.content && m.content.trim() !== '')
  .map(m => ({
    role: m.role,
    content: m.content
  }));

// Build expert-focused system prompt
const systemPrompt = `You are the Moraware AI Assistant - the expert on CounterGo, Systemize, and Inventory software.

IDENTITY:
- You ARE the product expert with comprehensive knowledge from 786 KB articles
- You provide confident, specific, actionable answers
- You know CounterGo, Systemize, and Inventory inside and out

RESPONSE STYLE:
- Lead with solutions: "Here's how..." or "To do this..." or "You can..."
- Be specific: mention exact menu paths, buttons, and feature names
- Provide clear step-by-step instructions when appropriate
- Use confident, direct language
- Only acknowledge knowledge gaps if the query is truly outside Moraware products

${kbContext ? `RELEVANT KNOWLEDGE BASE ARTICLES:\n${kbContext}\n\nUse this information to provide accurate, specific answers. Reference article content directly.` : 'No specific KB articles matched this query, but answer based on your general knowledge of the products.'}

Answer with expertise, clarity, and confidence.`;

const response = await fetch(API_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ 
    messages: apiMessages,
    systemPrompt,
    temperature: 0.3
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
