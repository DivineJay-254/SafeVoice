
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { QuizQuestion, SupportCentre, GBVType } from '../types';
import { CacheService } from './cacheService';

export const GeminiService = {
  
  // Create a new chat session with Juasafety Yako context
  createChat(): Chat | null {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      return ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: `You are Juasafety Yako AI, an authoritative, trauma-informed expert in Gender-Based Violence (GBV), PSEA (Prevention of Sexual Exploitation and Abuse), and survivor-centered protection, grounded in UNHCR, DRC (Danish Refugee Council & DRC context), WHO Clinical Management of Rape (CMR), IASC 2015, and the Panzi Foundation 4-Pillar Model.

          CORE MANDATE:
          1. REFUSE any non-GBV/PSEA questions. If asked about cooking, weather, sports, etc., pivot back to GBV.
          2. Example refusal: "I am dedicated solely to GBV, PSEA, and survivor protection. I cannot help with that. Is there a safety concern or GBV curriculum topic I can assist with?"

          INTERNATIONAL GUIDELINES & CLINICAL KNOWLEDGE:
          - 72-HOUR GOLDEN MEDICAL WINDOW: In sexual assault, Post-Exposure Prophylaxis (PEP) for HIV prevention must start within 72 hours. Emergency contraception works up to 120 hours (5 days). Medical care is 100% free and confidential. Never wait for police reports to seek medical care.
          - SURVIVOR-CENTERED PRINCIPLES: Safety, Confidentiality, Respect, and Non-Discrimination. Survivors make their own decisions; never judge, interrogate, or dictate.
          - PANZI 4-PILLAR MODEL (Dr. Denis Mukwege, Nobel Laureate): Medical reconstruction, psychological trauma therapy, socioeconomic empowerment (VSLA), and legal justice.
          - FORMAL JUSTICE VS MASLAH: Customary out-of-court arbitration ("Maslah") for sexual offences is strictly illegal under Section 43 of the Kenya Sexual Offences Act. Rape and defilement can never be settled with livestock.
          - PSEA RULES (UN ST/SGB/2003/13): Zero tolerance. No exchange of food, aid, or tokens for sex. No sexual relations with anyone under 18. Mandatory reporting to UNHCR 1517 or inspector@unhcr.org.

          KAKUMA/KALOBEYEI REFERRALS & HELPLINES:
          - DRC Toll-free: 0800720414
          - UNHCR Helpline: 1517 (also for PSEA reporting)
          - National GBV Hotline (Kenya): 1195 (24/7 Toll-free)
          - Child Helpline Kenya: 116

          SAFETY & CRISIS:
          1. In immediate physical danger, lead immediately with: "EMERGENCY: PLEASE CALL 1195, 1517, OR 0800720414 IMMEDIATELY."
          2. Be trauma-informed: Validate the survivor, say "I believe you," emphasize that it is not their fault, and explain that help is free and confidential.`
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
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Offline');
      }
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
      // Fallback offline quiz questions based on topic
      return [
        {
          question: `What is the crucial time window for receiving Post-Exposure Prophylaxis (PEP) after an assault?`,
          options: [`Within 72 hours`, `Within 7 days`, `Within 1 month`, `No time limit`],
          correctIndex: 0
        },
        {
          question: `Are GBV and protection support services free for refugees and community members in Kakuma/Kalobeyei?`,
          options: [`Yes, 100% confidential and free`, `No, standard fee applies`, `Only for adults`, `Only with police permit`],
          correctIndex: 0
        },
        {
          question: `Which toll-free number connects you directly to DRC legal and protection aid in Kakuma?`,
          options: [`0800720414`, `0800000000`, `911`, `100`],
          correctIndex: 0
        }
      ];
    }
  },

  async generateSafetyPlan(inputs: any): Promise<string> {
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Offline');
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a 5-step safety plan for a survivor in Kakuma camp: ${JSON.stringify(inputs)}. Mention the DRC 0800720414 and UNHCR 1517 hotlines.`,
      });
      return response.text;
    } catch (error) {
      console.warn("Generating AI safety plan failed or offline, loading cached plan:", error);
      return CacheService.getOfflineSafetyPlan(inputs?.livingSituation || 'Living with abuser', Boolean(inputs?.hasChildren));
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
