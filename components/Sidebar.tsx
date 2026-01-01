import React from 'react';
import { PERSONAS } from '../constants';
import { Persona } from '../types';

interface SidebarProps {
  selectedPersonaId: string;
  onSelectPersona: (persona: Persona) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedPersonaId, onSelectPersona, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-full border-r border-slate-700 shadow-xl
      `}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-950">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent">
              ErgoPRO
            </h1>
            <p className="text-xs text-slate-400">Interviews Simulator</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Available Personas
          </div>
          <div className="space-y-1 px-2">
            {PERSONAS.map((persona) => (
              <button
                key={persona.id}
                onClick={() => {
                  onSelectPersona(persona);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`
                  w-full text-left p-3 rounded-lg transition-all duration-200 group
                  flex items-start gap-3
                  ${selectedPersonaId === persona.id 
                    ? 'bg-blue-600 shadow-lg shadow-blue-900/50' 
                    : 'hover:bg-slate-800'
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm
                  ${persona.avatarColor}
                `}>
                  {persona.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className={`font-medium truncate ${selectedPersonaId === persona.id ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                      {persona.name}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${selectedPersonaId === persona.id ? 'text-blue-200' : 'text-slate-400'}`}>
                    {persona.role}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="text-xs text-slate-500 text-center">
            Powered by OpenAI GPT-4o
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;