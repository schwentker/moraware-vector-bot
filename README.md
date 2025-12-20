# CounterGo Help Chatbot

A modern, responsive help chatbot for CounterGo - Moraware's quoting and drawing software for countertop fabricators.

## Features

- 💬 **Real-time Chat** - Stream responses from Claude AI
- 📚 **Knowledge Base Integration** - 12 categorized help topics
- 🎨 **Moraware Branded** - Custom theme with brand colors
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- ♿ **Accessible** - ARIA labels, keyboard navigation, focus states
- 💾 **Persistent History** - Chat saved to localStorage
- 🔄 **Error Recovery** - Retry failed messages, clear error handling

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **UI Components**: shadcn/ui
- **AI**: Claude API (via Cloudflare Worker)
- **Deployment**: Cloudflare Pages

## Environment Variables

### Frontend (Lovable/.env.local)

```env
# URL to your Cloudflare Worker API
VITE_API_ENDPOINT=https://your-worker.your-subdomain.workers.dev/api/chat
```

### Backend (Cloudflare Worker)

```env
# Your Anthropic API key
ANTHROPIC_API_KEY=sk-ant-api03-...
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to Cloudflare Pages

### 1. Connect Repository

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Workers & Pages** > **Create application** > **Pages**
3. Connect your GitHub repository
4. Select the repository containing this project

### 2. Configure Build Settings

| Setting | Value |
|---------|-------|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (or subdirectory if applicable) |

### 3. Set Environment Variables

In Cloudflare Pages settings, add:

| Variable | Value |
|----------|-------|
| `VITE_API_ENDPOINT` | `https://your-worker.workers.dev/api/chat` |

### 4. Deploy

Click **Save and Deploy**. Your site will be available at `your-project.pages.dev`.

## Cloudflare Worker Setup

Your Cloudflare Worker should:

1. Accept POST requests with `{ messages: [...] }`
2. Forward to Anthropic API with streaming
3. Return SSE stream with `content_block_delta` events

### Worker Environment Variables

Set in Cloudflare Dashboard > Workers > your-worker > Settings > Variables:

| Variable | Value |
|----------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

### Worker System Prompt

The worker should include this system prompt:

```
You are a helpful assistant for Moraware CounterGo, a quoting & drawing software for countertop fabricators. Answer questions about:
- Get Started & setup
- Drawing countertop layouts
- Creating quotes & orders
- Managing price lists
- Printing & emailing
- Integration with Systemize & QuickBooks
- Account management

Be concise, friendly & technical when needed. Reference specific features.
If unsure, suggest contacting support@moraware.com or visiting countergohelp.moraware.com.
```

## Project Structure

```
src/
├── components/
│   ├── chat/
│   │   ├── AppLayout.tsx      # Main layout orchestrator
│   │   ├── Header.tsx         # Top header with clear chat
│   │   ├── CategorySidebar.tsx # Desktop category nav
│   │   ├── CategoryDrawer.tsx  # Mobile category nav
│   │   ├── ChatContainer.tsx   # Chat area wrapper
│   │   ├── MessageList.tsx     # Message display
│   │   ├── MessageInput.tsx    # Input textarea
│   │   ├── MessageFeedback.tsx # Helpful? buttons
│   │   ├── EmptyState.tsx      # Welcome + suggestions
│   │   └── Footer.tsx          # Footer with KB link
│   └── ui/                     # shadcn components
├── config/
│   └── knowledgeBase.ts        # Categories & suggestions
├── hooks/
│   └── useChat.ts              # Chat state management
├── lib/
│   └── chatApi.ts              # API client with streaming
└── pages/
    └── Index.tsx               # Main page
```

## Customization

### Adding Categories

Edit `src/config/knowledgeBase.ts`:

```typescript
{
  id: "new-category",
  label: "New Category",
  icon: SomeIcon,
  question: "Default question for this category?",
  description: "Category description",
  suggestions: [
    "Suggestion 1?",
    "Suggestion 2?",
    // ...
  ],
  articleUrl: "https://help.example.com/category",
}
```

### Theming

Edit `src/index.css` to modify CSS variables:

```css
:root {
  --primary: 224 76% 40%;      /* Main brand color */
  --accent: 217 91% 60%;       /* Secondary color */
  --chat-user-bg: 224 76% 40%; /* User message bubble */
  /* ... */
}
```

## Testing Checklist

- [ ] Desktop layout (1024px+)
- [ ] Tablet layout (768px-1023px)
- [ ] Mobile layout (<768px)
- [ ] Mobile Safari
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Dark mode (if enabled)
- [ ] Error states (network offline, API errors)
- [ ] Rate limiting (429 responses)
- [ ] Chat history persistence

## Support

For CounterGo support: support@moraware.com

For chatbot development: [Lovable](https://lovable.dev)
