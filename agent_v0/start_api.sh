#!/bin/bash
# Start the LangGraph agent API server

# Activate virtual environment (adjust path if needed)
if [ -d "../venvs/agent/bin" ]; then
    source ../venvs/agent/bin/activate
elif [ -d "venvs/agent/bin" ]; then
    source venvs/agent/bin/activate
else
    echo "Warning: Could not find venv activation script. Assuming dependencies are installed globally."
fi

echo "Starting the agent API server with uvicorn..."
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
