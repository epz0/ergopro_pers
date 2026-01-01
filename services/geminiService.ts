import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, MessageRole, Persona } from '../types';
import { GLOBAL_CONTEXT, GUARDRAILS, MAX_OUTPUT_TOKENS } from '../constants';

// Initialize the API client
// Note: In a real production app, ensure the key is loaded from a secure source.
// This demo assumes process.env.API_KEY is populated.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Constructs the system instruction based on the persona.
 */
const createSystemInstruction = (persona: Persona): string => {
  return `
    ${GUARDRAILS}
    
    GLOBAL CONTEXT:
    ${GLOBAL_CONTEXT}

    YOUR IDENTITY:
    Name: ${persona.name}
    Role: ${persona.role}
    Traits: ${persona.traits.join(', ')}

    YOUR SPECIFIC KNOWLEDGE & PAINS:
    ${persona.description}

    INSTRUCTIONS:
    - Speak naturally in Portuguese or English (match the user's language), but the context is Brazil.
    - Adopt your traits in every response.
    - STRICTLY LIMIT INFORMATION SHARING:
      - Do NOT list multiple problems or facts in a single response.
      - Share only ONE piece of information or ONE specific problem at a time.
      - Wait for the interviewer (user) to ask follow-up questions before providing more details.
      - If asked "what are the problems?", mention the most pressing one and stop. Do not provide a bulleted list unless explicitly asked for a list.
      - Be concise and conversational, like a real worker being interviewed who doesn't want to overwhelm the interviewer.
    - Focus on the ergonomics, the room, the work process, and the interactions with others.
  `;
};

/**
 * Maps internal message structure to Gemini API Content structure.
 */
const mapMessagesToContent = (messages: Message[]): Content[] => {
  return messages.map((msg) => {
    const part: Part = { text: msg.text };
    return {
      role: msg.role === MessageRole.User ? 'user' : 'model',
      parts: [part],
    };
  });
};

/**
 * Sends a message to the Gemini model with the context of a specific persona.
 */
export const sendMessageToPersona = async (
  persona: Persona,
  history: Message[],
  userMessage: string
): Promise<string> => {
  try {
    const systemInstruction = createSystemInstruction(persona);
    
    // Prepare conversation history (excluding the current user message which is added by the call)
    // We filter out any empty messages just in case
    const validHistory = history.filter(h => h.text.trim() !== '');
    const contents = mapMessagesToContent(validHistory);

    // Add the new user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.7, // Moderate creativity for realistic dialogue
      },
      contents: contents,
    });

    return response.text || "I'm sorry, I lost my train of thought. Can you repeat that?";
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    throw new Error("Failed to get response from the persona.");
  }
};