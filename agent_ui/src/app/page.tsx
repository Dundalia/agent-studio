'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getConversations, createConversation, addMessage, Conversation } from '@/lib/supabase';
import { sendMessage } from '@/lib/agent-api';
import ConversationList from '@/components/chat/conversation-list';
import ChatArea from '@/components/chat/chat-area';
import MessageInput from '@/components/chat/message-input';
import MobileMenuToggle from '@/components/chat/mobile-menu-toggle';

type SendMessageArgs = {
  agentName: string;
  message: string;
};

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      const data = await getConversations();
      setConversations(data);
    };

    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  // Updated to accept a single object argument
  const handleSendMessage = async ({ agentName, message }: SendMessageArgs) => {
    if (!message.trim() || isCreating) return;

    setIsCreating(true);

    try {
      // Create a new conversation with the message as the title
      const title = message.length > 30 ? `${message.substring(0, 30)}...` : message;
      const conversation = await createConversation(title);

      if (conversation) {
        // Add the message to the database immediately with a processing flag
        await addMessage(conversation.id, 'user', message);

        // Set a flag in localStorage to indicate this message is being processed
        localStorage.setItem(`processing_${conversation.id}`, 'true');

        // Start the API request but don't wait for it
        sendMessage(agentName, message, conversation.id).then(async (response) => {
          // Add the response to the database
          await addMessage(conversation.id, 'assistant', response.response);
          // Remove the processing flag
          localStorage.removeItem(`processing_${conversation.id}`);
        }).catch(error => {
          console.error('Error getting response:', error);
          localStorage.removeItem(`processing_${conversation.id}`);
        });

        // Navigate to the new conversation immediately
        router.push(`/chat/${conversation.id}`);

        // The API response will be handled in the chat page when it loads
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation. Please try again.');
      setIsCreating(false);
    }
  };

  const handleNewConversation = () => {
    // Already on the new conversation page
  };

  const handleConversationDeleted = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen relative">
      {/* Mobile menu toggle button */}
      <MobileMenuToggle
        isOpen={isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Overlay for mobile when menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <ConversationList
        conversations={conversations}
        onNewConversation={handleNewConversation}
        onConversationDeleted={handleConversationDeleted}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col w-full">
        <div className="backdrop-blur-sm p-4 border-b border-stone-900 flex items-center sticky top-0 z-10 bg-stone-950/80">
          <div className="md:hidden w-10 mr-3"></div> {/* Spacer for mobile to align with toggle button */}
          <h1 className="text-xl font-semibold text-stone-400">New Conversation</h1>
        </div>

        <ChatArea messages={[]} />

        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isCreating}
        />
      </div>
    </div>
  );
}
