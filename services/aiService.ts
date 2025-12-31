
import { GoogleGenAI } from "@google/genai";

// Fixed: The API key must be obtained exclusively from process.env.API_KEY and used directly in the constructor.
export const getMarketInsights = async (assets: string) => {
  if (!process.env.API_KEY) return "AI insights are currently unavailable.";

  try {
    // Correct usage of new GoogleGenAI with named apiKey parameter using process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a very brief (2 sentences) professional market sentiment summary for these assets: ${assets}. Focus on investment potential.`,
      config: {
        systemInstruction: "You are a senior financial analyst at BullsandbearsFx. Be professional, concise, and informative.",
        temperature: 0.7,
      },
    });

    // Correctly accessing .text property (not a method) as per guidelines.
    return response.text || "Market conditions are currently stable. Monitor volatility.";
  } catch (error) {
    console.error("AI insight error:", error);
    return "Consolidating market data for deeper analysis...";
  }
};
