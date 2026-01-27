
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectStage } from "../types";

/**
 * Safely obtains the Gemini API client.
 * Always creates a new instance right before making an API call.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in the environment.");
  }
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
      // Complex reasoning task: gemini-3-pro-preview
      model: 'gemini-3-pro-preview',
      contents: prompt,
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
                },
                required: ['type', 'dimensions', 'position', 'material']
              }
            },
            levels: { type: Type.INTEGER },
            isCodeCompliant: { type: Type.BOOLEAN }
          },
          required: ['elements', 'levels', 'isCodeCompliant']
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
      // Complex reasoning task: gemini-3-pro-preview
      model: 'gemini-3-pro-preview',
      contents: prompt,
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
            required: ["id", "code", "category", "description", "qty", "unit", "rate", "amount"],
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

/**
 * Analyzes a site frame for structural anomalies or safety hazards.
 */
export const analyzeSiteFrame = async (imageData: string, stage: ProjectStage, cameraName: string) => {
  try {
    const ai = getAiClient();
    const prompt = `Analyze this construction image for project stage ${stage} at ${cameraName}. Detect structural anomalies or safety hazards.`;
    
    const result = await ai.models.generateContent({
      // Basic text/image task: gemini-3-flash-preview
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [
          { text: prompt }, 
          { inlineData: { mimeType: "image/jpeg", data: imageData.includes(',') ? imageData.split(',')[1] : imageData } }
        ] 
      },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            visualAudit: { type: Type.STRING },
            progressPercentage: { type: Type.NUMBER }
          },
          required: ['visualAudit', 'progressPercentage']
        }
      }
    });
    return JSON.parse(result.text || '{}');
  } catch (error) {
    console.error("Frame analysis error:", error);
    return { visualAudit: "Analysis currently unavailable", progressPercentage: 0 };
  }
};

/**
 * Gets regulatory advice based on Indian Construction Codes.
 */
export const getRegulatoryAdvice = async (query: string) => {
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            // Basic Q&A task: gemini-3-flash-preview
            model: 'gemini-3-flash-preview',
            contents: `You are an expert on Indian Construction Codes (IS Codes). Provide a detailed but concise technical answer to: "${query}"`,
        });
        return response.text || "No regulatory guidance found for this query.";
    } catch (error) {
        console.error("Regulatory advice error:", error);
        return "Regulatory link offline. Please consult IS 456:2000 manually.";
    }
}

/**
 * Audits a construction material invoice against current stock summary.
 */
export const auditInventoryInvoice = async (invoiceText: string, stockSummary: string) => {
  try {
    const ai = getAiClient();
    const result = await ai.models.generateContent({
      // Basic audit task: gemini-3-flash-preview
      model: 'gemini-3-flash-preview',
      contents: `Audit construction material invoice against current stock. Invoice: ${invoiceText}. Stock: ${stockSummary}.`,
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
                },
                required: ['name', 'quantity']
              }
            }
          },
          required: ['discrepancies', 'message', 'detectedItems']
        }
      }
    });
    return JSON.parse(result.text || '{}');
  } catch (error) {
    console.error("Invoice audit error:", error);
    return { discrepancies: false, message: "Manual audit required", detectedItems: [] };
  }
};
