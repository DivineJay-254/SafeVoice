import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from '../types';

// Safely get API key, though in this demo environment it might be mocked or user provided
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const GeminiService = {
  
  async generateQuizForTopic(topic: string): Promise<QuizQuestion[]> {
    if (!API_KEY) {
      console.warn("No API Key available for Gemini. Returning mock quiz.");
      return [
        {
          question: `What is a primary warning sign of ${topic}?`,
          options: ["Supportive behavior", "Isolation from friends", "Open communication", "Respecting boundaries"],
          correctIndex: 1
        },
        {
          question: "Who can you contact for immediate help?",
          options: ["A stranger", "The abuser", "Emergency Hotline 1195", "No one"],
          correctIndex: 2
        }
      ];
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a simple 3-question multiple choice quiz about "${topic}" related to Gender Based Violence awareness. Return JSON only.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER, description: "Zero-based index of the correct option" }
              }
            }
          }
        }
      });
      
      const jsonText = response.text;
      return JSON.parse(jsonText || '[]');
    } catch (error) {
      console.error("Gemini Quiz Generation failed:", error);
      return [];
    }
  },

  async analyzeReportSafety(description: string): Promise<string> {
    if (!API_KEY) return "Unable to analyze safety (No API Key).";

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this GBV report description for immediate risk level. Provide a one sentence safety advice. Description: "${description}"`,
      });
      return response.text || "Please seek immediate help if you are in danger.";
    } catch (error) {
      console.error("Safety analysis failed", error);
      return "Please ensure you are in a safe location.";
    }
  },

  async generateSafetyPlan(inputs: { livingSituation: string; hasChildren: boolean; accessToMoney: string; trustedContact: boolean }): Promise<string> {
    if (!API_KEY) return "Safety Plan unavailable without API connection. Please call 1195.";

    try {
      const prompt = `
        You are a safety planning expert for victims of domestic violence. Create a personalized, practical, and safe 5-step safety plan for a victim in Kenya.
        
        User Context:
        - Living Situation: ${inputs.livingSituation}
        - Has Children: ${inputs.hasChildren ? 'Yes' : 'No'}
        - Access to Money: ${inputs.accessToMoney}
        - Has Trusted Contact: ${inputs.trustedContact ? 'Yes' : 'No'}

        Output format: Markdown. Use bullet points. Be concise. Include specific Kenyan resources like 1195 or 999 where relevant.
        Focus on immediate safety and preparation for emergency exit.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Unable to generate plan.";
    } catch (error) {
      console.error("Safety plan generation failed", error);
      return "Error generating plan. Please call the National Hotline 1195.";
    }
  }
};