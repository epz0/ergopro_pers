export interface Persona {
  id: string;
  name: string;
  role: string;
  traits: string[];
  description: string;
  specificProblems: string[];
  avatarColor: string;
  initialMessage: string;
}

export enum MessageRole {
  User = 'user',
  Model = 'model',
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}

export interface ChatSession {
  personaId: string;
  messages: Message[];
}