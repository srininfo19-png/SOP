
import React, { useState, useCallback } from 'react';
import { SopManager } from './components/SopManager';
import { ChatWindow } from './components/ChatWindow';
import { SOPDocument, ChatMessage, MessageAuthor } from './types';
import { getChatResponse } from './services/geminiService';

const App: React.FC = () => {
  const [isAdmin] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('role') === 'admin';
  });

  const [sopDocs, setSopDocs] = useState<SOPDocument[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      author: MessageAuthor.BOT,
      text: isAdmin 
        ? "Hello Admin! I'm SOP Genius. Please upload your SOP documents, then ask me anything about them."
        : "Hello! I'm SOP Genius. How can I help you with our SOPs today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addSopDoc = (doc: SOPDocument) => {
    setSopDocs((prevDocs) => [...prevDocs, doc]);
  };

  const removeSopDoc = (id: number) => {
    setSopDocs((prevDocs) => prevDocs.filter((doc) => doc.id !== id));
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (isLoading || !text.trim()) return;

    const userMessage: ChatMessage = { author: MessageAuthor.USER, text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (sopDocs.length === 0) {
        const botMessage: ChatMessage = {
          author: MessageAuthor.BOT,
          text: isAdmin 
            ? "Please upload at least one SOP document before asking questions."
            : "I don't have any SOP documents to reference. Please contact an administrator.",
        };
        setMessages((prev) => [...prev, botMessage]);
        return;
      }
      
      const responseText = await getChatResponse(text, sopDocs);
      const botMessage: ChatMessage = { author: MessageAuthor.BOT, text: responseText };
      setMessages((prev) => [...prev, botMessage]);

    // FIX: Added curly braces to the catch block to correctly handle errors.
    } catch (error) {
      console.error("Error getting chat response:", error);
      const errorMessage: ChatMessage = {
        author: MessageAuthor.BOT,
        text: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sopDocs, isAdmin]);

  return (
    <div className="flex h-screen font-sans text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900">
      <div className="w-full h-full flex flex-col md:flex-row">
        <SopManager
          sopDocs={sopDocs}
          onAddSop={addSopDoc}
          onRemoveSop={removeSopDoc}
          isAdmin={isAdmin}
        />
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default App;
