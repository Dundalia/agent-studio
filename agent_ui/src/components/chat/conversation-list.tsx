'use client';

import Link from 'next/link';
import { Conversation } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { X } from 'lucide-react';

type ConversationListProps = {
  conversations: Conversation[];
  currentId?: string;
  onNewConversation: () => void;
  onConversationDeleted?: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
};

export default function ConversationList({
  conversations,
  currentId,
  onNewConversation,
  onConversationDeleted,
  isOpen = true,
  onClose,
}: ConversationListProps) {
  // Handle mobile link click to close sidebar
  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed md:static inset-y-0 left-0 w-64 bg-stone-900 text-white h-screen flex flex-col border-r border-stone-950 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
    >
      <div className="p-4 border-b border-stone-900 flex justify-between items-center sticky top-0 bg-stone-900 z-10">
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-stone-400 hover:text-stone-200"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <div className="flex-1"></div>
        <button
          onClick={onNewConversation}
          className="p-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-white"
          aria-label="New Conversation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">No conversations yet</div>
        ) : (
          <ul>
            {conversations.map((conversation) => (
              <li key={conversation.id} className="group flex items-center">
                <div className="flex flex-row items-center w-full">
                  <Link
                    href={`/chat/${conversation.id}`}
                    className={`block flex-1 min-w-0 p-3 hover:bg-stone-800 ${
                      currentId === conversation.id ? 'bg-stone-900' : ''
                    }`}
                    onClick={handleLinkClick}
                  >
                    <div className="flex justify-between items-center">
                      <div className="truncate max-w-[120px]">{conversation.title}</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                    </div>
                  </Link>
                  {onConversationDeleted && (
                    <button
                      className="ml-1 p-1 text-stone-400 hover:text-red-400 z-10"
                      aria-label="Delete conversation"
                      onClick={() => onConversationDeleted(conversation.id)}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
