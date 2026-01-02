import { Message, MessageRole, Persona } from '../types';
import { GLOBAL_CONTEXT, GUARDRAILS, MAX_OUTPUT_TOKENS } from '../constants';


const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
console.log(OPENAI_API_KEY);
const MODEL_NAME = 'gpt-4.1-nano';

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
      - Your first 2 or 3 responses should ONLY share general context about your work environment and role.
      - Only after the interviewer (user) asks specific questions about problems or pain points should you share those details.
      - Do NOT list multiple problems or facts in a single response.
      - Share only ONE piece of information or ONE specific problem at a time.
      - Wait for the interviewer (user) to ask follow-up questions before providing more details.
      - If asked "what are the problems?", ask for a clarification, then mention the most pressing one and stop. Do not provide a bulleted list unless explicitly asked for a list.
      - Be concise and conversational, like a real worker being interviewed who doesn't want to overwhelm the interviewer.
    - Focus on the ergonomics, the room, the work process, and the interactions with others.
  `;
};

/**
 * Maps internal message structure to OpenAI Message structure.
 */
const mapMessagesForOpenAI = (history: Message[], systemInstruction: string) => {
  const messages = [
    { role: 'system', content: systemInstruction }
  ];

  history.forEach(msg => {
    messages.push({
      role: msg.role === MessageRole.User ? 'user' : 'assistant',
      content: msg.text
    });
  });

  return messages;
};

/**
 * Sends a message to the OpenAI API with the context of a specific persona.
 */
export const sendMessageToPersona = async (
  persona: Persona,
  history: Message[],
  userMessage: string
): Promise<string> => {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API Key is missing.");
  }

  try {
    const systemInstruction = createSystemInstruction(persona);
    
    // Prepare conversation history
    const validHistory = history.filter(h => h.text.trim() !== '');
    
    // Create the full message list including the new user message
    const messages = mapMessagesForOpenAI(validHistory, systemInstruction);
    messages.push({ role: 'user', content: userMessage });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: messages,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API Error:", errorData);
      throw new Error(`OpenAI API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "I'm sorry, I lost my train of thought. Can you repeat that?";
    } catch (error: any) {
    console.error("Error communicating with OpenAI:", error);

    let errorMsg = "Failed to get response from the persona.";
    if (error instanceof Error) {
      errorMsg += ` Details: ${error.message}`;
    } else if (typeof error === 'string') {
      errorMsg += ` Details: ${error}`;
    } else if (error && typeof error === 'object') {
      errorMsg += ` Details: ${JSON.stringify(error)}`;
    }

    throw new Error(errorMsg);
    }
  };