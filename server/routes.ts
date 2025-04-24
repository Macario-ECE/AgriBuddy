import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { messageSchema, type ChatMessage, type KnowledgeCard } from "@shared/schema";
import axios from "axios";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development",
});

// Initialize OpenWeatherMap API
const WEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY || "dummy-key-for-development";
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix with /api
  
  // Get chat history
  app.get("/api/chat/history", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Send a message and get a response
  app.post("/api/chat/message", async (req, res) => {
    try {
      const validatedData = messageSchema.parse(req.body);
      const userMessage = validatedData.content;

      // Save user message
      const savedUserMessage = await storage.saveMessage({
        userId: null,
        content: userMessage,
        isUser: true,
      });

      // Process with OpenAI
      const response = await processMessageWithAI(userMessage);

      // Save bot response
      const savedBotMessage = await storage.saveMessage({
        userId: null,
        content: response.message,
        isUser: false,
      });

      // Return both messages and any knowledge cards
      res.json({
        userMessage: {
          id: savedUserMessage.id.toString(),
          content: savedUserMessage.content,
          isUser: true,
          timestamp: savedUserMessage.timestamp,
        },
        botMessage: {
          id: savedBotMessage.id.toString(),
          content: response.message,
          isUser: false,
          timestamp: savedBotMessage.timestamp,
          knowledgeCards: response.knowledgeCards,
        },
      });
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid request" 
      });
    }
  });

  // Get weather data
  app.get("/api/weather", async (req, res) => {
    try {
      const { lat = "40.7128", lon = "-74.0060" } = req.query; // Default to NYC coordinates
      
      // Check if we have cached weather data
      const cachedWeather = await storage.getWeatherCache(
        `${lat},${lon}`
      );

      // If cached data exists and is less than 30 minutes old, return it
      if (cachedWeather && 
          (new Date().getTime() - new Date(cachedWeather.timestamp).getTime() < 30 * 60 * 1000)) {
        return res.json(cachedWeather.data);
      }

      // Otherwise fetch new data
      const response = await axios.get(WEATHER_API_URL, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units: "imperial", // Use imperial units (Fahrenheit)
        },
      });

      // Format weather data
      const weatherData = {
        temperature: Math.round(response.data.main.temp),
        condition: response.data.weather[0].main,
        humidity: response.data.main.humidity,
        windSpeed: Math.round(response.data.wind.speed),
        windDirection: getWindDirection(response.data.wind.deg),
        precipitation: response.data.rain ? response.data.rain["1h"] * 100 : 0,
        icon: getWeatherIcon(response.data.weather[0].id),
      };

      // Cache the weather data
      await storage.saveWeatherCache({
        location: `${lat},${lon}`,
        data: weatherData,
      });

      res.json(weatherData);
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ 
        message: "Failed to fetch weather data",
        fallback: {
          temperature: 78,
          condition: "Partly Cloudy",
          humidity: 65,
          windSpeed: 5,
          windDirection: "NE",
          precipitation: 10,
          icon: "fa-cloud-sun",
        }
      });
    }
  });

  // Get current growing season data
  app.get("/api/growing-season", async (req, res) => {
    try {
      // In a real app, this would be based on user location and current date
      // For now, we'll return hardcoded data based on the current month
      const month = new Date().getMonth();
      const season = getSeasonForMonth(month);
      const plantsToGrow = getPlantsForSeason(season);

      res.json({
        currentSeason: season,
        plantsToGrow,
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch growing season data",
        fallback: {
          currentSeason: "Summer",
          plantsToGrow: ["Tomatoes", "Peppers", "Cucumbers", "Summer Squash", "Beans"],
        }
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to process message with OpenAI
async function processMessageWithAI(message: string): Promise<{ 
  message: string; 
  knowledgeCards: KnowledgeCard[] 
}> {
  try {
    // Get the chat history for context
    const chatHistory = await storage.getMessages(5); // Get last 5 messages for context
    
    // Format the history for OpenAI
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.content,
    }));

    // Create the prompt with instructions for structured response
    const systemMessage = {
      role: "system",
      content: `You are AgriBot, an agricultural assistant specialized in providing advice about plants, farming techniques, and growing recommendations.
      
      Always respond to the user in a helpful, informative manner. When providing agricultural information, structure your response as JSON with two parts:
      1. A conversational message
      2. Optional knowledge cards for structured information
      
      Example response format:
      {
        "message": "Your conversational response here",
        "knowledgeCards": [
          {
            "title": "Card Title",
            "content": ["Item 1", "Item 2"] or "Text content" or [{"label": "Sun", "value": "Full sun"}],
            "type": "list" or "text" or "table",
            "icon": "fa-leaf" or other Font Awesome icon class
          }
        ]
      }
      
      Keep responses focused on agriculture, gardening, plant care, and related topics.`
    };

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        systemMessage,
        ...formattedHistory,
        { role: "user", content: message }
      ],
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    
    // Parse the response JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent || "{}");
    } catch (e) {
      console.error("Error parsing OpenAI response:", e);
      return {
        message: "I apologize, but I encountered an error processing your request. Please try asking in a different way.",
        knowledgeCards: [],
      };
    }

    return {
      message: parsedResponse.message || "I'm sorry, I don't have information on that topic yet.",
      knowledgeCards: parsedResponse.knowledgeCards || [],
    };
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return {
      message: "I apologize, but I'm having trouble connecting to my knowledge base. Please try again later.",
      knowledgeCards: [],
    };
  }
}

// Helper function for getting wind direction from degrees
function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

// Helper function for getting weather icon based on condition code
function getWeatherIcon(conditionCode: number): string {
  // Map OpenWeatherMap condition codes to Font Awesome icons
  if (conditionCode >= 200 && conditionCode < 300) return "fa-bolt"; // Thunderstorm
  if (conditionCode >= 300 && conditionCode < 400) return "fa-cloud-rain"; // Drizzle
  if (conditionCode >= 500 && conditionCode < 600) return "fa-cloud-showers-heavy"; // Rain
  if (conditionCode >= 600 && conditionCode < 700) return "fa-snowflake"; // Snow
  if (conditionCode >= 700 && conditionCode < 800) return "fa-smog"; // Atmosphere (fog, etc)
  if (conditionCode === 800) return "fa-sun"; // Clear sky
  if (conditionCode > 800) return "fa-cloud-sun"; // Clouds
  
  return "fa-cloud"; // Default
}

// Helper function to determine season based on month
function getSeasonForMonth(month: number): string {
  // Northern hemisphere seasons
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
}

// Helper function to get plants appropriate for the season
function getPlantsForSeason(season: string): string[] {
  switch (season) {
    case "Spring":
      return ["Lettuce", "Spinach", "Radishes", "Peas", "Carrots", "Potatoes"];
    case "Summer":
      return ["Tomatoes", "Peppers", "Cucumbers", "Summer Squash", "Beans", "Corn"];
    case "Fall":
      return ["Kale", "Brussels Sprouts", "Broccoli", "Cabbage", "Cauliflower"];
    case "Winter":
      return ["Winter Squash", "Garlic", "Cover Crops", "Microgreens (indoor)"];
    default:
      return ["Tomatoes", "Peppers", "Cucumbers", "Summer Squash", "Beans"];
  }
}
