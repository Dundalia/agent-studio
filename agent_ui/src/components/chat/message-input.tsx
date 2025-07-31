'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, ChevronDown, ChevronUp } from 'lucide-react';

const AVAILABLE_AGENTS = [
  { name: 'chat_deepseek_v3' },
  { name: 'deepresearch_optimus_alpha' },
];

type SendMessageArgs = {
  agentName: string;
  message: string;
};

type MessageInputProps = {
  onSendMessage: (args: SendMessageArgs) => void;
  disabled?: boolean;
};

export default function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(AVAILABLE_AGENTS[0].name);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      console.log("MessageInput: onSendMessage called with", { agentName: selectedAgent, message });
      onSendMessage({ agentName: selectedAgent, message });
      setMessage('');
    }
  };

  return (
    <div className="p-4 bg-stone-950 flex flex-col items-center sticky bottom-0 z-10 border-t border-stone-900">
      <form onSubmit={handleSubmit} className="w-full max-w-4xl flex flex-col gap-2 bg-stone-800 rounded-3xl">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask whatever"
          disabled={disabled}
          className="w-full p-4 bg-transparent text-stone-300 resize-none min-h-[50px] max-h-[150px] focus:outline-none placeholder-gray-300 border-0 rounded-xl border-stone-600 bg-stone-900"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (message.trim() && !disabled) {
                console.log("MessageInput: onSendMessage called with", { agentName: selectedAgent, message });
                onSendMessage({ agentName: selectedAgent, message });
                setMessage('');
              }
            }
          }}
        />

        <div className="flex items-center justify-between mt-1">
          <div className="relative">
            <button
              type="button"
              className="flex ml-4 items-center gap-1 px-2 py-1 rounded-full bg-stone-700 text-stone-300 bg-stone-700 hover:bg-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-600"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              <span className="font-mono text-xs">{selectedAgent}</span>
              {dropdownOpen ? (
                <ChevronUp size={16} className="ml-1" />
              ) : (
                <ChevronDown size={16} className="ml-1" />
              )}
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 bottom-10 mb-2 w-48 bg-stone-900 border border-stone-700 rounded-md shadow-lg z-20 origin-bottom animate-fade-in-up"
                   style={{ transform: 'translateY(-100%)' }}>
                {AVAILABLE_AGENTS.map((agent) => (
                  <button
                    key={agent.name}
                    className={`w-full text-left px-3 py-2 hover:bg-stone-800 text-stone-300 font-mono text-xs ${
                      agent.name === selectedAgent ? 'bg-stone-800' : ''
                    }`}
                    onClick={() => {
                      setSelectedAgent(agent.name);
                      setDropdownOpen(false);
                    }}
                  >
                    {agent.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="bg-transparent mr-2 mb-2 text-stone-500 p-2 rounded-full hover:bg-stone-800/40 focus:outline-none focus:ring-2 focus:ring-stone-600 flex items-center justify-center"
          >
            <img src="/send.svg" alt="Send" className="w-6 h-6 filter invert sepia hue-rotate-80 drop-shadow-[0_0_3px_rgba(74,222,128,0.7)]" />
          </button>
        </div>
      </form>
    </div>
  );
}
