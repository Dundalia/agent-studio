'use client';

import { Message } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

type MessageItemProps = {
  message: Message;
};

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  const formattedTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-2 ${
          isUser ? 'bg-stone-800 text-stone-300' : 'bg-stone-800/40 text-stone-400'
        }`}
      >
        <div className="markdown-content">
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <div className={`text-xs mt-1 ${isUser ? 'text-stone-200' : 'text-gray-400'}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
}

