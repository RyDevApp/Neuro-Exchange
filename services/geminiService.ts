import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const fetchCryptoPrice = async (cryptoSymbol: string): Promise<number> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the current price of 1 ${cryptoSymbol} in US Dollars (USD)? Provide only the numerical value.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            price: {
              type: Type.NUMBER,
              description: `The current price of 1 ${cryptoSymbol} in USD.`,
            },
          },
        },
        temperature: 0,
        tools: [{ googleSearch: {} }],
      },
    });

    const jsonString = response.text;
    const data = JSON.parse(jsonString);
    
    if (data && typeof data.price === 'number') {
      return data.price;
    } else {
      throw new Error(`Invalid price format received for ${cryptoSymbol}.`);
    }
  } catch (error) {
    console.error(`Error fetching ${cryptoSymbol} price from Gemini API:`, error);
    throw new Error(`Could not fetch the latest ${cryptoSymbol} price. Please try again later.`);
  }
};