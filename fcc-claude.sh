#!/bin/bash
export PYTHONPATH="D:/CODING/eushop/free-claude-code-main/free-claude-code-main"
.venv/Scripts/python -c "import sys; from cli.launchers.claude import launch; launch()" "$@"
