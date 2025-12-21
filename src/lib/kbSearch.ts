// KB Search Module for CounterGo Chatbot

export interface Article {
  id: string;
  url: string;
  title: string;
  category: string;
  content: string;
  word_count: number;
  scraped_at: string;
}

export interface KBData {
  scraped_at: string;
  total_articles: number;
  categories: string[];
  articles: Article[];
}

let kbData: KBData | null = null;

/**
 * Load KB data once and cache it
 */
export async function loadKB(): Promise<KBData> {
  if (kbData) return kbData;
  
  try {
    const response = await fetch(import.meta.env.BASE_URL + 'kb-data.json');
    if (!response.ok) {
      throw new Error(`Failed to load KB: ${response.status}`);
    }
    kbData = await response.json();
    console.log(`✅ Loaded ${kbData!.total_articles} KB articles`);
    return kbData!;
  } catch (error) {
    console.error('Failed to load KB:', error);
    throw error;
  }
}

/**
 * Simple keyword-based search through KB articles
 */
export async function searchKB(query: string, maxResults = 3): Promise<Article[]> {
  const kb = await loadKB();
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
  
  if (keywords.length === 0) return [];
  
  const scored = kb.articles.map(article => {
    let score = 0;
    const titleLower = article.title.toLowerCase();
    const contentLower = article.content.toLowerCase();
    const categoryLower = article.category.toLowerCase();
    
    keywords.forEach(kw => {
      if (titleLower.includes(kw)) score += 5;
      if (categoryLower.includes(kw)) score += 3;
      const contentMatches = (contentLower.match(new RegExp(kw, 'g')) || []).length;
      score += Math.min(contentMatches, 3);
    });
    
    return { article, score };
  });
  
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.article);
}

/**
 * Build context string for Claude from search results
 */
export function buildContext(articles: Article[]): string {
  if (articles.length === 0) return '';
  
  return articles.map((article, idx) => {
    const preview = article.content.substring(0, 1000);
    return `[Source ${idx + 1}: ${article.title}]
Category: ${article.category}
${preview}${preview.length < article.content.length ? '...' : ''}
URL: ${article.url}`;
  }).join('\n\n---\n\n');
}
