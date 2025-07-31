"""
Simple script to test the agent directly.
"""
from agent import run_agent

def main():
    """Run a simple test conversation with the agent."""
    print("Testing the DeepSeek-V3-0324 LangGraph agent...")
    
    # First message
    query = "Hello! I' Davide I am 27"
    print(f"\nUser: {query}")
    response, messages = run_agent(query)
    print(f"Agent: {response}")
    
    # Follow-up question to test memory
    query = "How old am I?"
    print(f"\nUser: {query}")
    response, messages = run_agent(query, messages)
    print(f"Agent: {response}")
    
if __name__ == "__main__":
    main()
