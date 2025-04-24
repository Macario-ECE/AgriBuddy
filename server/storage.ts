import { messages, type InsertMessage, type Message, type WeatherCache, type InsertWeatherCache } from "@shared/schema";

// Storage interface with CRUD operations for chat messages and weather data
export interface IStorage {
  getMessages(limit?: number): Promise<Message[]>;
  saveMessage(message: InsertMessage): Promise<Message>;
  clearMessages(): Promise<void>;
  
  getWeatherCache(location: string): Promise<WeatherCache | undefined>;
  saveWeatherCache(weatherData: InsertWeatherCache): Promise<WeatherCache>;
}

export class MemStorage implements IStorage {
  private messages: Map<number, Message>;
  private weatherCache: Map<string, WeatherCache>;
  private currentMessageId: number;
  private currentWeatherId: number;

  constructor() {
    this.messages = new Map();
    this.weatherCache = new Map();
    this.currentMessageId = 1;
    this.currentWeatherId = 1;
    
    // Add a welcome message
    this.saveMessage({
      userId: null,
      content: "Welcome to AgriChat! I'm your agricultural assistant. Ask me about plants, farming techniques, crop information, or weather advice.",
      isUser: false,
    });
  }

  async getMessages(limit?: number): Promise<Message[]> {
    // Get all messages and sort by ID (timestamp order)
    let allMessages = Array.from(this.messages.values()).sort((a, b) => a.id - b.id);
    
    // If limit is provided, get only the last 'limit' messages
    if (limit && limit > 0 && allMessages.length > limit) {
      allMessages = allMessages.slice(allMessages.length - limit);
    }
    
    return allMessages;
  }

  async saveMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const timestamp = new Date();
    
    const message: Message = {
      id,
      userId: insertMessage.userId,
      content: insertMessage.content,
      isUser: insertMessage.isUser,
      timestamp,
    };
    
    this.messages.set(id, message);
    return message;
  }

  async clearMessages(): Promise<void> {
    this.messages.clear();
    // Re-add the welcome message
    this.saveMessage({
      userId: null,
      content: "Welcome to AgriChat! I'm your agricultural assistant. Ask me about plants, farming techniques, crop information, or weather advice.",
      isUser: false,
    });
  }

  async getWeatherCache(location: string): Promise<WeatherCache | undefined> {
    return this.weatherCache.get(location);
  }

  async saveWeatherCache(insertWeatherCache: InsertWeatherCache): Promise<WeatherCache> {
    const id = this.currentWeatherId++;
    const timestamp = new Date();
    
    const weatherCache: WeatherCache = {
      id,
      location: insertWeatherCache.location,
      data: insertWeatherCache.data,
      timestamp,
    };
    
    this.weatherCache.set(insertWeatherCache.location, weatherCache);
    return weatherCache;
  }
}

export const storage = new MemStorage();
