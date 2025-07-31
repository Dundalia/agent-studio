"""
Test script for the LangGraph agent.
"""
from agent import run_agent

def test_agent():
    """Test the agent with a simple query."""
    query = "Hello, who are you?"
    response, messages = run_agent(query)
    
    print(f"Query: {query}")
    print(f"Response: {response}")
    
    # Test memory with a follow-up question
    follow_up = "What can you help me with?"
    response2, messages2 = run_agent(follow_up, messages)
    
    print(f"\nFollow-up: {follow_up}")
    print(f"Response: {response2}")

if __name__ == "__main__":
    test_agent()
