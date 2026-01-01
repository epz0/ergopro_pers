import React, { useEffect, useRef } from 'react';
import { Message, MessageRole, Persona } from '../types';

interface MessageListProps {
  messages: Message[];
  currentPersona: Persona;
  isTyping: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentPersona, isTyping }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {messages.map((msg) => {
        const isUser = msg.role === MessageRole.User;
        return (
          <div
            key={msg.id}
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] sm:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`
                w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white font-bold shadow-sm mt-1
                ${isUser ? 'bg-slate-600' : currentPersona.avatarColor}
              `}>
                {isUser ? 'ME' : currentPersona.name.substring(0, 2).toUpperCase()}
              </div>

              {/* Bubble */}
              <div className={`
                p-4 rounded-2xl shadow-sm text-sm sm:text-base leading-relaxed whitespace-pre-wrap
                ${isUser 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }
              `}>
                 <div className={`text-xs mb-1 font-bold opacity-70 ${isUser ? 'text-blue-100 text-right' : 'text-slate-500'}`}>
                    {isUser ? 'You' : currentPersona.name}
                 </div>
                 {msg.text}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing Indicator */}
      {isTyping && (
        <div className="flex w-full justify-start">
          <div className="flex gap-3">
             <div className={`
                w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-white font-bold shadow-sm mt-1
                ${currentPersona.avatarColor}
              `}>
                {currentPersona.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 h-12">
                <span className="block w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="block w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="block w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} className="h-1" />
    </div>
  );
};

export default MessageList;