import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getAllArticles, getArticlesByCategory, getArticleStats, saveArticle, updateArticleSummary, getAllDailySummaries, saveDailySummary, getArticlesByDateAndRegion, getDailySummariesByDateRange } from "./db";
import { scrapeAllNews } from './newsScraper';
import { getRegionFromSource } from './newsConfig';
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  news: router({
    // Lấy danh sách tin tức
    list: publicProcedure
      .input(z.object({
        limit: z.number().optional().default(100),
        category: z.string().optional()
      }))
      .query(async ({ input }) => {
        if (input.category) {
          return getArticlesByCategory(input.category, input.limit);
        }
        return getAllArticles(input.limit);
      }),
    
    // Lấy thống kê
    stats: publicProcedure.query(async () => {
      return getArticleStats();
    }),
    
    // Thu thập tin tức mới (chỉ admin)
    collect: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Only admin can trigger news collection');
      }
      
      console.log('[NewsRouter] Starting manual news collection...');
      const articles = await scrapeAllNews();
      
      let savedCount = 0;
      for (const article of articles) {
        // Gọi getRegionFromSource trực tiếp để tránh undefined
        const articleRegion = getRegionFromSource(article.source);
        
        // Debug log
        console.log(`[NewsRouter] Processing: source=${article.source}, region=${articleRegion}, article.region=${article.region}`);
        
        const result = await saveArticle({
          title: article.title,
          url: article.url,
          source: article.source,
          publishedDate: article.publishedDate,
          relevanceScore: article.relevanceScore,
          matchedKeywords: article.matchedKeywords.join(', '),
          category: article.category,
          summary: article.summary,
          region: articleRegion,
          notified: 0
        });
        if (result) savedCount++;
      }
      
      console.log(`[NewsRouter] Saved ${savedCount}/${articles.length} articles`);
      return { collected: articles.length, saved: savedCount };
    }),
    
    // Tóm tắt bài viết bằng AI
    summarize: publicProcedure
      .input(z.object({
        articleId: z.number(),
        articleUrl: z.string(),
        articleTitle: z.string()
      }))
      .mutation(async ({ input }) => {
        const { articleId, articleUrl, articleTitle } = input;
        
        try {
          // Fetch article content
          const response = await fetch(articleUrl);
          const html = await response.text();
          
          // Extract text content (simple extraction)
          const textContent = html
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<style[^>]*>.*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 3000); // Limit to 3000 chars
          
          // Use LLM to summarize
          const { invokeLLM } = await import('./_core/llm');
          const llmResponse = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: 'Bạn là trợ lý tóm tắt tin tức kinh tế. Hãy tóm tắt bài viết thành 2-3 câu ngắn gọn, súc tích bằng tiếng Việt, tập trung vào thông tin quan trọng nhất.'
              },
              {
                role: 'user',
                content: `Tiêu đề: ${articleTitle}\n\nNội dung:\n${textContent}\n\nHãy tóm tắt bài viết này.`
              }
            ]
          });
          
          const messageContent = llmResponse.choices[0]?.message?.content;
          const summary = typeof messageContent === 'string' ? messageContent : 'Không thể tạo tóm tắt';
          
          // Save to database
          await updateArticleSummary(articleId, summary);
          
          return { success: true, summary };
        } catch (error) {
          console.error('[NewsRouter] Error summarizing article:', error);
          throw new Error('Không thể tóm tắt bài viết');
        }
      })
  }),

  summary: router({
    // Lấy danh sách tóm tắt theo ngày
    list: publicProcedure
      .input(z.object({
        limit: z.number().optional().default(30),
        startDate: z.string().optional(),
        endDate: z.string().optional()
      }))
      .query(async ({ input }) => {
        if (input.startDate && input.endDate) {
          return getDailySummariesByDateRange(input.startDate, input.endDate);
        }
        return getAllDailySummaries(input.limit);
      }),
    
    // Tạo tóm tắt cho một ngày và region cụ thể
    generate: publicProcedure
      .input(z.object({
        date: z.string(), // Format: YYYY-MM-DD
        region: z.string()
      }))
      .mutation(async ({ input }) => {
        const { date, region } = input;
        
        try {
          // Lấy tất cả bài viết của ngày và region đó
          const articles = await getArticlesByDateAndRegion(date, region);
          
          if (articles.length === 0) {
            return { 
              success: false, 
              message: 'Không có bài viết nào cho ngày và region này' 
            };
          }
          
          // Tạo prompt cho LLM
          const articlesText = articles.map((a, idx) => 
            `${idx + 1}. ${a.title}\n   Nguồn: ${a.source}\n   Tóm tắt: ${a.summary || 'Không có'}\n`
          ).join('\n');
          
          const { invokeLLM } = await import('./_core/llm');
          const llmResponse = await invokeLLM({
            messages: [
              {
                role: 'system',
                content: `Bạn là chuyên gia phân tích tin tức tài chính. Nhiệm vụ của bạn là:
1. Tóm tắt các tin tức trong ngày thành 1-3 dòng ngắn gọn
2. Đánh giá tác động tổng thể đến thị trường chứng khoán
3. Trả về JSON với format: {"summary": "...", "sentiment": "positive|negative|neutral"}

Các tiêu chí đánh giá sentiment:
- positive: Tin tức có tác động tích cực đến thị trường (tăng trưởng, chính sách hỗ trợ, tin tốt về kinh tế)
- negative: Tin tức có tác động tiêu cực (suy thoái, lạm phát cao, chính sách thắt chặt, rủi ro)
- neutral: Tin tức không có tác động rõ ràng hoặc tác động trung lập`
              },
              {
                role: 'user',
                content: `Ngày: ${date}\nKhu vực: ${region}\nSố bài viết: ${articles.length}\n\nCác tin tức:\n${articlesText}\n\nHãy tóm tắt và đánh giá tác động đến thị trường chứng khoán.`
              }
            ]
          });
          
          const messageContent = llmResponse.choices[0]?.message?.content;
          if (!messageContent) {
            throw new Error('LLM không trả về kết quả');
          }
          
          // Parse JSON response
          let result;
          try {
            // Try to extract JSON from markdown code block if present
            const jsonMatch = messageContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                             messageContent.match(/```\s*([\s\S]*?)\s*```/);
            const jsonStr = jsonMatch ? jsonMatch[1] : messageContent;
            result = JSON.parse(jsonStr.trim());
          } catch (e) {
            // Fallback: treat as plain text
            result = {
              summary: messageContent,
              sentiment: 'neutral'
            };
          }
          
          // Lưu vào database
          await saveDailySummary({
            date,
            region,
            summary: result.summary,
            sentiment: result.sentiment,
            articleCount: articles.length
          });
          
          return { 
            success: true, 
            summary: result.summary,
            sentiment: result.sentiment,
            articleCount: articles.length
          };
        } catch (error) {
          console.error('[SummaryRouter] Error generating summary:', error);
          throw new Error('Không thể tạo tóm tắt');
        }
      }),
    
    // Tạo tóm tắt tự động cho tất cả các ngày gần đây
    generateAll: publicProcedure
      .input(z.object({
        days: z.number().optional().default(7)
      }))
      .mutation(async ({ input }) => {
        console.log('[generateAll] START - input:', input);
        const { days } = input;
        const results = [];
        
        // Tạo danh sách các ngày cần tóm tắt
        const dates = [];
        for (let i = 0; i < days; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dates.push(date.toISOString().split('T')[0]);
        }
        console.log('[generateAll] Dates to process:', dates);
        
        const regions = ['vietnam', 'us', 'china'];
        console.log('[generateAll] Regions:', regions);
        
        for (const date of dates) {
          for (const region of regions) {
            try {
              console.log(`[generateAll] Querying: date=${date}, region=${region}`);
              const articles = await getArticlesByDateAndRegion(date, region);
              console.log(`[generateAll] Found ${articles.length} articles for ${date} ${region}`);
              if (articles.length === 0) continue;
              
              // Generate summary using the same logic as generate endpoint
              const articlesText = articles.map((a, idx) => 
                `${idx + 1}. ${a.title}\n   Nguồn: ${a.source}\n   Tóm tắt: ${a.summary || 'Không có'}\n`
              ).join('\n');
              
              const { invokeLLM } = await import('./_core/llm');
              const llmResponse = await invokeLLM({
                messages: [
                  {
                    role: 'system',
                    content: `Bạn là chuyên gia phân tích tin tức tài chính. Nhiệm vụ của bạn là:
1. Tóm tắt các tin tức trong ngày thành 1-3 dòng ngắn gọn
2. Đánh giá tác động tổng thể đến thị trường chứng khoán
3. Trả về JSON với format: {"summary": "...", "sentiment": "positive|negative|neutral"}

Các tiêu chí đánh giá sentiment:
- positive: Tin tức có tác động tích cực đến thị trường (tăng trưởng, chính sách hỗ trợ, tin tốt về kinh tế)
- negative: Tin tức có tác động tiêu cực (suy thoái, lạm phát cao, chính sách thắt chặt, rủi ro)
- neutral: Tin tức không có tác động rõ ràng hoặc tác động trung lập`
                  },
                  {
                    role: 'user',
                    content: `Ngày: ${date}\nKhu vực: ${region}\nSố bài viết: ${articles.length}\n\nCác tin tức:\n${articlesText}\n\nHãy tóm tắt và đánh giá tác động đến thị trường chứng khoán.`
                  }
                ]
              });
              
              const messageContent = llmResponse.choices[0]?.message?.content;
              if (!messageContent) continue;
              
              let result;
              try {
                const jsonMatch = messageContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                                 messageContent.match(/```\s*([\s\S]*?)\s*```/);
                const jsonStr = jsonMatch ? jsonMatch[1] : messageContent;
                result = JSON.parse(jsonStr.trim());
              } catch (e) {
                result = {
                  summary: messageContent,
                  sentiment: 'neutral'
                };
              }
              
              await saveDailySummary({
                date,
                region,
                summary: result.summary,
                sentiment: result.sentiment,
                articleCount: articles.length
              });
              
              results.push({ date, region, success: true });
            } catch (error) {
              console.error(`[SummaryRouter] Error generating summary for ${date} ${region}:`, error);
              results.push({ date, region, success: false, error: String(error) });
            }
          }
        }
        
        return { 
          success: true, 
          results,
          total: results.length,
          successful: results.filter(r => r.success).length
        };
      })
  }),
});

export type AppRouter = typeof appRouter;
