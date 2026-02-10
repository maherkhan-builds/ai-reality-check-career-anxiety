import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Service to interact with the Google Gemini API for reframing anxiety.
 */
export const GeminiService = {
  /**
   * Reframes career anxiety based on user input related to AI news.
   *
   * @param userInput The user's input, typically an AI-related news snippet or a description of their anxiety.
   * @returns A promise that resolves to the reframed perspective from the AI.
   * @throws An error if the API call fails or the response is empty.
   */
  reframeAnxiety: async (userInput: string): Promise<string> => {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY is not defined. Please ensure it's set in your environment.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-3-pro-preview"; // Chosen for complex text tasks requiring advanced reasoning and nuanced responses.

    // Crafting a detailed prompt and system instruction for effective reframing.
    const systemInstruction = `You are an empathetic, insightful, and realistic AI assistant named AI Reality Check, specifically designed for mental health professionals. Your purpose is to help users reframe career anxiety stemming from AI-related news. Focus on providing balanced perspectives, highlighting human unique strengths, emphasizing collaboration over replacement, and debunking sensationalism. Your responses should be supportive, grounded in reality, and empower the user, encouraging critical thinking about AI's role in the workplace. Avoid overly optimistic or dismissive tones; instead, offer practical, actionable insights where appropriate, and always prioritize mental well-being.`;

    const prompt = `I am a professional experiencing anxiety about my career due to AI news. Can you help me reframe this thought or news:\n\n"${userInput}"\n\nProvide a supportive, realistic perspective that acknowledges the concern but offers a constructive reframe focusing on unique human value, collaboration, or critical analysis of the news.`;

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt, // Direct string prompt
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8, // Slightly higher for more creative but still grounded reframing
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 500, // Limit response length for conciseness
        },
      });

      const reframedText = response.text;

      if (!reframedText) {
        throw new Error("Gemini API returned an empty response.");
      }

      return reframedText;
    } catch (error: unknown) {
      console.error("Error calling Gemini API:", error);
      // More user-friendly error messages
      if (error instanceof Error) {
        throw new Error(
          `Failed to reframe anxiety. Please try again. Details: ${error.message}`,
        );
      }
      throw new Error("An unknown error occurred during AI reframing.");
    }
  },
};
