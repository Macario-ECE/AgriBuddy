import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Chat message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  content: text("content").notNull(),
  isUser: boolean("is_user").notNull().default(false),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  content: true,
  isUser: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Agriculture knowledge base schema
export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array(),
});

export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).pick({
  topic: true,
  content: true,
  tags: true,
});

export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
export type KnowledgeBase = typeof knowledgeBase.$inferSelect;

// Weather schema for caching weather data
export const weatherCache = pgTable("weather_cache", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  data: jsonb("data").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertWeatherCacheSchema = createInsertSchema(weatherCache).pick({
  location: true,
  data: true,
});

export type InsertWeatherCache = z.infer<typeof insertWeatherCacheSchema>;
export type WeatherCache = typeof weatherCache.$inferSelect;

// Message with response interface for API
export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

export type MessageRequest = z.infer<typeof messageSchema>;

// Chat conversation interface for the frontend
export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  knowledgeCards?: KnowledgeCard[];
}

export interface KnowledgeCard {
  title: string;
  content: string | { label: string; value: string }[];
  type: 'text' | 'list' | 'table';
  icon?: string;
}

// Weather data interface
export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  icon: string;
}

// Growing season data interface
export interface GrowingSeason {
  currentSeason: string;
  plantsToGrow: string[];
}
