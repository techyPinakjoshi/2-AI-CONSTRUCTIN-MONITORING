
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectStage } from "../types";

/**
 * Safely obtains the Gemini API client.
 * Always creates a new instance right before making an API call.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Helper to convert File to base64
 */
const fileToDataPart = async (file: File) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type || 'image/jpeg'
        }
      });
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Reconstructs a 3D BIM model from 2D Architectural and Structural plans.
 */
export const reconstructBimFromPlans = async (planNames: string[]) => {
  try {
    const ai = getAiClient();
    if (!ai) throw new Error("API Key missing");

    const prompt = `
      Act as an expert BIM Engineer. 
      Analyze 2D plans: ${planNames.join(', ')}.
      Generate a structured JSON output defining structural elements and material properties.
    `;

    const result = await ai.models.generateContent({
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
export const extractBoqFromPlans = async (files: File[]) => {
  try {
    const ai = getAiClient();
    
    // If no API key, return sophisticated mock data instead of an empty array
    // to prevent the UI from appearing "broken" during local dev/demo.
    if (!ai) {
      console.warn("Using mock BOQ data (API_KEY not found)");
      return [
        { id: "1", code: "2.1.1", category: "Excavation", description: "Earthwork in excavation by mechanical means", qty: 450, unit: "cum", rate: 120, amount: 54000 },
        { id: "2", code: "4.1.2", category: "Concrete", description: "PCC 1:4:8 for foundation base", qty: 25, unit: "cum", rate: 4500, amount: 112500 },
        { id: "3", code: "5.2.1", category: "Reinforcement", description: "TMT bars Fe 500D (12mm)", qty: 1200, unit: "kg", rate: 65, amount: 78000 },
        { id: "4", code: "6.1.1", category: "Brickwork", description: "Fly ash bricks in cement mortar 1:6", qty: 15, unit: "cum", rate: 5200, amount: 78000 }
      ];
    }

    const parts: any[] = [{ text: "Extract a unified Bill of Quantities (BOQ) following IS 1200 from these construction plans. Return a JSON array." }];
    
    // Add image data for each file if it's an image
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const imagePart = await fileToDataPart(file);
        parts.push(imagePart);
      } else {
        parts.push({ text: `Analyze file name: ${file.name}` });
      }
    }

    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
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
          },
        },
      }
    });

    return JSON.parse(result.text || '[]');
  } catch (error) {
    console.error("BOQ Extraction error:", error);
    // Return empty list on actual failure
    return [];
  }
};

/**
 * Analyzes a site frame for structural anomalies or safety hazards.
 */
export const analyzeSiteFrame = async (imageData: string, stage: ProjectStage, cameraName: string) => {
  try {
    const ai = getAiClient();
    if (!ai) return { visualAudit: "AI Service Offline (Missing Key)", progressPercentage: 0 };

    const prompt = `Analyze this construction image for project stage ${stage} at ${cameraName}. Detect structural anomalies or safety hazards.`;
    
    const result = await ai.models.generateContent({
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
        if (!ai) return "Consult IS 456:2000. (Connect AI to enable live guidance)";

        const response = await ai.models.generateContent({
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
    if (!ai) return { discrepancies: false, message: "Connect AI to enable invoice auditing.", detectedItems: [] };

    const result = await ai.models.generateContent({
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
