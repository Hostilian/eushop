#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if [ -f ".venv/Scripts/python.exe" ]; then
    PYTHON_PATH=".venv/Scripts/python.exe"
elif [ -f ".venv/bin/python" ]; then
    PYTHON_PATH=".venv/bin/python"
else
    echo "Error: Virtual environment python not found at .venv/Scripts/python.exe or .venv/bin/python"
    exit 1
fi

"$PYTHON_PATH" scripts/chat_agent.py "$@"
