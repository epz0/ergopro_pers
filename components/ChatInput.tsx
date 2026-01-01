import React, { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  personaName: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, personaName }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      setText('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-slate-200">
      <div className="max-w-4xl mx-auto flex gap-2 sm:gap-4 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${personaName}...`}
            disabled={isLoading}
            maxLength={2000}
            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-slate-700 placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            {text.length}/2000
          </div>
        </div>
        
        <button
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className={`
            p-3.5 rounded-xl flex items-center justify-center transition-all duration-200
            ${!text.trim() || isLoading 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95'
            }
          `}
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
      <div className="max-w-4xl mx-auto mt-2 text-center">
         <p className="text-[10px] text-slate-400">
            AI can make mistakes. Please verify important information.
         </p>
      </div>
    </div>
  );
};

export default ChatInput;