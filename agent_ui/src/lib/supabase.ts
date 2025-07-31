import { createClient } from '@supabase/supabase-js';

// Types for our database tables
export type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

// Create a single supabase client for the entire app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for database operations
export async function getConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return data || [];
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching conversation ${id}:`, error);
    return null;
  }

  return data;
}

export async function createConversation(title: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .insert([{ title }])
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return data;
}

export async function updateConversationTitle(id: string, title: string): Promise<boolean> {
  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', id);

  if (error) {
    console.error(`Error updating conversation ${id}:`, error);
    return false;
  }

  return true;
}

export async function deleteConversation(id: string): Promise<boolean> {
  // First delete all messages for this conversation
  const { error: msgError, data: msgData } = await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', id);

  console.log('deleteConversation: messages delete', { msgError, msgData });

  if (msgError) {
    alert(`Error deleting messages for conversation ${id}: ${msgError.message}`);
    console.error('deleteConversation: messages delete error', msgError);
    return false;
  }
  console.log('deleteConversation: messages delete success', msgData);

  // Then delete the conversation itself
  const { error: convError, data: convData } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id);

  console.log('deleteConversation: conversation delete', { convError, convData });

  if (convError) {
    alert(`Error deleting conversation ${id}: ${convError.message}`);
    console.error('deleteConversation: conversation delete error', convError);
    return false;
  }
  console.log('deleteConversation: conversation delete success', convData);

  alert('Conversation deleted successfully!');
  return true;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error);
    return [];
  }

  return data || [];
}

export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ conversation_id: conversationId, role, content }])
    .select()
    .single();

  if (error) {
    console.error(`Error adding message to conversation ${conversationId}:`, error);
    return null;
  }

  // Update the conversation's updated_at timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
}
