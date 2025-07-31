"""
Simple LangGraph agent using DeepSeek-V3-0324 model with in-conversation memory.
"""
import os
import sys
from typing import Dict, List, Tuple, Any, Optional, TypedDict, Annotated
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from langchain_community.chat_models import ChatDeepInfra
from dotenv import load_dotenv

# Add the parent directory to sys.path to make imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Load environment variables
load_dotenv()

# Get API key from environment
DEEPINFRA_API_KEY = os.getenv("DEEPINFRA_API_TOKEN")

# Check if API key is available
if not DEEPINFRA_API_KEY:
    raise ValueError("DEEPINFRA_API_TOKEN environment variable is not set. Please set it in the .env file.")

# Define the state
class AgentState(TypedDict):
    """State for the agent."""
    messages: Annotated[List[BaseMessage], add_messages]

# Initialize the Chat model
llm = ChatDeepInfra(
    model="deepseek-ai/DeepSeek-V3-0324",
    deepinfra_api_token=DEEPINFRA_API_KEY,
    model_kwargs={
        "temperature": 0.7,
        "max_tokens": 1000
    }
)

# Define the agent nodes
def chat_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Process the chat input and generate a response."""
    messages = state["messages"]

    # Get response from LLM
    response = llm.invoke(messages)

    # Add the response to the messages
    state["messages"].append(response)

    return state

# Build the graph
def build_agent_graph():
    """Build the agent graph."""
    # Initialize the graph
    workflow = StateGraph(AgentState)

    # Add the chat node
    workflow.add_node("chat", chat_node)

    # Set the entry point
    workflow.set_entry_point("chat")

def chat_agent(chat_history, query):
    """
    Entry point for the meta agent.
    chat_history: list of {"role": "user"/"assistant"/"system", "content": ...}
    query: user input string
    Returns: (result, updated_chat_history)
    """
    # Convert chat_history (list of dicts) to list of BaseMessage
    messages = []
    for msg in chat_history:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))
        elif msg["role"] == "system":
            messages.append(SystemMessage(content=msg["content"]))
    
    # Add the new user query
    messages.append(HumanMessage(content=query))

    # --- DEBUGGING ---
    print("\n--- Messages sent to LLM ---")
    for msg in messages:
        print(f"{type(msg).__name__}: {msg.content}")
    print("---------------------------\n")
    # --- END DEBUGGING ---

    # Get response from LLM
    response = llm.invoke(messages)
    
    # --- DEBUGGING ---
    print("\n--- Response received from LLM ---")
    print(f"{type(response).__name__}: {response.content}")
    print("--------------------------------\n")
    # --- END DEBUGGING ---

    # Add the response to the messages
    messages.append(response)

    # Convert messages back to list of dicts for meta agent compatibility
    updated_history = []
    for msg in messages:
        if isinstance(msg, HumanMessage):
            updated_history.append({"role": "user", "content": msg.content})
        elif isinstance(msg, AIMessage):
            updated_history.append({"role": "assistant", "content": msg.content})
        elif isinstance(msg, SystemMessage):
            updated_history.append({"role": "system", "content": msg.content})

    return response.content, updated_history
