// Test script for the agent API with CORS debugging
const fetch = require('node-fetch');
const https = require('https');

// Configuration - Update these with your actual values
const API_URL = 'https://your-agent-api-url.railway.app';
const API_KEY = 'your_api_key_here';

// Create an HTTPS agent that ignores SSL errors (for testing only)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Test the health endpoint
async function testHealth() {
  console.log('Testing health endpoint...');
  try {
    const response = await fetch(`${API_URL}/health`, {
      agent: httpsAgent,
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    
    // Log response headers for CORS debugging
    console.log('Response headers:');
    response.headers.forEach((value, name) => {
      console.log(`${name}: ${value}`);
    });
    
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
      agent: httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({
        message: 'Hello, how are you?'
      })
    });
    
    // Log response headers for CORS debugging
    console.log('Response headers:');
    response.headers.forEach((value, name) => {
      console.log(`${name}: ${value}`);
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
  console.log('=== API TEST SCRIPT WITH CORS DEBUGGING ===');
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
