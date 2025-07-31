'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getConversation, getMessages, addMessage, deleteConversation, Message, Conversation } from '@/lib/supabase';
import { sendMessage } from '@/lib/agent-api';
import ConversationList from '@/components/chat/conversation-list';
import ChatArea from '@/components/chat/chat-area';
import MessageInput from '@/components/chat/message-input';
import { getConversations } from '@/lib/supabase';
import MobileMenuToggle from '@/components/chat/mobile-menu-toggle';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

type SendMessageArgs = {
  agentName: string;
  message: string;
};

export default function ChatPage({ params }: Props) {
  const unwrappedParams = params instanceof Promise ? use(params) : params;
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Reload conversations whenever the conversation ID changes
  useEffect(() => {
    const loadConversations = async () => {
      const data = await getConversations();
      setConversations(data);
    };

    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated, unwrappedParams.id]);

  // Load conversation and messages when ID changes
  useEffect(() => {
    const loadConversationAndMessages = async () => {
      if (!unwrappedParams.id) return;
      console.log("Loading conversation and messages for ID:", unwrappedParams.id);
      const conv = await getConversation(unwrappedParams.id);
      console.log("Fetched conversation:", conv);
      setConversation(conv);
      const msgs = await getMessages(unwrappedParams.id);
      console.log("Fetched messages:", msgs);
      setMessages(msgs);
    };
    loadConversationAndMessages();
  }, [unwrappedParams.id]);

  // Poll for assistant response if the last message is from the user and there is no assistant response
  useEffect(() => {
    if (!unwrappedParams.id) return;
    let checkInterval: NodeJS.Timeout | undefined;

    const shouldPoll =
      messages.length > 0 &&
      messages.length % 2 === 1 &&
      messages[messages.length - 1].role === 'user';

    if (shouldPoll) {
      setIsLoading(true);
      checkInterval = setInterval(async () => {
        const updatedMessages = await getMessages(unwrappedParams.id);
        if (updatedMessages.length > messages.length) {
          setMessages(updatedMessages);
          setIsLoading(false);
          if (checkInterval !== undefined) clearInterval(checkInterval);
        }
      }, 1000);
    }

    return () => {
      if (checkInterval !== undefined) clearInterval(checkInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unwrappedParams.id, messages]);

  // Restore handleSendMessage
  const handleSendMessage = async ({ agentName, message }: SendMessageArgs) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);

    try {
      console.log("ChatPage: handleSendMessage called with", agentName, message);
      const userMessage = await addMessage(unwrappedParams.id, 'user', message);
      if (userMessage) {
        setMessages((prev) => [...prev, userMessage]);
      }

      const agentResponse = await sendMessage(agentName, message, unwrappedParams.id);

      const assistantMessage = await addMessage(
        unwrappedParams.id,
        'assistant',
        agentResponse.response
      );

      if (assistantMessage) {
        setMessages((prev) => [...prev, assistantMessage]);
      }
      // Reload conversations after sending a message
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Robust: Await deletion and only update UI after success
  const handleConversationDeleted = async (id: string) => {
    const success = await deleteConversation(id);
    if (success) {
      setConversations((prev) => prev.filter((conv) => conv.id !== id));
      if (id === unwrappedParams.id) {
        router.push('/');
      }
    } else {
      alert('Failed to delete conversation. Please try again.');
      const data = await getConversations();
      setConversations(data);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // Fallback UI if conversation is not found
  if (!conversation) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-950 text-stone-300">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Conversation not found</h2>
          <p className="mb-4">The selected conversation does not exist or was deleted.</p>
          <button
            className="px-4 py-2 bg-stone-800 rounded text-white hover:bg-stone-700"
            onClick={() => router.push('/')}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative">
      {/* ... */}
      <ConversationList
        conversations={conversations}
        currentId={unwrappedParams.id}
        onNewConversation={() => router.push('/')}
        onConversationDeleted={handleConversationDeleted}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      {/* ... */}
      <div className="flex-1 flex flex-col w-full">
        <div className="backdrop-blur-sm p-4 border-b border-stone-900 flex items-center sticky top-0 z-10 bg-stone-950/80">
          <div className="md:hidden w-10 mr-3"></div>
          <h1 className="text-xl backdrop-blur-sm font-normal text-center font-semibold truncate text-stone-300">
            {conversation ? conversation.title : 'Loading...'}
          </h1>
        </div>
        <ChatArea messages={messages} isLoading={isLoading} />
        <MessageInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
