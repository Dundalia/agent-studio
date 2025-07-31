// Simple script to test the agent API directly
const fetch = require('node-fetch');

// Configuration - Update these with your actual values
const API_URL = 'https://your-agent-api-url.railway.app';
const API_KEY = 'your_api_key_here';

// Test the health endpoint
async function testHealth() {
  console.log('Testing health endpoint...');
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log('Health response:', data);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error.message);
    return false;
  }
}

// Test the chat endpoint
async function testChat() {
  console.log('\nTesting chat endpoint...');
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        message: 'Hello, how are you?'
      })
    });
    
    if (!response.ok) {
      console.error('Chat request failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('Chat response:', data);
    return true;
  } catch (error) {
    console.error('Chat request failed:', error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('=== API TEST SCRIPT ===');
  console.log(`API URL: ${API_URL}`);
  console.log(`API Key: ${API_KEY.substring(0, 4)}${'*'.repeat(API_KEY.length - 4)}\n`);
  
  const healthOk = await testHealth();
  if (healthOk) {
    console.log('✅ Health check passed');
  } else {
    console.log('❌ Health check failed');
  }
  
  const chatOk = await testChat();
  if (chatOk) {
    console.log('✅ Chat test passed');
  } else {
    console.log('❌ Chat test failed');
  }
}

runTests();
