
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { QuizQuestion, SupportCentre, GBVType } from '../types';

export const GeminiService = {
  
  // Create a new chat session with SafeVoice context
  createChat(): Chat | null {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      return ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: `You are SafeVoice AI, a highly specialized expert ONLY in Gender-Based Violence (GBV) and PSEA (Prevention of Sexual Exploitation and Abuse), specifically for the Kakuma/Kalobeyei context. 
          
          CORE MANDATE:
          1. REFUSE any non-GBV/PSEA questions. If asked about cooking, weather, sports, etc., pivot back to GBV.
          2. Example refusal: "I am dedicated solely to GBV and PSEA support. I cannot help with that. Is there a safety concern I can assist with?"

          KAKUMA/KALOBEYEI REFERRALS:
          - DRC Toll-free: 0800720414
          - UNHCR Helpline: 1517 (Also for PSEA/SEA reporting)
          - National Hotline: 1195

          PSEA CORE PRINCIPLES:
          1. SEA is gross misconduct for staff.
          2. NO sexual activity with anyone under 18.
          3. NO exchange of money/aid/services for sex.
          4. NO sexual relationships between aid workers and beneficiaries.
          5. Mandatory reporting to 1517 or inspector@unhcr.org.

          GBV KNOWLEDGE:
          - Diversity & Inclusion: Respect for gender, ethnicity, and sexual orientation (LGBTIQ+).
          - Rights: Safety is a human right. Services are FREE.
          - Age of Consent: 18 years in Kenya.

          SAFETY & CRISIS:
          1. In immediate danger, lead with: "EMERGENCY: PLEASE CALL 1195, 1517, OR 0800720414 IMMEDIATELY."
          2. Be trauma-informed and non-judgmental.`
        }
      });
    } catch (e) {
      console.error("Failed to create chat session", e);
      return null;
    }
  },

  async classifyIncident(description: string): Promise<GBVType | string> {
     try {
       const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
       const response = await ai.models.generateContent({
         model: 'gemini-3-flash-preview',
         contents: `Classify the following incident into one of the 6 core GBV types: Physical Violence, Sexual Violence, Emotional/Psychological Abuse, Economic/Financial Abuse, Harmful Traditional Practices, or Sexual Harassment. Return ONLY the category name. Description: "${description}"`,
       });
       return response.text.trim() as GBVType;
     } catch (e) {
       return "Review Pending";
     }
  },

  getOfflineResponse(userText: string): string {
    const lower = userText.toLowerCase();
    if (lower.includes('help') || lower.includes('danger') || lower.includes('psea') || lower.includes('abuse')) {
        return "EMERGENCY: Please call UNHCR 1517 or DRC 0800720414 immediately. Help is free and confidential.";
    }
    return "I am a specialized AI for GBV and PSEA support in Kakuma. Are you safe right now?";
  },

  async generateQuizForTopic(topic: string): Promise<QuizQuestion[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 3 quiz questions about "${topic}" in the context of GBV/PSEA in Kakuma. Return JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER }
              }
            }
          }
        }
      });
      return JSON.parse(response.text.trim());
    } catch (error) {
      return [];
    }
  },

  async generateSafetyPlan(inputs: any): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a 5-step safety plan for a survivor in Kakuma camp: ${JSON.stringify(inputs)}. Mention the DRC 0800720414 and UNHCR 1517 hotlines.`,
      });
      return response.text;
    } catch (error) {
      return "Call 1195/1517 and prepare a small bag with your ID and essential documents.";
    }
  },

  async findNearbyPlaces(lat: number, lng: number): Promise<SupportCentre[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview', 
        contents: "What GBV recovery centers or police stations are nearby in Kakuma?",
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng
              }
            }
          }
        },
      });
      const places: SupportCentre[] = [];
      response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((chunk: any, i: number) => {
        if (chunk.maps) {
          places.push({ 
            id: `gm_${i}`, 
            name: chunk.maps.title, 
            address: "Nearby Support", 
            type: "Support", 
            distance: "Calculated via GPS", 
            mapUri: chunk.maps.uri 
          });
        }
      });
      return places;
    } catch (e) {
      console.error("Maps grounding failed", e);
      return [];
    }
  }
};
