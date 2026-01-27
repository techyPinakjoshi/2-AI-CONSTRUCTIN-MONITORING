
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectStage } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

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
 * Extracts a high-accuracy BOQ from construction plans.
 * Focuses on material counts (Bags, Kg, Nos) derived from 2D geometry.
 */
export const extractBoqFromPlans = async (files: File[], chatHistory: any[] = []) => {
  try {
    const ai = getAiClient();
    
    if (!ai) {
      console.warn("Using simulated Quantities (API_KEY not found)");
      return {
        boqItems: [
          { id: "Q-1", code: "CIV-01", category: "Civil Works", description: "OPC 53 Grade Cement requirement for Foundation", qty: 450, unit: "bags", confidence: 0.92, reasoning: "Derived from 65cum Concrete at 7 bags/cum" },
          { id: "Q-2", code: "STR-02", category: "Structural Steel", description: "Fe500D TMT Reinforcement Bars (8mm to 25mm)", qty: 5.2, unit: "tons", confidence: 0.85, reasoning: "Estimated at 80kg/cum for structural framework" },
          { id: "Q-3", code: "MAS-03", category: "Masonry", description: "Red Bricks (9x4x3) for internal 4.5\" walls", qty: 12500, unit: "nos", confidence: 0.78, reasoning: "Calculated from 1250sqft wall area minus openings" }
        ],
        clarificationQuestions: [
          "Slab thickness is not annotated. Should I assume 125mm or 150mm?",
          "Wall height for masonry is missing. Please provide floor-to-ceiling height."
        ]
      };
    }

    const systemInstruction = `
      You are a specialized Construction Material Auditor and Quantity Surveyor. 
      Your task is to convert 2D architectural and structural drawings into a granular Bill of Quantities.
      
      CORE INSTRUCTIONS:
      1. DETECT MATERIALS: Scan for all materials required for a building (Cement, Sand, Aggregate, Steel, Bricks, Tiles, Paint, Plumbing lengths).
      2. DERIVE QUANTITIES: 
         - Concrete: Calculate volume from slab/beam areas x typical thickness.
         - Cement: Derived from Concrete (7-8 bags per cum).
         - Steel: Estimate Tonnage based on area if BBS is not present (standard 80kg/cum for slabs/beams).
         - Masonry: Calculate wall area and convert to Number of Bricks/Blocks.
      3. ACCURACY & AMBIGUITY: 
         - If dimensions are missing (e.g. wall height, slab thickness), DO NOT guess. 
         - List these missing data points in 'clarificationQuestions'.
         - State the logic for every calculation in the 'reasoning' field.
      
      OUTPUT:
      Return ONLY a JSON object containing 'boqItems' and 'clarificationQuestions'.
      No pricing. No monetary values.
    `;

    const parts: any[] = [
      { text: "Exhaustively map all materials from these plans. Calculate quantities based on visible scale and annotations. Ask me for missing Z-axis dimensions (heights/thickness)." }
    ];
    
    if (chatHistory.length > 0) {
      parts.push({ text: `Refine mapping using this user context: ${JSON.stringify(chatHistory)}` });
    }

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const imagePart = await fileToDataPart(file);
        parts.push(imagePart);
      }
    }

    const result = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            boqItems: {
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
                  confidence: { type: Type.NUMBER },
                  reasoning: { type: Type.STRING }
                },
                required: ["id", "code", "category", "description", "qty", "unit", "reasoning"]
              }
            },
            clarificationQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["boqItems", "clarificationQuestions"]
        },
      }
    });

    return JSON.parse(result.text || '{"boqItems": [], "clarificationQuestions": []}');
  } catch (error) {
    console.error("BOQ Extraction error:", error);
    return { boqItems: [], clarificationQuestions: ["Critical error in vision mapping. Please re-upload clearer plans."] };
  }
};

/**
 * Reconstructs a 3D BIM model from 2D plans.
 */
export const reconstructBimFromPlans = async (files: File[]) => {
  try {
    const ai = getAiClient();
    if (!ai) return { elements: [], levels: 0, isCodeCompliant: true, estimatedLod: 350 };
    const parts: any[] = [{ text: "Analyze plans for BIM reconstruction." }];
    for (const file of files) if (file.type.startsWith('image/')) parts.push(await fileToDataPart(file));
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { elements: [], levels: 0, isCodeCompliant: false, estimatedLod: 0 };
  }
};

export const analyzeSiteFrame = async (imageData: string, stage: ProjectStage, cameraName: string) => {
  const ai = getAiClient();
  if (!ai) return { visualAudit: "Offline", progressPercentage: 0 };
  const result = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: `Analyze stage ${stage}` }, { inlineData: { mimeType: "image/jpeg", data: imageData.split(',')[1] } }] },
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(result.text || '{}');
};

export const getRegulatoryAdvice = async (query: string) => {
  const ai = getAiClient();
  if (!ai) return "Offline Advice";
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
  });
  return response.text || "No guidance.";
};

export const auditInventoryInvoice = async (invoiceText: string, stockSummary: string) => {
  const ai = getAiClient();
  if (!ai) return { discrepancies: false, message: "Offline", detectedItems: [] };
  const result = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Audit ${invoiceText} vs ${stockSummary}`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(result.text || '{}');
};
