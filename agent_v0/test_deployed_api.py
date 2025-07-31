"""
Test script for the deployed LangGraph agent API.
Update the DEPLOYED_API_URL below with your actual deployment URL.
"""
import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Replace with your deployed API URL from Railway or other platform
DEPLOYED_API_URL = "https://your-project-name.up.railway.app"
API_KEY = os.getenv("API_KEY", "your_api_key_here")
AGENT_NAME = "deepresearch_optimus_alpha" # Agent to test

def test_health_check():
    """Test the health check endpoint."""
    health_url = f"{DEPLOYED_API_URL}/health"
    print(f"Testing health check at: {health_url}")

    try:
        response = requests.get(health_url)

        if response.status_code == 200:
            data = response.json()
            print(f"Health check successful: {data}")
            return True
        else:
            print(f"Health check failed: {response.text}")
            return False
    except Exception as e:
        print(f"Error connecting to API: {str(e)}")
        return False

def test_chat():
    """Test the chat endpoint."""
    chat_url = f"{DEPLOYED_API_URL}/chat"
    print(f"Testing chat endpoint at: {chat_url}")

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

    try:
        response = requests.post(chat_url, json=payload, headers=headers)

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
            response = requests.post(chat_url, json=payload, headers=headers)

            if response.status_code == 200:
                data = response.json()
                print(f"Agent: {data['response']}")
                return True
            else:
                print(f"Error: {response.text}")
                return False
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Error connecting to API: {str(e)}")
        return False

if __name__ == "__main__":
    print("Testing deployed API...")
    print(f"API URL: {DEPLOYED_API_URL}")
    print(f"API Key: {API_KEY[:4]}{'*' * (len(API_KEY) - 4)}")

    health_ok = test_health_check()

    if health_ok:
        test_chat()
    else:
        print("Health check failed. Please check your deployment.")
