import React, { useState, useEffect } from 'react';
import { PERSONAS, MAX_HISTORY_LENGTH } from './constants';
import { Persona, Message, MessageRole } from './types';
import Sidebar from './components/Sidebar';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import { sendMessageToPersona } from './services/openaiService';

const App: React.FC = () => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(PERSONAS[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize chat histories with welcome messages if empty
  useEffect(() => {
    const initialHistories: Record<string, Message[]> = {};
    PERSONAS.forEach(p => {
      initialHistories[p.id] = [{
        id: `init-${p.id}`,
        role: MessageRole.Model,
        text: p.initialMessage,
        timestamp: Date.now()
      }];
    });
    setChatHistories(prev => ({ ...initialHistories, ...prev }));
  }, []);

  const currentPersona = PERSONAS.find(p => p.id === selectedPersonaId) || PERSONAS[0];
  const currentMessages = chatHistories[selectedPersonaId] || [];

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersonaId(persona.id);
    setIsSidebarOpen(false);
    setError(null);
  };

  const handleClearChat = () => {
    if (window.confirm(`Clear chat history with ${currentPersona.name}?`)) {
      setChatHistories(prev => ({
        ...prev,
        [selectedPersonaId]: [{
          id: `new-${Date.now()}`,
          role: MessageRole.Model,
          text: currentPersona.initialMessage,
          timestamp: Date.now()
        }]
      }));
    }
  };

  const handleDownloadChat = () => {
    if (currentMessages.length === 0) return;
    
    const textContent = currentMessages.map(m => {
      const sender = m.role === MessageRole.User ? 'Interviewer' : currentPersona.name;
      const time = new Date(m.timestamp).toLocaleTimeString();
      return `[${time}] ${sender}: ${m.text}`;
    }).join('\n\n');

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ErgoPRO_Interview_${currentPersona.name}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    setError(null);
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: MessageRole.User,
      text: text,
      timestamp: Date.now()
    };

    // Update UI immediately with user message
    setChatHistories(prev => ({
      ...prev,
      [selectedPersonaId]: [...(prev[selectedPersonaId] || []), userMsg]
    }));

    setIsTyping(true);

    try {
      // Get context for API call (last N messages)
      const historyForContext = currentMessages.slice(-MAX_HISTORY_LENGTH);
      
      const responseText = await sendMessageToPersona(currentPersona, historyForContext, text);

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: MessageRole.Model,
        text: responseText,
        timestamp: Date.now()
      };

      setChatHistories(prev => ({
        ...prev,
        [selectedPersonaId]: [...(prev[selectedPersonaId] || []), aiMsg]
      }));

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get a response. Please check your connection or try again.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      <Sidebar 
        selectedPersonaId={selectedPersonaId}
        onSelectPersona={handleSelectPersona}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col h-full relative w-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div>
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                {currentPersona.name}
                <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {currentPersona.role}
                </span>
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={handleDownloadChat}
              className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
              title="Download Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
            
            <button 
              onClick={handleClearChat}
              className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
              title="Clear Chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </header>

        {/* Global Error Message */}
        {error && (
          <div className="absolute top-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-20 flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1 text-sm">{error}</div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
            </button>
          </div>
        )}

        {/* Chat Area */}
        <MessageList 
          messages={currentMessages}
          currentPersona={currentPersona}
          isTyping={isTyping}
        />

        {/* Input */}
        <ChatInput 
          onSendMessage={handleSendMessage}
          isLoading={isTyping}
          personaName={currentPersona.name}
        />
      </main>
    </div>
  );
};

export default App;