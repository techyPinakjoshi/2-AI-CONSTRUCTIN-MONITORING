
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
 * Extracts a unified BOQ from construction plans.
 * Focuses strictly on quantities and geometric accuracy.
 * Pricing is removed to ensure focus on technical data.
 */
export const extractBoqFromPlans = async (files: File[], chatHistory: any[] = []) => {
  try {
    const ai = getAiClient();
    
    if (!ai) {
      console.warn("Using simulated Quantities (API_KEY not found)");
      const fileHash = files.reduce((acc, f) => acc + f.name.length + f.size, 0);
      const projectScaleSqFt = 5000 + (fileHash % 10000);
      
      return {
        boqItems: [
          { id: "Q-1", code: "CIV-01", category: "Excavation", description: "Bulk excavation for foundation pits", qty: 450 + (fileHash % 100), unit: "cum", confidence: 0.95 },
          { id: "Q-2", code: "STR-02", category: "Concrete", description: "Grade M30 concrete for footings and columns", qty: 120 + (fileHash % 50), unit: "cum", confidence: 0.88 },
          { id: "Q-3", code: "REI-03", category: "Reinforcement", description: "TMT Fe 500D steel reinforcement", qty: 4500 + (fileHash % 1000), unit: "kg", confidence: 0.75 }
        ],
        clarificationQuestions: [
          "The scale bar on Drawing A-102 is partially obscured. Please confirm if 1cm = 2m.",
          "Structural plan S-01 shows 14 columns, but Architectural layout shows 12. Which should be the primary reference?"
        ]
      };
    }

    const systemInstruction = `
      You are a specialized Construction Quantity Surveyor. Your goal is to extract technical BOQ items with EXTREME geometric accuracy.
      
      RULES:
      1. DO NOT provide pricing, rates, or monetary values. Focus ONLY on Quantities (sqft, cum, kg, running meters).
      2. If you are unsure about a dimension or scale, DO NOT guess. Instead, list it in 'clarificationQuestions'.
      3. Identify the Project Scale (Built-up Area) precisely.
      4. Use IS 1200 measurement protocols.
      5. Look for annotations, schedules, and scale bars.
      
      CONVERSATIONAL REFINEMENT:
      If chat history is provided, use the user's answers to refine the quantities.
    `;

    const parts: any[] = [
      { text: "Extract accurate quantities from these plans. If scale is ambiguous, ask me to clarify." }
    ];
    
    // Add chat context if refining
    if (chatHistory.length > 0) {
      parts.push({ text: `Context from previous conversation: ${JSON.stringify(chatHistory)}` });
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
                  confidence: { type: Type.NUMBER }
                },
                required: ["id", "code", "category", "description", "qty", "unit"]
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
    return { boqItems: [], clarificationQuestions: ["Error during extraction. Please re-upload clearer plans."] };
  }
};

/**
 * Reconstructs a 3D BIM model from 2D plans.
 */
export const reconstructBimFromPlans = async (files: File[]) => {
  try {
    const ai = getAiClient();
    if (!ai) {
      const seed = files.reduce((acc, f) => acc + f.name.length, 0);
      return {
        elements: [
          { type: "Column", dimensions: `${300 + (seed % 50)}x450mm`, position: "Grid A1", material: "M30" },
          { type: "Beam", dimensions: "230x600mm", position: "Level 1", material: "M30" }
        ],
        levels: 3 + (seed % 4),
        isCodeCompliant: true,
        estimatedLod: 350
      };
    }
    const parts: any[] = [{ text: "Analyze plans for BIM reconstruction." }];
    for (const file of files) {
      if (file.type.startsWith('image/')) parts.push(await fileToDataPart(file));
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            elements: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, dimensions: { type: Type.STRING }, position: { type: Type.STRING }, material: { type: Type.STRING } } } },
            levels: { type: Type.INTEGER },
            isCodeCompliant: { type: Type.BOOLEAN },
            estimatedLod: { type: Type.INTEGER }
          }
        }
      }
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
