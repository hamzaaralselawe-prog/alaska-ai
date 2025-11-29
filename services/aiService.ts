import { GoogleGenAI, Chat, GenerateContentResponse, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: Chat | null = null;

export const initializeChat = () => {
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
};

export const sendMessageToAlaska = async (
  message: string, 
  imageBase64: string | undefined,
  pdfBase64: string | undefined,
  onStream: (chunk: string) => void
): Promise<string> => {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session.");
  }

  try {
    let resultStream;
    const parts: any[] = [];

    // Add Image if present
    if (imageBase64) {
      const match = imageBase64.match(/^data:(.*?);base64,(.*)$/);
      const mimeType = match ? match[1] : 'image/jpeg';
      const data = match ? match[2] : imageBase64;
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: data
        }
      });
    }

    // Add PDF if present
    if (pdfBase64) {
      const match = pdfBase64.match(/^data:(.*?);base64,(.*)$/);
      const mimeType = match ? match[1] : 'application/pdf';
      const data = match ? match[2] : pdfBase64;
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: data
        }
      });
    }

    // Add Text
    parts.push({ text: message });

    // Send message
    resultStream = await chatSession.sendMessageStream({ 
      message: parts 
    });
    
    let fullResponse = "";
    
    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      const text = c.text;
      if (text) {
        fullResponse += text;
        onStream(text);
      }
    }
    
    return fullResponse;
  } catch (error) {
    console.error("Error communicating with Alaska AI:", error);
    throw error;
  }
};

// Helper to convert Base64 PCM to WAV Base64
const addWavHeader = (base64PCM: string): string => {
  const binaryString = atob(base64PCM);
  const len = binaryString.length;
  const buffer = new ArrayBuffer(44 + len);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + len, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count (1)
  view.setUint16(22, 1, true);
  // sample rate (24000)
  view.setUint32(24, 24000, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, 24000 * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, len, true);

  // Write PCM data
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < len; i++) {
    bytes[44 + i] = binaryString.charCodeAt(i);
  }

  // Convert back to base64
  let binary = '';
  const bytesLength = bytes.byteLength;
  for (let i = 0; i < bytesLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

export const generateSpeechFromText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Female voice
          },
        },
      },
    });

    const base64PCM = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (base64PCM) {
      // Convert raw PCM to WAV container to ensure browser playback compatibility
      return addWavHeader(base64PCM);
    }
    return "";
  } catch (error) {
    console.error("Error generating speech:", error);
    return "";
  }
};