"""
Test script for the LangGraph agent API.
This script assumes API key authentication is DISABLED.
"""
import requests
import json

# API endpoint
API_URL = "http://localhost:8000/chat"
AGENT_NAME = "chat_deepseek_v3" # Agent to test

def test_api():
    """Test the API with a simple conversation."""
    # First message
    print("Testing the API...")

    # First message
    payload = {
        "agent_name": AGENT_NAME,
        "message": "Hello! My name is Davide and I am 27 years old."
    }

    print(f"\nUser: {payload['message']}")
    response = requests.post(API_URL, json=payload)

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
        response = requests.post(API_URL, json=payload)

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
            response = requests.post(API_URL, json=payload)

            if response.status_code == 200:
                data = response.json()
                print(f"Agent: {data['response']}")

                # Delete the conversation
                delete_url = f"http://localhost:8000/conversations/{conversation_id}"
                # Note: Deleting requires API key if authentication is enabled
                delete_response = requests.delete(delete_url)

                if delete_response.status_code == 200:
                    print(f"\nConversation {conversation_id} deleted successfully.")
                elif delete_response.status_code == 403:
                     print(f"\nSkipping delete: API key required (403 Forbidden).")
                else:
                    print(f"\nFailed to delete conversation: {delete_response.text}")
            else:
                print(f"Error: {response.text}")
        else:
            print(f"Error: {response.text}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_api()
