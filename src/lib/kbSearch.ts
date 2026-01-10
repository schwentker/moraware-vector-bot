// KB Search Module for CounterGo Chatbot
import { vectorSearch } from './vectorSearch';

const USE_VECTOR = import.meta.env.VITE_USE_VECTOR === 'true';

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
 * Simple keyword-based search through KB articles with product filtering
 */
export async function searchKB(query: string, maxResults = 10): Promise<Article[]> {
  if (USE_VECTOR) {
    console.log('🔍 Using vector search (Supabase)');
    return await vectorSearch(query, maxResults);
  }

  console.log('🔍 Using keyword search');
  const kb = await loadKB();
  const queryLower = query.toLowerCase();
  
  // Detect product mention for filtering
  let productFilter: string | null = null;
  
  if (queryLower.includes('systemize')) {
    productFilter = 'systemize';
  } else if (queryLower.includes('inventory')) {
    productFilter = 'inventory';
  } else if (queryLower.includes('countergo')) {
    productFilter = 'countergo';
  }
  
  // Filter articles by product if mentioned
  let articlesToSearch = kb.articles;
  if (productFilter) {
    articlesToSearch = kb.articles.filter(article => 
      article.url.toLowerCase().includes(productFilter) ||
      article.category.toLowerCase().includes(productFilter)
    );
    console.log(`🎯 Filtered to ${articlesToSearch.length} ${productFilter} articles`);
  }
  
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
  
  if (keywords.length === 0) return [];
  
  const scored = articlesToSearch.map(article => {
    let score = 0;
    const titleLower = article.title.toLowerCase();
    const contentLower = article.content.toLowerCase();
    const categoryLower = article.category.toLowerCase();
    
    keywords.forEach(kw => {
  // Exact match in title is high priority
  if (titleLower === kw) score += 50;
  // Word start match in title (e.g. "Print" matches "Printing")
  if (titleLower.includes(kw)) score += 20;
  
  // Content matches: prioritize density
  const regex = new RegExp(`\\b${kw}\\b`, 'gi');
  const matches = (contentLower.match(regex) || []).length;
  score += Math.min(matches, 10); // Cap content contribution
});
const actionWords = keywords.filter(k => !['systemize', 'countergo', 'inventory'].includes(k));
actionWords.forEach(aw => {
  if (titleLower.includes(aw)) score += 30;
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