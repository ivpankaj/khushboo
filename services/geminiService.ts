import { GoogleGenAI } from "@google/genai";
import { FaqData } from "../types";

export const generateRomanticMessage = async (data: FaqData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const prompt = `Write a short, incredibly sweet and cute romantic poem for ${data.girlfriendName} from Pankaj.
  Mention her answers about me: my name is ${data.guessName},  
   Use a warm, playful tone and include a few emojis in hinglish tone , propose her in a sweet and love manner , propose her a litttle emotional .
  Keep it to about 10-12 lines.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "You are my everything, my sun and my moon. I love you forever!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "You are my heart's desire, the one I've been waiting for. I love you more than words can say!";
  }
};
