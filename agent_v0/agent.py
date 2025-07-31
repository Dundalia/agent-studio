import sys
import os
import importlib

# Add the current directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def run_agent(agent_name, chat_history, query):
    """
    Dynamically import and run the agent from agents/{agent_name}/agent.py.
    Expects each agent to expose a function: chat_agent(chat_history, query)
    
    Args:
        agent_name: Name of the agent folder (e.g., "deepresearch_optimus_alpha")
        chat_history: List of message dicts with "role" and "content" keys, or None
        query: User query string
        
    Returns:
        Tuple of (response, updated_chat_history)
    """
    try:
        # Import the agent module
        agent_path = f"agents.{agent_name}.agent"
        agent_module = importlib.import_module(agent_path)
        
        # Check if the module has the chat_agent function
        if not hasattr(agent_module, "chat_agent"):
            raise AttributeError(f"Agent '{agent_name}' does not expose a 'chat_agent' function")
        
        # Ensure chat_history is a list, even if None is passed
        history_to_pass = chat_history if chat_history is not None else []
        
        # Call the agent's chat_agent function
        return agent_module.chat_agent(history_to_pass, query)
    
    except ImportError as e:
        print(f"Error: Could not import agent '{agent_name}'. Make sure the folder exists in agents/")
        print(f"Available agents: {', '.join(os.listdir(os.path.join(os.path.dirname(__file__), 'agents')))}")
        raise e
    except Exception as e:
        print(f"Error running agent '{agent_name}': {e}")
        raise e

if __name__ == "__main__":
    print("Available agents:")
    agents_dir = os.path.join(os.path.dirname(__file__), "agents")
    agents = [d for d in os.listdir(agents_dir) 
              if os.path.isdir(os.path.join(agents_dir, d)) and not d.startswith('__')]
    for i, agent in enumerate(agents, 1):
        print(f"{i}. {agent}")
    
    agent_name = input("\nEnter agent name or number: ")
    
    # Convert number to agent name if needed
    if agent_name.isdigit() and 1 <= int(agent_name) <= len(agents):
        agent_name = agents[int(agent_name) - 1]
    
    query = input("Enter your query: ")
    
    print(f"\nRunning {agent_name} agent...\n")
    result, _ = run_agent(agent_name, [], query) # Pass empty list for initial history
    
    print("\nAgent response:\n")
    print(result)