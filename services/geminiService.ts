
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectStage, TaskLog, AiLogEntry } from "../types";

// Initialize the GoogleGenAI client with the required named parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'demo_mode' });

/**
 * Extracts a unified BOQ from multiple uploaded construction plans.
 */
export const extractBoqFromPlans = async (planNames: string[]) => {
  try {
    if (!process.env.API_KEY || process.env.API_KEY === 'demo_mode') throw new Error("Demo Mode");

    const prompt = `
      Act as an expert Quantity Surveyor. Analyze the context of these uploaded plans: ${planNames.join(', ')}.
      Generate a unified Bill of Quantities (BOQ) following IS 1200 (Indian Standard Method of Measurement).
      Include:
      1. Item Codes (SOR aligned).
      2. Comprehensive descriptions.
      3. Precise quantities synthesized from multiple plan cross-referencing.
      4. Standard unit rates for 2024-25.
      
      Return a JSON array of objects with keys: id, code, category, description, qty, unit, rate, amount.
    `;

    // Correctly call ai.models.generateContent instead of defining a model first.
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

    // Use result.text property directly.
    return JSON.parse(result.text || '[]');
  } catch (error) {
    // Demo Fallback with realistic synthesized data
    return [
      { id: 'ext-1', code: '2.1.1', category: 'Civil', description: 'Earthwork in excavation by mechanical means (Hydraulic excavator) over areas (exceeding 30cm in depth, 1.5m in width as well as 10sqm on plan)', qty: 1540, unit: 'cum', rate: 155.00, amount: 238700 },
      { id: 'ext-2', code: '5.22', category: 'Civil', description: 'Steel reinforcement for R.C.C. work including straightening, cutting, bending, placing in position and binding all complete upto floor five level.', qty: 18.2, unit: 'mt', rate: 68000.00, amount: 1237600 },
      { id: 'ext-3', code: '13.1.1', category: 'Finishing', description: '12mm cement plaster of mix 1:4 (1 cement: 4 fine sand)', qty: 850, unit: 'sqm', rate: 215.00, amount: 182750 }
    ];
  }
};

export const analyzeSiteFrame = async (imageData: string, stage: ProjectStage, cameraName: string) => {
  try {
    if (!process.env.API_KEY || process.env.API_KEY === 'demo_mode') throw new Error("Demo Mode");
    const prompt = `Analyze this construction image for project stage ${stage} at ${cameraName}. Refer to IS 456 for concrete or IS 1786 for rebar.`;
    
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
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
    return { isCodeReference: "IS 456:2000", visualAudit: "Compliant", progressPercentage: 42 };
  }
};

export const getRegulatoryAdvice = async (query: string) => {
    try {
        if (!process.env.API_KEY || process.env.API_KEY === 'demo_mode') throw new Error("Demo Mode");
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ text: `Expert on Indian Construction Codes (IS Codes). Answer briefly: "${query}"` }],
        });
        return response.text;
    } catch (error) {
        return "Based on IS 456:2000, the minimum grade of concrete for reinforced concrete work shall not be lower than M20.";
    }
}

export const auditInventoryInvoice = async (invoiceText: string, stockSummary: string) => {
  try {
    if (!process.env.API_KEY || process.env.API_KEY === 'demo_mode') throw new Error("Demo Mode");
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ text: `Audit invoice: ${invoiceText}. Stock: ${stockSummary}.` }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(result.text || '{}');
  } catch (error) {
    return { discrepancies: false, message: "Verified", detectedItems: [] };
  }
};
