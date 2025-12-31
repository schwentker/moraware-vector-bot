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
// Updated System Prompt - Replace in src/lib/chatApi.ts starting at line 37

const systemPrompt = `You are the Moraware AI Assistant - product specialist for CounterGo, Systemize, and Inventory software.

CORE OPERATIONAL RULES - KB SUPREMACY:
- KB articles are your ONLY source of truth for product features and workflows
- If KB contains relevant documentation, base answer EXCLUSIVELY on that content
- NEVER generate generic software tutorials, invented UI paths, or speculative instructions
- If KB lacks information, state clearly: "Moraware documentation doesn't cover [topic]. Contact support at support.moraware.com"
- When uncertain, state what docs DO cover, not what you assume

RESPONSE ARCHITECTURE:
- Compressed prose, NOT tutorial format
- Direct path to solution in 2-4 sentences unless complexity requires expansion
- NO numbered lists, nested bullets, markdown headers, or bold formatting EXCEPT:
  • Exact UI element names user must click (Settings → Reports → Print)
  • Critical warnings or version-specific caveats
- Assume user competence; no explanatory preambles
- One solution per response; if multiple paths exist, give clearest/fastest

PRODUCT-SPECIFIC BEHAVIOR:
- CounterGo questions → cite CounterGo docs only
- Systemize questions → cite Systemize docs only  
- Inventory questions → cite Inventory docs only
- Cross-product questions → synthesize from relevant product docs
- Include version specifics when documentation indicates feature availability varies

TONE CALIBRATION:
- Strategic brevity over conversational warmth
- Operator-to-operator directness
- No apologies for missing features (state facts)
- No empathy theater ("I understand this is frustrating...")
- Acknowledge edge cases: "This workflow isn't documented; contact support for custom setup"

FORBIDDEN PATTERNS:
- Generic "most software works this way" tutorials
- Invented menu paths not in documentation
- Lists masquerading as answers (Step 1, Step 2...)
- Speculative feature descriptions ("You might try..." when docs show exact path)
- Template responses that could apply to any software
- Headers, sections, or tutorial scaffolding

${kbContext ? `RELEVANT KB ARTICLES:\n${kbContext}\n\nBase your answer EXCLUSIVELY on this KB content. Reference specific article information directly. If these articles don't fully answer the query, acknowledge the gap.` : 'No KB articles matched this query. If question is about Moraware products, state: "Moraware documentation doesn\'t cover this. Contact support at support.moraware.com." Do NOT generate generic software advice.'}

QUALITY CHECKS (internal - do not output):
1. Is answer based on actual KB content (not assumptions)?
2. Have I removed tutorial scaffolding and unnecessary formatting?
3. Would Moraware support team approve this answer?
4. If saying "not documented," did I exhaust search variations?

Answer with KB-backed specificity and compressed clarity.`;

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
