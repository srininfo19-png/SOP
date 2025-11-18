
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { ChatMessageItem } from './ChatMessageItem';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { SendIcon } from './icons/SendIcon';
import { MicIcon } from './icons/MicIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setInputText('');
      startListening();
    }
  };

  return (
    <div className="w-full md:w-2/3 lg:w-3/4 h-2/3 md:h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-grow p-4 md:p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <ChatMessageItem key={index} message={msg} />
          ))}
          {isLoading && <ChatMessageItem isLoading={true} />}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 md:gap-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? "Listening..." : "Ask a question about your SOPs..."}
            className="flex-grow bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || isListening}
          />
          {hasRecognitionSupport && (
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isLoading}
              className={`p-2 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              <MicIcon className="w-6 h-6" />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:dark:bg-blue-800 disabled:cursor-not-allowed transition-colors flex items-center justify-center w-24"
          >
            {isLoading ? <SpinnerIcon /> : <SendIcon className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};
