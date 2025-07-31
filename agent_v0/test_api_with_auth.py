"""
Test script for the LangGraph agent API with authentication.
"""
import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API endpoint and key
API_URL = "http://localhost:8000/chat"
API_KEY = os.getenv("API_KEY", "your_api_key_here")
AGENT_NAME = "chat_deepseek_v3" # Agent to test

def test_api():
    """Test the API with a simple conversation."""
    # First message
    print("Testing the API with authentication...")

    # Headers with API key
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    }

    # First message
    payload = {
        "agent_name": AGENT_NAME,
        "message": "Hello! My name is Davide and I am 27 years old."
    }

    print(f"\nUser: {payload['message']}")
    response = requests.post(API_URL, json=payload, headers=headers)

    if response.status_code == 200:
        data = response.json()
        print(f"Agent: {data['response']}")
        conversation_id = data["conversation_id"]

        # Follow-up question
        payload = {
            "agent_name": AGENT_NAME,
            "message": "How old am I?",
            "conversation_id": conversation_id
        }

        print(f"\nUser: {payload['message']}")
        response = requests.post(API_URL, json=payload, headers=headers)

        if response.status_code == 200:
            data = response.json()
            print(f"Agent: {data['response']}")

            # Another follow-up
            payload = {
                "agent_name": AGENT_NAME,
                "message": "What is my name?",
                "conversation_id": conversation_id
            }

            print(f"\nUser: {payload['message']}")
            response = requests.post(API_URL, json=payload, headers=headers)

            if response.status_code == 200:
                data = response.json()
                print(f"Agent: {data['response']}")

                # Delete the conversation
                delete_url = f"http://localhost:8000/conversations/{conversation_id}"
                delete_response = requests.delete(delete_url, headers=headers)

                if delete_response.status_code == 200:
                    print(f"\nConversation {conversation_id} deleted successfully.")
                else:
                    print(f"\nFailed to delete conversation: {delete_response.text}")
            else:
                print(f"Error: {response.text}")
        else:
            print(f"Error: {response.text}")
    else:
        print(f"Error: {response.text}")

def test_health_check():
    """Test the health check endpoint."""
    health_url = "http://localhost:8000/health"
    response = requests.get(health_url)

    if response.status_code == 200:
        data = response.json()
        print(f"Health check: {data}")
    else:
        print(f"Health check failed: {response.text}")

if __name__ == "__main__":
    test_health_check()
    test_api()
