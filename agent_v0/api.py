"""
FastAPI application to serve the LangGraph agent.
"""
import os
import secrets
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, Depends, Header, Security
from fastapi.security.api_key import APIKeyHeader, APIKey
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from agent import run_agent
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Key security
API_KEY = os.getenv("API_KEY", secrets.token_urlsafe(32))
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

# Print the API key if it was generated (for first-time setup)
if os.getenv("API_KEY") is None:
    print(f"\nGenerated API Key: {API_KEY}\n")
    print("Add this to your .env file as API_KEY=your_key_here")
    print("Also add it to your frontend environment variables")

async def get_api_key(api_key_header: str = Security(api_key_header)):
    """Validate API key."""
    if api_key_header == API_KEY:
        return api_key_header
    raise HTTPException(status_code=403, detail="Could not validate API key")

# Initialize FastAPI app
app = FastAPI(title="LangGraph Agent API", description="API for a simple LangGraph agent with DeepSeek-V3-0324 model")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request and response models
class ChatRequest(BaseModel):
    agent_name: str  # Name of the agent folder to use
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

# In-memory conversation storage
# In a production environment, this should be replaced with a database
conversations: Dict[str, List[BaseMessage]] = {}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, api_key: APIKey = Depends(get_api_key)):
    """
    Chat endpoint that processes user messages and returns AI responses.
    """
    agent_name = request.agent_name
    message = request.message
    conversation_id = request.conversation_id

    # Get or create conversation history
    chat_history = None
    if conversation_id and conversation_id in conversations:
        chat_history = conversations[conversation_id]

    # Generate response using the specified agent
    try:
        response, updated_history = run_agent(agent_name, chat_history, message)
    except ImportError as e:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found or could not be imported.")
    except AttributeError as e:
        raise HTTPException(status_code=500, detail=f"Agent '{agent_name}' is missing the required 'chat_agent' function.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

    # Create new conversation ID if needed
    if not conversation_id:
        conversation_id = os.urandom(8).hex()

    # Update conversation history
    conversations[conversation_id] = updated_history

    return ChatResponse(
        response=response,
        conversation_id=conversation_id
    )

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, api_key: APIKey = Depends(get_api_key)):
    """
    Delete a conversation by ID.
    """
    if conversation_id in conversations:
        del conversations[conversation_id]
        return {"status": "success", "message": f"Conversation {conversation_id} deleted"}
    else:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} not found")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
