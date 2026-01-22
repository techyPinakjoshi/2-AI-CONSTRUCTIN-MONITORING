
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectStage, TaskLog, AiLogEntry } from "../types";

// Safe initialization helper
const getAiClient = () => {
  const apiKey = (typeof process !== 'undefined' && process.env.API_KEY) ? process.env.API_KEY : '';
  return new GoogleGenAI({ apiKey });
};

/**
 * Reconstructs a 3D BIM model from 2D Architectural and Structural plans.
 */
export const reconstructBimFromPlans = async (planNames: string[]) => {
  try {
    const ai = getAiClient();
    const prompt = `
      Act as an expert BIM Engineer. 
      Analyze 2D plans: ${planNames.join(', ')}.
      Generate a structured JSON output defining structural elements and material properties.
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            elements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  dimensions: { type: Type.STRING },
                  position: { type: Type.STRING },
                  material: { type: Type.STRING }
                }
              }
            },
            levels: { type: Type.INTEGER },
            isCodeCompliant: { type: Type.BOOLEAN }
          }
        },
      }
    });

    return JSON.parse(result.text || '{}');
  } catch (error) {
    console.error("BIM Reconstruction error:", error);
    return { elements: [], levels: 0, isCodeCompliant: false };
  }
};

/**
 * Extracts a unified BOQ from multiple uploaded construction plans.
 */
export const extractBoqFromPlans = async (planNames: string[]) => {
  try {
    const ai = getAiClient();
    const prompt = `
      Extract a unified Bill of Quantities (BOQ) following IS 1200 from these plans: ${planNames.join(', ')}.
      Return a JSON array of objects with keys: id, code, category, description, qty, unit, rate, amount.
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              code: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              qty: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              rate: { type: Type.NUMBER },
              amount: { type: Type.NUMBER },
            },
            propertyOrdering: ["id", "code", "category", "description", "qty", "unit", "rate", "amount"],
          },
        },
      }
    });

    return JSON.parse(result.text || '[]');
  } catch (error) {
    console.error("BOQ Extraction error:", error);
    return [];
  }
};

export const analyzeSiteFrame = async (imageData: string, stage: ProjectStage, cameraName: string) => {
  try {
    const ai = getAiClient();
    const prompt = `Analyze this construction image for project stage ${stage} at ${cameraName}.`;
    
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [
          { text: prompt }, 
          { inlineData: { mimeType: "image/jpeg", data: imageData.split(',')[1] } }
        ] 
      },
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(result.text || '{}');
  } catch (error) {
    return { visualAudit: "Analysis currently unavailable", progressPercentage: 0 };
  }
};

export const getRegulatoryAdvice = async (query: string) => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ text: `Expert on Indian Construction Codes (IS Codes). Answer briefly: "${query}"` }],
        });
        return response.text || "";
    } catch (error) {
        return "Regulatory link offline. Please consult IS 456:2000 manually.";
    }
}

export const auditInventoryInvoice = async (invoiceText: string, stockSummary: string) => {
  try {
    const ai = getAiClient();
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ text: `Audit invoice: ${invoiceText}. Stock: ${stockSummary}.` }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(result.text || '{}');
  } catch (error) {
    return { discrepancies: false, message: "Manual audit required", detectedItems: [] };
  }
};
