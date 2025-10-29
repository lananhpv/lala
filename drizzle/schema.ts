import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Articles table - stores collected news articles
 */
export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  url: text("url").notNull().unique(),
  source: text("source").notNull(),
  publishedDate: integer("publishedDate", { mode: "timestamp" }),
  collectedDate: integer("collectedDate", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  relevanceScore: integer("relevanceScore").default(0).notNull(),
  matchedKeywords: text("matchedKeywords"),
  category: text("category"),
  region: text("region").default('vietnam').notNull(),
  summary: text("summary"),
  aiSummary: text("aiSummary"),
  notified: integer("notified").default(0).notNull(), // 0 = not notified, 1 = notified
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Daily summaries table - stores daily summaries by region
 */
export const dailySummaries = sqliteTable("daily_summaries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  region: text("region").notNull(), // vietnam, us, china
  summary: text("summary").notNull(), // 1-3 dòng tóm tắt
  sentiment: text("sentiment").notNull(), // positive, negative, neutral
  articleCount: integer("articleCount").default(0).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type DailySummary = typeof dailySummaries.$inferSelect;
export type InsertDailySummary = typeof dailySummaries.$inferInsert;

