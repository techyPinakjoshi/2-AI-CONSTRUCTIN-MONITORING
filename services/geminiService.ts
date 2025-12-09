import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSiteProgress = async (stage: string, mockImageData: string) => {
  try {
    // In a real app, we would send the image. Here we simulate the prompt context based on the stage.
    // We are mocking the image part for this demo structure but using the real API for text generation.
    const prompt = `
      Analyze the construction site progress for the '${stage}' stage.
      Assume the visual input shows a construction site with active machinery.
      
      If stage is 'Excavation', mention soil removal volume and pit depth.
      If stage is 'Foundation', mention footing status.
      
      Generate a realistic status report in JSON format.
    `;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    progressPercentage: { type: Type.NUMBER },
                    insights: { type: Type.ARRAY, items: { type: Type.STRING } },
                    safetyAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
                    estimatedCompletion: { type: Type.STRING }
                }
            }
        }
    });
    
    if (result.text) {
        return JSON.parse(result.text);
    }
    throw new Error("No text response from AI");
  } catch (error) {
    console.error("Gemini Analysis Failed", error);
    return {
      progressPercentage: 0,
      insights: ["AI Service Unavailable - Showing cached data"],
      safetyAlerts: [],
      estimatedCompletion: "Unknown"
    };
  }
};

export const auditInventoryInvoice = async (invoiceText: string, currentStock: string) => {
    try {
        const prompt = `
          You are a construction inventory auditor.
          Current Stock Context: ${currentStock}
          
          Incoming Invoice/Scan Data: "${invoiceText}"
          
          Compare the incoming data with typical construction needs or just parse the invoice.
          Identify if these materials match a typical order for a mid-sized commercial project.
          Return a JSON summary.
        `;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        discrepancies: { type: Type.BOOLEAN },
                        message: { type: Type.STRING },
                        detectedItems: { 
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    quantity: { type: Type.NUMBER }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (result.text) {
            return JSON.parse(result.text);
        }
        throw new Error("No text response from AI");

    } catch (error) {
        console.error("Inventory Audit Failed", error);
        throw error;
    }
}

export const getRegulatoryAdvice = async (query: string) => {
    try {
        const prompt = `
        You are an expert on Indian Construction Codes (IS Codes) and International Building Standards.
        Answer the following query briefly and professionally for a site engineer:
        "${query}"
        `;

         const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        
        return result.text || "No advice available.";
    } catch (error) {
        return "Unable to fetch regulatory advice at this moment.";
    }
}