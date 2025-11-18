export interface SOPDocument {
  id: number;
  name: string;
  content: string; // For text, this is the text. For others, it's base64 data.
  mimeType: string;
}

export enum MessageAuthor {
  USER = 'user',
  BOT = 'bot',
}

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
}