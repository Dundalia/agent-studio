# LangGraph Agent with DeepSeek-V3-0324

## Overview

This project implements a simple but powerful LangGraph agent using the DeepSeek-V3-0324 model with in-conversation memory. The agent is deployed as a RESTful API with authentication, allowing it to be easily integrated with frontend applications.

### Key Features

- **LangGraph Framework**: Uses LangGraph for agent orchestration
- **DeepSeek-V3-0324 Model**: Leverages a powerful large language model
- **Conversation Memory**: Maintains context across multiple messages
- **API Authentication**: Secures endpoints with API key authentication
- **Cloud Deployment**: Ready for deployment on Railway

## Project Structure

```
agent_v0/
├── agent.py            # Core LangGraph agent implementation
├── api.py              # FastAPI application with endpoints
├── main.py             # Entry point for running the API
├── .env                # Environment variables (API keys)
├── requirements.txt    # Dependencies
├── Dockerfile          # For containerized deployment
├── railway.json        # Railway deployment configuration
├── test_api.py         # Script to test the API
├── test_api_with_auth.py # Script to test with authentication
├── test_deployed_api.py # Script to test deployed API
├── test_page.html      # HTML page for browser-based testing
├── api_url.txt         # Stores the deployed API URL
└── README.md           # This documentation
```

## Setup and Installation

### Prerequisites

- Python 3.10+
- pip (Python package manager)
- API keys from the required services:
  - DeepInfra (for DeepSeek model)
  - OpenRouter (for Optimus-Alpha model)
  - Tavily (for web search capabilities)

### Local Setup

1. Clone the repository or navigate to the project directory

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your actual API keys.

## Running the Agent

### Test the Agent Directly

To test the agent without starting the API server:
```bash
python run_test.py
```

### Run the API Locally

Start the API server:
```bash
python main.py
```
or
```bash
./start_api.sh
```

The API will be available at `http://localhost:8000`.

## Deployment

### Current Deployment

The API can be deployed to platforms like Railway or other cloud providers.

Example deployment URL format:
```
https://your-project-name.up.railway.app
```

API Key: Use your own secure API key

### Deploy to Railway

1. Install the Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Deploy the application:
```bash
railway up
```

4. Set environment variables in the Railway dashboard:
   - `DEEPINFRA_API_TOKEN`: Your DeepInfra API token
   - `API_KEY`: Your API key for authentication (use a secure random string)
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `TAVILY_API_KEY`: Your Tavily API key

5. The deployment will continue running in the cloud even after you close your terminal

### Security Considerations

⚠️ **Important**: 
- Never commit your `.env` file with real API keys to version control
- Use strong, randomly generated API keys for production
- Regularly rotate your API keys
- Monitor your API usage to detect any unauthorized access
- Consider implementing rate limiting for production deployments

### Docker Deployment

Alternatively, you can deploy using Docker:

1. Build the Docker image:
```bash
docker build -t langgraph-agent .
```

2. Run the Docker container:
```bash
docker run -p 8000:8000 langgraph-agent
```

## Testing the API

### Testing the Deployed API

1. Using the test script:
```bash
python test_deployed_api.py
```

2. Using the browser-based test page:
```bash
./open_test_page.sh
```
or
```bash
open test_page.html
```

### Testing Locally

1. Test with authentication:
```bash
python test_api_with_auth.py
```

2. Using curl:
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{"message": "Hello! Who are you?"}'
```

3. Test the health check endpoint:
```bash
curl http://localhost:8000/health
```

## API Reference

### Authentication

All endpoints except `/health` require API key authentication.
Include the API key in the `X-API-Key` header:

```
X-API-Key: your_api_key_here
```

### Endpoints

#### GET /health
Health check endpoint (no authentication required).

Response:
```json
{
  "status": "ok",
  "message": "API is running"
}
```

#### POST /chat
Send a message to the agent.

Request body:
```json
{
  "message": "Your message here",
  "conversation_id": "optional_conversation_id"
}
```

Response:
```json
{
  "response": "Agent's response",
  "conversation_id": "conversation_id"
}
```

#### DELETE /conversations/{conversation_id}
Delete a conversation by ID.

Response:
```json
{
  "status": "success",
  "message": "Conversation {conversation_id} deleted"
}
```

## Frontend Integration

### Next.js Integration

To integrate with a Next.js frontend:

1. Set up environment variables in your Next.js project:
```
NEXT_PUBLIC_API_URL=https://your-agent-api-url.railway.app
NEXT_PUBLIC_API_KEY=your_api_key_here
```

2. Make fetch requests to the API:
```javascript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
  },
  body: JSON.stringify({
    message: userMessage,
    conversation_id: conversationId // Optional
  })
});

const data = await response.json();
console.log(data.response);
```

## Troubleshooting

### Common Issues

1. **API Key Authentication Failure**:
   - Ensure you're including the correct API key in the `X-API-Key` header
   - Check that the API key matches the one in the `.env` file or Railway environment variables

2. **DeepInfra API Issues**:
   - Verify your DeepInfra API token is correct
   - Check that you have sufficient credits on your DeepInfra account
   - Ensure the model ID is correct and available on DeepInfra

3. **Slow Response Times**:
   - The first request may take longer as the model is loaded
   - Subsequent requests should be faster

## Future Improvements

1. **Database Integration**: Replace in-memory conversation storage with a database
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Enhanced Security**: Add more robust authentication mechanisms
4. **Monitoring**: Add logging and monitoring for production use
5. **Model Optimization**: Fine-tune the model for specific use cases

## License

MIT