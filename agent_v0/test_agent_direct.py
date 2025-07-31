"""
Direct test script for the LangGraph agent.
This script bypasses the LangGraph framework and tests the model directly.
"""
import os
from dotenv import load_dotenv
from langchain_community.chat_models import ChatDeepInfra
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

# Load environment variables
load_dotenv()

# Get API key from environment
DEEPINFRA_API_KEY = os.getenv("DEEPINFRA_API_TOKEN")

# Initialize the Chat model
llm = ChatDeepInfra(
    model="deepseek-ai/DeepSeek-V3-0324",
    deepinfra_api_token=DEEPINFRA_API_KEY,
    model_kwargs={
        "temperature": 0.7,
        "max_tokens": 1000
    }
)

def main():
    """Test the agent directly."""
    print("Testing the DeepSeek-V3-0324 model directly...")
    
    # Create a conversation
    messages = [
        SystemMessage(content="You are a helpful AI assistant that provides accurate and concise information."),
    ]
    
    # First message
    user_message = "Hello! I'm Davide and I am 27 years old."
    print(f"\nUser: {user_message}")
    messages.append(HumanMessage(content=user_message))
    
    # Get response
    response = llm.invoke(messages)
    print(f"Agent: {response.content}")
    messages.append(response)
    
    # Follow-up question
    user_message = "How old am I?"
    print(f"\nUser: {user_message}")
    messages.append(HumanMessage(content=user_message))
    
    # Get response
    response = llm.invoke(messages)
    print(f"Agent: {response.content}")

if __name__ == "__main__":
    main()
