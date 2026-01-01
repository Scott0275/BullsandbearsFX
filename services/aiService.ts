
import { GoogleGenAI } from "@google/genai";

/**
 * Provides a professional market sentiment summary using the Gemini API.
 * Handles transient network/RPC errors by providing a fallback insight.
 */
export const getMarketInsights = async (assets: string) => {
  // Use the API key provided in the environment.
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "AI insights are currently in standby mode. Monitor assets for volatility.";

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Using gemini-3-flash-preview for high-speed sentiment analysis.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a very brief (max 2 sentences) professional market sentiment summary for these assets: ${assets}. Focus on current investment potential and growth outlook.`,
      config: {
        systemInstruction: "You are a senior financial analyst at BullsandbearsFx. Be professional, concise, and informative. If data is limited, provide a general neutral-to-bullish outlook.",
        temperature: 0.5,
      },
    });

    // Directly access the .text property from GenerateContentResponse
    if (response && response.text) {
      return response.text.trim();
    }
    
    return "Market indicators suggest a phase of steady accumulation across major crypto pairs.";
  } catch (error: any) {
    // Log error for debugging but return a user-friendly fallback to the UI
    console.warn("AI insight notice:", error.message);
    
    // Fallback professional insight for when the API is unreachable or rate-limited
    return "Institutional liquidity remains high as major pairs hold key support levels in the current session.";
  }
};
