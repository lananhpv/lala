import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { articles, InsertArticle, InsertUser, users, dailySummaries, InsertDailySummary } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance
export async function getDb() {
  if (!_db) {
    try {
      const sqlite = new Database('./news_tracker.db');
      _db = drizzle(sqlite);
      
      // Create tables if they don't exist
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          openId TEXT NOT NULL UNIQUE,
          name TEXT,
          email TEXT,
          loginMethod TEXT,
          role TEXT DEFAULT 'user' NOT NULL,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL,
          lastSignedIn INTEGER NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS articles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          url TEXT NOT NULL UNIQUE,
          source TEXT NOT NULL,
          publishedDate INTEGER,
          collectedDate INTEGER NOT NULL,
          relevanceScore INTEGER DEFAULT 0 NOT NULL,
          matchedKeywords TEXT,
          category TEXT,
          region TEXT DEFAULT 'vietnam' NOT NULL,
          summary TEXT,
          aiSummary TEXT,
          notified INTEGER DEFAULT 0 NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS daily_summaries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          region TEXT NOT NULL,
          summary TEXT NOT NULL,
          sentiment TEXT NOT NULL,
          articleCount INTEGER DEFAULT 0 NOT NULL,
          createdAt INTEGER NOT NULL,
          UNIQUE(date, region)
        );
      `);
      
      console.log('[Database] SQLite database initialized');
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }
    if (!values.createdAt) {
      values.createdAt = new Date();
    }
    if (!values.updatedAt) {
      values.updatedAt = new Date();
    }

    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    
    if (existing.length > 0) {
      // Update existing user
      await db.update(users)
        .set({
          name: values.name,
          email: values.email,
          loginMethod: values.loginMethod,
          role: values.role,
          lastSignedIn: values.lastSignedIn,
          updatedAt: new Date(),
        })
        .where(eq(users.openId, user.openId));
    } else {
      // Insert new user
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Save a new article to database
 */
export async function saveArticle(article: InsertArticle) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save article: database not available");
    return null;
  }
  
  // Debug log
  console.log(`[Database] Saving article: region=${article.region}, source=${article.source}, title=${article.title?.substring(0, 40)}...`);

  try {
    // Check if article already exists
    const existing = await db.select().from(articles).where(eq(articles.url, article.url)).limit(1);
    
    if (existing.length > 0) {
      // Update existing article
      await db.update(articles)
        .set({
          relevanceScore: article.relevanceScore,
          matchedKeywords: article.matchedKeywords,
          category: article.category,
          region: article.region,
        })
        .where(eq(articles.url, article.url));
      return { updated: true };
    } else {
      // Insert new article
      if (!article.collectedDate) {
        article.collectedDate = new Date();
      }
      await db.insert(articles).values(article);
      return { inserted: true };
    }
  } catch (error) {
    console.error("[Database] Failed to save article:", error);
    return null;
  }
}

/**
 * Get all articles ordered by collected date
 */
export async function getAllArticles(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(articles).orderBy(desc(articles.collectedDate)).limit(limit);
}

/**
 * Get articles by category
 */
export async function getArticlesByCategory(category: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(articles)
    .where(eq(articles.category, category))
    .orderBy(desc(articles.collectedDate))
    .limit(limit);
}

/**
 * Update AI summary for an article
 */
export async function updateArticleSummary(articleId: number, aiSummary: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update summary: database not available");
    return null;
  }

  try {
    await db.update(articles)
      .set({ aiSummary })
      .where(eq(articles.id, articleId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update summary:", error);
    return null;
  }
}

/**
 * Get statistics
 */
export async function getArticleStats() {
  const db = await getDb();
  if (!db) return { total: 0, byCategory: {}, bySource: {} };

  const allArticles = await db.select().from(articles);
  const total = allArticles.length;
  
  const byCategory: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  
  for (const article of allArticles) {
    const cat = article.category || 'Unknown';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    
    const src = article.source;
    bySource[src] = (bySource[src] || 0) + 1;
  }

  return {
    total,
    byCategory,
    bySource
  };
}


/**
 * Save or update daily summary
 */
export async function saveDailySummary(summary: InsertDailySummary) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save daily summary: database not available");
    return null;
  }

  try {
    // Check if summary already exists for this date and region
    const existing = await db.select()
      .from(dailySummaries)
      .where(sql`${dailySummaries.date} = ${summary.date} AND ${dailySummaries.region} = ${summary.region}`)
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing summary
      await db.update(dailySummaries)
        .set({
          summary: summary.summary,
          sentiment: summary.sentiment,
          articleCount: summary.articleCount,
        })
        .where(sql`${dailySummaries.date} = ${summary.date} AND ${dailySummaries.region} = ${summary.region}`);
      return { updated: true };
    } else {
      // Insert new summary
      if (!summary.createdAt) {
        summary.createdAt = new Date();
      }
      await db.insert(dailySummaries).values(summary);
      return { inserted: true };
    }
  } catch (error) {
    console.error("[Database] Failed to save daily summary:", error);
    return null;
  }
}

/**
 * Get all daily summaries ordered by date
 */
export async function getAllDailySummaries(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(dailySummaries).orderBy(desc(dailySummaries.date)).limit(limit);
}

/**
 * Get daily summaries by date range
 */
export async function getDailySummariesByDateRange(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(dailySummaries)
    .where(sql`${dailySummaries.date} >= ${startDate} AND ${dailySummaries.date} <= ${endDate}`)
    .orderBy(desc(dailySummaries.date));
}

/**
 * Get articles by date and region for summary generation
 */
export async function getArticlesByDateAndRegion(date: string, region: string) {
  const db = await getDb();
  if (!db) return [];

  // Get articles where collectedDate matches the date (YYYY-MM-DD format)
  // collectedDate is stored as Unix timestamp in seconds
  return db.select()
    .from(articles)
    .where(sql`date(${articles.collectedDate}, 'unixepoch') = ${date} AND ${articles.region} = ${region}`)
    .orderBy(desc(articles.relevanceScore));
}
