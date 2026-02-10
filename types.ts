/**
 * Represents the role of a message sender in a conversation.
 */
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

/**
 * Represents a single message in the conversation history.
 */
export interface Message {
  id: string; // Unique identifier for the message
  role: MessageRole; // The sender of the message (user or model)
  content: string; // The text content of the message
  timestamp: Date; // When the message was created
}
