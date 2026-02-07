
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectStage } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates a Daily WIP Report based on site evidence and remarks.
 * Follows strict reporting logic: no assumptions, no invented data.
 */
export const generateDailyReport = async (reportData: {
  project: any;
  date: string;
  approvedMedia: any[];
  activeMachinery: any[];
  inventoryLogs?: any[];
  weather?: string;
  manpower?: any;
}) => {
  const ai = getAiClient();
  if (!ai) return "AI services are currently offline. Please check your API configuration.";

  const systemInstruction = `
You are a Construction Site Reporting AI specialized in generating
Daily Work-in-Progress (WIP) reports for construction projects.

Your role:
- Assist site engineers and project managers in documenting daily progress
- Ensure reports are factual, measurable, and BOQ-linked
- Never assume quantities or activities
- Never invent work that was not explicitly provided

Core Principles:
- Accuracy over completeness
- No assumptions
- No estimated quantities
- No generic statements like “work in progress”
- All reported work must be measurable and traceable

-----------------------------------
REPORT STRUCTURE (MANDATORY)
-----------------------------------

1. PROJECT INFORMATION
Include: Project Name, Location, Client, Contractor, Report Date, Day, Weather, Site Engineer Name, Report Number.

2. WORK EXECUTED TODAY
Format: Sr No, Work Description, Location / Grid / Floor, Unit, Quantity Executed Today, Cumulative Quantity, BOQ Reference.
If missing: Mention “BOQ Ref: Not linked”.

3. MANPOWER DEPLOYED
Include: Engineers, Supervisors, Skilled workers, Unskilled workers, Total manpower.

4. MACHINERY & EQUIPMENT USED
Include: Equipment name, Quantity, Hours used.

5. MATERIAL RECEIPT / CONSUMPTION
Separate: Materials received today, Materials consumed today. Include unit and quantity.

6. QUALITY & INSPECTION STATUS
Report inspections performed. If none: State “No quality inspection conducted today”.

7. SAFETY OBSERVATIONS
Include: Observations, Corrective actions taken.

8. ISSUES / CLARIFICATIONS / DELAYS
Include: Description, Responsible party, Current status. If none: State “No issues reported today”.

9. WORK PLANNED FOR NEXT DAY

10. SITE PHOTOS (REFERENCE ONLY)
Note “Site photos attached for reference”.

11. SIGN-OFF
Prepared by, Checked by, Approved by.

STRICT RULES:
- Never invent quantities
- Never infer progress percentages
- Never combine multiple days into one report
- Never modify user-provided data
- If clarification is needed, mention it explicitly
`;

  const prompt = `
    Generate a professional Daily WIP Report for ${reportData.date}.
    
    DATA INPUTS:
    - Project: ${reportData.project.name}
    - Location: ${reportData.project.location || 'Site Location'}
    - Approved Site Evidence (Captures & Remarks with Qty): ${JSON.stringify(reportData.approvedMedia)}
    - Active Machinery & Condition: ${JSON.stringify(reportData.activeMachinery)}
    - Material Logs for the day: ${JSON.stringify(reportData.inventoryLogs || [])}
    - Weather: ${reportData.weather || 'Clear'}
    
    Follow the mandatory report structure strictly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction }
    });
    return response.text || "Report generation failed to return content.";
  } catch (error) {
    console.error("Report Generation Error:", error);
    return "Error generating neural report. Please verify data inputs and try again.";
  }
};

/**
 * Fetches regulatory advice with optional external app context (e.g., IS-Code App).
 */
export const getRegulatoryAdvice = async (query: string, isCodeAppLinked: boolean = false) => {
  const ai = getAiClient();
  if (!ai) return "Offline Advice: System is currently disconnected from the regulatory cloud.";

  const systemInstruction = isCodeAppLinked 
    ? "You are a Senior IS-Code Compliance Officer. The user's account is LINKED to the Indian Construction Code App. Always reference specific IS Codes (IS 456, IS 1200, IS 800, NBC 2016) in your response. Be concise, technical, and provide safety margins."
    : "You are a Construction AI Consultant. Provide general engineering guidance based on international standards.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: { systemInstruction }
    });
    return response.text || "No guidance returned from neural core.";
  } catch (error) {
    return "Connection error. Unable to reach IS-Code regulatory database.";
  }
};

/**
 * Reconstructs 3D BIM metadata from 2D plan images/PDFs.
 */
export const reconstructBimFromPlans = async (files: File[]) => {
  const ai = getAiClient();
  if (!ai) return { estimatedLod: 100, levels: 1, elements: [] };

  const parts: any[] = [{ text: "Analyze these 2D plans and reconstruct a 3D BIM model metadata. Identify levels, estimated LOD, and core structural elements." }];
  
  for (const file of files) {
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    parts.push({ 
      inlineData: { 
        data: base64, 
        mimeType: file.type.startsWith('image/') ? file.type : 'application/pdf' 
      } 
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedLod: { type: Type.NUMBER },
            levels: { type: Type.NUMBER },
            elements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  count: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("BIM Reconstruction Error:", error);
    return { estimatedLod: 100, levels: 1, elements: [] };
  }
};

/**
 * Audits a delivery invoice against current stock summary.
 */
export const auditInventoryInvoice = async (invoiceText: string, stockSummary: string) => {
  const ai = getAiClient();
  if (!ai) return { discrepancies: false, message: "Offline: Neural Link Severed" };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Audit this invoice manifest against current site stock.
      Invoice: "${invoiceText}"
      Current Stock: "${stockSummary}"`,
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
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { discrepancies: false, message: "Audit logic failure." };
  }
};

