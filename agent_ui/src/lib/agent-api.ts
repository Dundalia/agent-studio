// Agent API client for interacting with the LangGraph agent
import { logApiRequest, logApiResponse, logApiError } from './debug-utils';

const API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL || '';
const API_KEY = process.env.NEXT_PUBLIC_AGENT_API_KEY || '';

export type ChatRequest = {
  agent_name: string;
  message: string;
  conversation_id?: string;
};

export type ChatResponse = {
  response: string;
  conversation_id: string;
};

export async function sendMessage(
  agent_name: string,
  message: string,
  conversationId?: string
): Promise<ChatResponse> {
  const url = `${API_URL}/chat`;
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  };
  const body: ChatRequest = {
    agent_name,
    message,
    conversation_id: conversationId,
  };

  // Log the request for debugging
  logApiRequest(url, 'POST', headers, body);
  console.log('sendMessage: payload', { agent_name, message, conversationId, body });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    // Get response text first for debugging
    const responseText = await response.text();
    console.log('Raw API response:', responseText);

    if (!response.ok) {
      logApiError(url, {
        status: response.status,
        statusText: response.statusText,
        details: responseText
      });
      throw new Error(`Failed to send message: ${responseText}`);
    }

    // Parse the response text
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing response JSON:', parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    // Log the response for debugging
    logApiResponse(url, response.status, response.statusText, data);
    return data;
  } catch (error) {
    console.error('Error sending message to agent:', error);
    if (error instanceof Error) {
      logApiError(url, error);
    } else {
      logApiError(url, { message: 'An unknown error occurred', details: error });
    }
    throw error;
  }
}

// Add the deleteAgentConversation export
export async function deleteAgentConversation(conversationId: string): Promise<boolean> {
  const url = `${API_URL}/conversations/${conversationId}`;
  const headers = {
    'X-API-Key': API_KEY,
  };
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete conversation: ${errorText}`);
    }
    return true;
  } catch (error) {
    console.error(`Error deleting agent conversation ${conversationId}:`, error);
    return false;
  }
}
