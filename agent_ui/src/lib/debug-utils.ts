/**
 * Debug utilities for troubleshooting API communication issues
 */

// Log API requests with detailed information
export function logApiRequest(url: string, method: string, headers: Record<string, string>, body?: Record<string, unknown>) {
  console.group(`🔍 API Request: ${method} ${url}`);
  console.log('Headers:', headers);
  if (body) {
    console.log('Body:', body);
  }
  console.groupEnd();
}

// Log API responses with detailed information
export function logApiResponse(url: string, status: number, statusText: string, data: Record<string, unknown>) {
  console.group(`📥 API Response: ${status} ${statusText} - ${url}`);
  console.log('Data:', data);
  console.groupEnd();
}

// Log API errors with detailed information
export function logApiError(url: string, error: Error | Record<string, unknown>) {
  console.group(`❌ API Error: ${url}`);
  console.error('Error:', error);
  console.groupEnd();
}

// Test the API connection and return detailed diagnostics
export async function testApiConnection(apiUrl: string, apiKey: string) {
  console.group('🔌 Testing API Connection');

  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await fetch(`${apiUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('Health response:', healthResponse.status, healthData);

    // Test chat endpoint
    console.log('Testing chat endpoint...');
    const chatResponse = await fetch(`${apiUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        message: 'Test message'
      })
    });

    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('Chat response:', chatResponse.status, chatData);
      console.log('✅ API connection test passed');
    } else {
      const errorText = await chatResponse.text();
      console.error('Chat request failed:', chatResponse.status, chatResponse.statusText);
      console.error('Error details:', errorText);
      console.log('❌ API connection test failed');
    }
  } catch (error) {
    console.error('API connection test failed:', error);
    console.log('❌ API connection test failed');
  }

  console.groupEnd();
}

// Enhanced version of the agent-api.ts sendMessage function with debugging
export async function debugSendMessage(apiUrl: string, apiKey: string, message: string, conversationId?: string) {
  const url = `${apiUrl}/chat`;
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey
  };
  const body = {
    message,
    conversation_id: conversationId
  };

  logApiRequest(url, 'POST', headers, body);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      logApiError(url, {
        status: response.status,
        statusText: response.statusText,
        details: errorText
      });
      throw new Error(`Failed to send message: ${errorText}`);
    }

    const data = await response.json();
    logApiResponse(url, response.status, response.statusText, data);
    return data;
  } catch (error) {
    logApiError(url, error instanceof Error ? error : { message: 'Unknown error', details: error });
    throw error;
  }
}
