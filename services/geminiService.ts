
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getHealthSuggestion = async (symptoms: string): Promise<string> => {
  if (!API_KEY) {
    return "AI Health Assistant is currently unavailable. Please check the API key configuration.";
  }
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `
          You are an AI Health Assistant for an online doctor appointment system. Your role is to help users understand which type of doctor they should consult based on their symptoms.

          User's symptoms: "${symptoms}"

          Based on these symptoms, provide the following:
          1.  Suggest one or two most likely medical specializations they should consider (e.g., Cardiologist, Dermatologist, General Physician).
          2.  Briefly explain why you are suggesting this specialization in simple terms.
          3.  IMPORTANT: Conclude with a clear and friendly disclaimer that you are an AI assistant and this is not a medical diagnosis. Advise the user to book an appointment with a qualified doctor for proper medical advice.

          Keep the response concise, helpful, and easy to understand for a non-medical person. Structure your response in markdown.
        `,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching health suggestion from Gemini API:", error);
    return "Sorry, I couldn't process your request at the moment. Please try again later.";
  }
};
