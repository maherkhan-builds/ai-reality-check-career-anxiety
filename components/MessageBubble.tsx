import React from 'react';
import { Message, MessageRole } from '../types';

interface MessageBubbleProps {
  message: Message;
}

/**
 * A reusable component to display a single chat message, styled differently based on the sender's role.
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;

  // Conditional styling based on the message sender
  const bubbleClasses = isUser
    ? "bg-blue-600 text-white self-end rounded-br-none" // User messages on the right, blue
    : "bg-gray-200 text-gray-800 self-start rounded-bl-none"; // Model messages on the left, light gray

  const containerClasses = isUser ? "justify-end" : "justify-start";

  return (
    <div className={`flex w-full ${containerClasses} mb-4`}>
      <div
        className={`max-w-[75%] p-4 rounded-xl shadow-sm break-words ${bubbleClasses}`}
      >
        <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs text-right opacity-70 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
