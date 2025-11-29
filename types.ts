export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 data string
  pdf?: string; // Base64 data string for PDF
  audio?: string; // Base64 data string for TTS audio
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}