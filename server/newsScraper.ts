/**
 * Module thu thập tin tức từ RSS feeds
 */

import { NEWS_SOURCES, KEYWORDS_BY_REGION, categorizeByKeywords, getRegionFromSource, type NewsSource } from './newsConfig';

export interface ScrapedArticle {
  title: string;
  url: string;
  source: string;
  publishedDate: Date | null;
  relevanceScore: number;
  matchedKeywords: string[];
  category: string;
  summary: string;
  region: string;
}

/**
 * Decode HTML entities to readable text
 */
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&#x27;': "'",
    '&#x2F;': '/',
    '&nbsp;': ' ',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '…',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&lsquo;': "'",
    '&rsquo;': "'",
  };
  
  let decoded = text;
  
  // Replace named entities
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  }
  
  // Replace numeric entities (&#123; or &#xAB;)
  decoded = decoded.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  
  return decoded;
}

/**
 * Clean text by removing HTML tags and extra whitespace
 */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')  // Remove HTML tags
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .trim();
}

/**
 * Parse RSS feed và trả về danh sách bài viết
 */
async function parseRSSFeed(rssUrl: string, sourceName: string): Promise<ScrapedArticle[]> {
  try {
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.error(`[NewsScraper] Failed to fetch RSS from ${sourceName}: ${response.status}`);
      return [];
    }
    
    const xmlText = await response.text();
    
    // Parse XML đơn giản (không dùng thư viện ngoài)
    const articles: ScrapedArticle[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i;
    const linkRegex = /<link><!\[CDATA\[(.*?)\]\]><\/link>|<link>(.*?)<\/link>/i;
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/i;
    const descRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/i;
    
    let match;
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = match[1];
      
      const titleMatch = titleRegex.exec(itemXml);
      const linkMatch = linkRegex.exec(itemXml);
      const pubDateMatch = pubDateRegex.exec(itemXml);
      const descMatch = descRegex.exec(itemXml);
      
      // Extract and clean text
      let title = (titleMatch?.[1] || titleMatch?.[2] || '').trim();
      let url = (linkMatch?.[1] || linkMatch?.[2] || '').trim();
      const pubDateStr = pubDateMatch?.[1]?.trim();
      let description = (descMatch?.[1] || descMatch?.[2] || '').trim();
      
      // Decode HTML entities
      title = decodeHTMLEntities(title);
      description = decodeHTMLEntities(description);
      
      // Clean HTML tags from description
      description = cleanText(description);
      
      if (!title || !url) continue;
      
      // Parse date
      let publishedDate: Date | null = null;
      if (pubDateStr) {
        try {
          publishedDate = new Date(pubDateStr);
          if (isNaN(publishedDate.getTime())) {
            publishedDate = null;
          }
        } catch {
          publishedDate = null;
        }
      }
      
      // Xác định khu vực dựa trên nguồn tin
      const articleRegion = getRegionFromSource(sourceName);
      const regionKeywords = KEYWORDS_BY_REGION[articleRegion] || [];
      
      // Filter by keywords
      const textToSearch = `${title} ${description}`.toLowerCase();
      const matchedKeywords: string[] = [];
      let relevanceScore = 0;
      
      for (const keyword of regionKeywords) {
        if (textToSearch.includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword);
          relevanceScore++;
        }
      }
      
      // Chỉ lấy bài viết có từ khóa liên quan
      if (relevanceScore > 0) {
        const category = categorizeByKeywords(matchedKeywords, articleRegion);
        
        const newArticle = {
          title,
          url,
          source: sourceName,
          publishedDate,
          relevanceScore,
          matchedKeywords,
          category,
          summary: description.substring(0, 500), // Limit summary length
          region: articleRegion
        };
        
        // Debug: log article region
        console.log(`[NewsScraper] Created article: source=${sourceName}, region=${newArticle.region}, title=${title.substring(0, 50)}...`);
        
        articles.push(newArticle);
      }
    }
    
    return articles;
  } catch (error) {
    console.error(`[NewsScraper] Error parsing RSS from ${sourceName}:`, error);
    return [];
  }
}

/**
 * Thu thập tin tức từ tất cả các nguồn
 */
export async function scrapeAllNews(): Promise<ScrapedArticle[]> {
  console.log('[NewsScraper] Starting news collection...');
  
  const allArticles: ScrapedArticle[] = [];
  
  for (const source of NEWS_SOURCES) {
    if (!source.rss) {
      console.log(`[NewsScraper] Skipping ${source.name} (no RSS feed)`);
      continue;
    }
    
    console.log(`[NewsScraper] Fetching from ${source.name}...`);
    const articles = await parseRSSFeed(source.rss, source.name);
    console.log(`[NewsScraper] Found ${articles.length} relevant articles from ${source.name}`);
    allArticles.push(...articles);
  }
  
  console.log(`[NewsScraper] Total collected: ${allArticles.length} articles`);
  return allArticles;
}

