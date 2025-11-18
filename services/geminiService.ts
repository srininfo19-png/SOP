import { GoogleGenAI, Modality, Part } from "@google/genai";
import { SOPDocument } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getChatResponse = async (userInput: string, sopDocs: SOPDocument[]): Promise<string> => {
  const model = 'gemini-2.5-pro'; // Upgraded model for better file processing
  const systemInstruction = `You are a helpful assistant for answering questions based ONLY on the provided Standard Operating Procedures (SOPs). Your role is to be precise and stick to the information given in the documents. If the answer cannot be found within the provided SOPs, you must state: "I cannot find the answer in the provided documents." Do not use any external knowledge or make assumptions.`;

  const sopParts: Part[] = sopDocs.flatMap(doc => {
    // Use flatMap to prepend a text part describing the file
    if (doc.mimeType.startsWith('text/')) {
        return [{ text: `--- SOP Document: ${doc.name} ---\n${doc.content}\n` }];
    } else {
        return [
            { text: `--- SOP Document: ${doc.name} ---` },
            { inlineData: { mimeType: doc.mimeType, data: doc.content } }
        ];
    }
  });

  const userQueryPart: Part = { text: `\n\n---\n\nBased on the documents provided, answer the following question:\n\nUser Question: ${userInput}` };

  const allParts: Part[] = [...sopParts, userQueryPart];
  
  const response = await ai.models.generateContent({
    model,
    contents: { parts: allParts },
    config: { systemInstruction }
  });

  return response.text;
};

// --- Text-to-Speech ---

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 24000
        });
    }
    return audioContext;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const textToSpeech = async (text: string): Promise<void> => {
    const model = 'gemini-2.5-flash-preview-tts';
    const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
        const ctx = getAudioContext();
        const audioBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();

        return new Promise(resolve => {
            source.onended = () => resolve();
        });
    } else {
        throw new Error("No audio data received from API.");
    }
};