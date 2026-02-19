
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SimplifyResult } from "../types";

export const apiKey = process.env.API_KEY;

// Initialize the client
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export interface SimplificationInput {
  text?: string;
  file?: {
    mimeType: string;
    data: string; // base64 string
  }
}

export const simplifyLegalContent = async (input: SimplificationInput): Promise<SimplifyResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const modelId = "gemini-2.5-flash"; 

  const systemInstruction = `
    You are an expert legal advisor. Your task is to analyze the provided legal document and output a structured response in JSON format.

    INPUT PROCESSING:
    - If an image or PDF is provided: First, accurately EXTRACT the full text from the document verbatim. Put this in the 'extractedText' field. Then analyze this text.
    - If raw text is provided: You may leave 'extractedText' empty or null, and analyze the provided text directly.

    ANALYSIS OUTPUT (JSON):
    1. "extractedText": The verbatim text extracted from the document (if a file was provided).
    2. "summary": A concise explanation of what this document is about, written in simple English (Grade 5 reading level).
    3. "keyClauses": Identify the 3-5 most critical clauses (like Termination, Payment, Liability, Non-Compete). For each, provide the original clause name (or a brief title) and rewrite it in plain, simple language.
    4. "redFlags": Identify any risky, unfair, or aggressive terms that the user should be wary of. These must be highlighted urgently.

    If the content is not a legal document or is unreadable, return a summary stating that it does not appear to be valid.
  `;

  // Prepare contents based on input type
  let parts = [];
  
  if (input.file) {
    parts = [
      { text: "Analyze this image/PDF of a legal document. Extract the text accurately and then immediately perform the simplification analysis." },
      { 
        inlineData: {
          mimeType: input.file.mimeType,
          data: input.file.data
        } 
      }
    ];
  } else if (input.text) {
    parts = [
      { text: `Please simplify the following legal text:\n\n"""\n${input.text}\n"""` }
    ];
  } else {
    throw new Error("No text or file provided.");
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: parts,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedText: { type: Type.STRING, description: "The OCR extracted text from the file, if applicable." },
            summary: { type: Type.STRING },
            keyClauses: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  clause: { type: Type.STRING, description: "The name or title of the clause" },
                  explanation: { type: Type.STRING, description: "Plain English rewrite of the clause" }
                },
                required: ["clause", "explanation"]
              } 
            },
            redFlags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
          },
          required: ["summary", "keyClauses", "redFlags"],
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response received from Gemini.");
    }

    return JSON.parse(responseText) as SimplifyResult;

  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw error;
  }
};

// Text to Speech Service
export const generateTTS = async (text: string): Promise<string> => {
    if (!apiKey) throw new Error("API Key is missing");

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is usually a good neutral voice
              },
          },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("Failed to generate audio");
    }
    return base64Audio;
}

// Chat Service with RAG
export const createChatSession = (documentContext?: string) => {
  let systemInstruction = 'You are a helpful and knowledgeable legal assistant named "LegalEase Bot". You help users understand Indian law, legal terms, and document structures. Keep answers concise, friendly, and easy to understand. Do not provide binding legal advice, always recommend a professional lawyer for serious matters.';

  if (documentContext) {
    systemInstruction += `\n\n=== RAG CONTEXT (ACTIVE DOCUMENT) ===\nThe user is currently viewing a specific legal document. You MUST use the content below to answer their questions. \n\n${documentContext}\n\nINSTRUCTIONS FOR RAG:\n1. ANSWER BASED ON CONTEXT: If the user asks about the document (e.g. "What is the termination period?", "Are there risks?"), you must retrieve the answer solely from the "Full Document Text" or "Previous Analysis" provided above.\n2. CITATIONS: When referring to specific terms, mention which clause they are found in if possible (e.g., "According to the Termination clause...").\n3. GENERAL KNOWLEDGE: If the user asks general legal questions unrelated to the document (e.g., "What is a contract?"), answer using your general knowledge but mention that this is general advice.\n4. NEUTRALITY: Point out facts, do not take sides.`;
  }

  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: systemInstruction,
    },
  });
};
