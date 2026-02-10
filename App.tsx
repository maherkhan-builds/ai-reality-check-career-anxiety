import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GeminiService } from './services/geminiService';
import { Message, MessageRole } from './types';
import MessageBubble from './components/MessageBubble';

/**
 * Generates a unique ID for messages.
 */
const generateId = (): string => Math.random().toString(36).substring(2, 9);

/**
 * The main application component for AI Reality Check.
 * Manages user input, AI responses, and displays the conversation history.
 */
const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to keep the chat scrolled to the bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Scrolls to the bottom of the messages container.
   */
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effect to scroll to bottom whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Handles the reframing process: sends user input to Gemini and adds responses to history.
   */
  const handleReframing = useCallback(async () => {
    if (!userInput.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);
    const userMessage: Message = {
      id: generateId(),
      role: MessageRole.USER,
      content: userInput.trim(),
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setUserInput(''); // Clear input immediately

    try {
      const aiResponseContent = await GeminiService.reframeAnxiety(userMessage.content);
      const aiMessage: Message = {
        id: generateId(),
        role: MessageRole.MODEL,
        content: aiResponseContent,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (e: unknown) {
      console.error('Reframing failed:', e);
      setError(
        e instanceof Error
          ? e.message
          : 'An unexpected error occurred while reframing your anxiety.',
      );
      // Add an error message from the model's perspective if the call failed
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: generateId(),
          role: MessageRole.MODEL,
          content: `Oops! I encountered an issue: ${
            e instanceof Error ? e.message : 'Unknown error.'
          } Please try again.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading]); // Only recreate if userInput or isLoading changes

  /**
   * Clears all messages from the conversation history.
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Handles key presses in the textarea, allowing Enter to submit.
   */
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent new line
        handleReframing();
      }
    },
    [handleReframing],
  );

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-lg md:rounded-lg overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 shadow-md flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center">
          <svg
            className="w-7 h-7 mr-3 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1m-1.636 6.364l-.707-.707M12 20v-1m-6.364-1.636l-.707-.707M3 12H4m1.636-6.364l.707-.707M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2zM9 9h6a2 2 0 012 2v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2a2 2 0 012-2z"
            ></path>
          </svg>
          AI Reality Check
        </h1>
        <button
          onClick={clearHistory}
          className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md text-sm transition-colors duration-200"
          title="Clear Conversation History"
        >
          Clear
        </button>
      </header>

      {/* Main Content Area - Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <svg
              className="w-16 h-16 mb-4 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1m-1.636 6.364l-.707-.707M12 20v-1m-6.364-1.636l-.707-.707M3 12H4m1.636-6.364l.707-.707M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2zM9 9h6a2 2 0 012 2v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2a2 2 0 012-2z"
              ></path>
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Welcome to AI Reality Check!
            </h2>
            <p className="max-w-prose">
              Feeling anxious about AI news and your career? Share what's on your mind or
              paste an article snippet, and I'll help you reframe it with a realistic and
              supportive perspective.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Type your thoughts below to get started.
            </p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-800 p-4 rounded-xl rounded-bl-none shadow-sm animate-pulse">
              <p className="text-sm md:text-base">AI is thinking...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-start mb-4">
            <div className="bg-red-100 text-red-700 p-4 rounded-xl rounded-bl-none shadow-sm border border-red-300">
              <p className="text-sm md:text-base font-medium">Error:</p>
              <p className="text-sm md:text-base">{error}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
      </main>

      {/* Input Area (Sticky Footer) */}
      <footer className="bg-gray-100 p-4 border-t border-gray-200 sticky bottom-0 z-10">
        <div className="flex items-center space-x-3">
          <textarea
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-16 md:h-20 text-gray-900 placeholder-gray-500 text-sm md:text-base"
            placeholder="Type your AI-related anxiety or news snippet here... (Shift+Enter for new line, Enter to send)"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            rows={1}
            maxLength={1000} // Set a reasonable max length for input
          />
          <button
            onClick={handleReframing}
            disabled={isLoading || !userInput.trim()}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'Reframe'
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
