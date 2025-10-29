/**
 * Scheduler tự động thu thập tin tức mỗi 60 phút
 */

import { scrapeAllNews } from './newsScraper';
import { saveArticle } from './db';

const INTERVAL_MS = 60 * 60 * 1000; // 60 phút

let schedulerInterval: NodeJS.Timeout | null = null;

async function collectAndSaveNews() {
  console.log('[NewsScheduler] Starting scheduled news collection...');
  const startTime = Date.now();
  
  try {
    const articles = await scrapeAllNews();
    
    let savedCount = 0;
    for (const article of articles) {
      const result = await saveArticle({
        title: article.title,
        url: article.url,
        source: article.source,
        publishedDate: article.publishedDate,
        relevanceScore: article.relevanceScore,
        matchedKeywords: article.matchedKeywords.join(', '),
        category: article.category,
        summary: article.summary,
        region: article.region,
        notified: 0
      });
      if (result) savedCount++;
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[NewsScheduler] Completed in ${duration}s: ${savedCount}/${articles.length} articles saved`);
  } catch (error) {
    console.error('[NewsScheduler] Error during collection:', error);
  }
}

/**
 * Khởi động scheduler
 */
export function startScheduler() {
  if (schedulerInterval) {
    console.log('[NewsScheduler] Already running');
    return;
  }
  
  console.log('[NewsScheduler] Starting scheduler (interval: 60 minutes)');
  
  // Chạy ngay lần đầu
  collectAndSaveNews();
  
  // Sau đó chạy mỗi 60 phút
  schedulerInterval = setInterval(collectAndSaveNews, INTERVAL_MS);
}

/**
 * Dừng scheduler
 */
export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[NewsScheduler] Stopped');
  }
}

