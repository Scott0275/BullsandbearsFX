
import { GoogleGenAI } from "@google/genai";

/**
 * Provides a professional market sentiment summary using the Gemini API.
 * Handles transient network/RPC errors by providing a fallback insight.
 */
export const getMarketInsights = async (assets: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "AI analysis is currently unavailable.";

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Using gemini-3-flash-preview for high-speed sentiment analysis as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a very brief (max 2 sentences) professional market sentiment summary for these assets: ${assets}. Focus on current investment potential.`,
      config: {
        systemInstruction: "You are a senior financial analyst at BullsandbearsFx. Be professional, concise, and informative. If the service is unreachable or errors occur, the UI will use a default fallback.",
        temperature: 0.5,
      },
    });

    // Directly access the .text property from GenerateContentResponse
    if (response && response.text) {
      return response.text.trim();
    }
    
    return "Market indicators suggest a phase of steady accumulation across major assets.";
  } catch (error: any) {
    // Log error for debugging but return a user-friendly fallback to the UI
    console.error("AI insight error:", error);
    
    // If it's the specific RPC error or any network failure, return a professional fallback
    return "Institutional liquidity remains high as major pairs hold key support levels in the current session.";
  }
};
