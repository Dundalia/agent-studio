'use client';

import { useRef, useEffect } from 'react';
import { Message } from '@/lib/supabase';
import MessageItem from './message-item';

type ChatAreaProps = {
  messages: Message[];
  isLoading?: boolean;
};

export default function ChatArea({ messages, isLoading = false }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-4 pb-24 overflow-y-auto bg-stone-950 flex flex-col items-center">
      <div className="w-full max-w-4xl">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <h3 className="text-3xl font-semibold mt-24 text-stone-300">What can I help with?</h3>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="max-w-[80%] rounded-lg px-3 py-1.5 bg-stone-800/30 text-gray-100 backdrop-blur-sm">
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-stone-300 to-stone-500 animate-pulse opacity-70" style={{ animationDelay: '0ms', animationDuration: '1.2s' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-stone-300 to-stone-500 animate-pulse opacity-80" style={{ animationDelay: '300ms', animationDuration: '1.2s' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-stone-300 to-stone-500 animate-pulse opacity-90" style={{ animationDelay: '600ms', animationDuration: '1.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </>
      )}
      </div>
    </div>
  );
}