/**
 * Extracts Bill of Quantities from 2D drawings with strict Quantity Surveyor logic.
 */
export const extractBoqFromPlans = async (files: File[], chatHistory: any[] = []) => {
  try {
    const ai = getAiClient();
    if (!ai) return { boqItems: [], clarifications: [] };

    const systemInstruction = `
      You are a licensed Quantity Surveyor AI specialized in manual BOQ extraction from 2D construction drawings.
      
      OPERATING PRINCIPLES:
      ❌ No assumptions | ❌ No inferred dimensions | ❌ No default industry values | ❌ No estimation without drawing evidence
      ✅ Quantities ONLY from visible, labeled, dimensioned data
      ✅ Missing or ambiguous data → send to Clarification Console
      ✅ Follow IS 1200 methodology strictly.

      EXTRACTION WORKFLOW:
      1. Verify drawing metadata (Scale, Level, Type).
      2. Extract from Bottom to Top (Foundation -> RCC -> Masonry -> Finishing).
      3. Handle user requests from chat history to add or remove particulars from the existing BOQ.
      
      OUTPUT REQUIREMENTS:
      - JSON format only.
      - Return "boqItems" and "clarifications".
      - "boqItems" must include: itemNo, description, unit, calculation, quantity, drawingRef, status (Complete, Pending Clarification, Partial).
      - "clarifications" must include: id, item, missingInfo, drawingRef, impact.
    `;

    const parts: any[] = [{ text: "Extract IS-1200 compliant BOQ from these drawings based on your strict operating principles. Also consider the following conversation for adjustments to the BOQ." }];
    
    // Add chat history context
    if (chatHistory.length > 0) {
      parts.push({ text: `CHAT HISTORY CONTEXT: ${JSON.stringify(chatHistory)}` });
    }

    for (const file of files) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const reader = new FileReader();
        const base64 = await new Promise<string>(r => {
          reader.onloadend = () => r((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        parts.push({ 
          inlineData: { 
            data: base64, 
            mimeType: file.type.startsWith('image/') ? file.type : 'application/pdf' 
          } 
        });
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
                  itemNo: { type: Type.STRING },
                  description: { type: Type.STRING },
                  unit: { type: Type.STRING },
                  calculation: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  drawingRef: { type: Type.STRING },
                  status: { type: Type.STRING }
                }
              }
            },
            clarifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  item: { type: Type.STRING },
                  missingInfo: { type: Type.STRING },
                  drawingRef: { type: Type.STRING },
                  impact: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(result.text || '{"boqItems": [], "clarifications": []}');
  } catch (error) {
    console.error("BOQ Extraction Error:", error);
    return { boqItems: [], clarifications: [{ id: "ERR-1", item: "System", missingInfo: "Neural Mapping failed. API Timeout or Invalid Key.", drawingRef: "N/A", impact: "Total Block" }] };
  }
};

/**
 * Analyzes a site frame image for progress and compliance.
 */
export const analyzeSiteFrame = async (imageData: string, stage: ProjectStage, cameraName: string) => {
  const ai = getAiClient();
  if (!ai) return { visualAudit: "Offline", progressPercentage: 0 };
  
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [
          { text: `Analyze site frame for stage: ${stage}. Check for PPE compliance and IS-Code structural alignment.` }, 
          { inlineData: { mimeType: "image/jpeg", data: imageData.split(',')[1] } }
        ] 
      },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            visualAudit: { type: Type.STRING },
            progressPercentage: { type: Type.NUMBER },
            complianceStatus: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(result.text || '{}');
  } catch (error) {
    return { visualAudit: "Analysis Error", progressPercentage: 0 };
  }
};
