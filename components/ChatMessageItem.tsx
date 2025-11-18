
import React, { useState } from 'react';
import { ChatMessage, MessageAuthor } from '../types';
import { textToSpeech } from '../services/geminiService';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ChatMessageItemProps {
  message?: ChatMessage;
  isLoading?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, isLoading }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isBot = isLoading || message?.author === MessageAuthor.BOT;

  const handleSpeak = async () => {
    if (!message || isSpeaking) return;
    setIsSpeaking(true);
    try {
      await textToSpeech(message.text);
    } catch (error) {
      console.error("Error playing audio:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const Icon = isBot ? BotIcon : UserIcon;
  const bgColor = isBot ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-500 text-white';
  const align = isBot ? 'justify-start' : 'justify-end';
  const rounded = isBot ? 'rounded-r-xl rounded-bl-xl' : 'rounded-l-xl rounded-br-xl';

  return (
    <div className={`flex items-start gap-3 ${align}`}>
      {isBot && <div className="w-8 h-8 flex-shrink-0 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center"><Icon className="w-5 h-5" /></div>}
      
      <div className={`max-w-xl p-3 text-left ${bgColor} ${rounded}`}>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <SpinnerIcon />
            <span>Thinking...</span>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none break-words">
              {message?.text}
          </div>
        )}
      </div>

      {!isLoading && isBot && (
        <button
          onClick={handleSpeak}
          disabled={isSpeaking}
          className="self-center text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 disabled:opacity-50 transition-colors"
        >
          {isSpeaking ? <SpinnerIcon /> : <SpeakerIcon className="w-5 h-5" />}
        </button>
      )}

      {!isBot && <div className="w-8 h-8 flex-shrink-0 bg-blue-600 rounded-full flex items-center justify-center"><Icon className="w-5 h-5 text-white" /></div>}
    </div>
  );
};
