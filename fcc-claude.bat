@echo off
set PYTHONPATH=D:\CODING\eushop\free-claude-code-main\free-claude-code-main
.venv\Scripts\python.exe -c "import sys; from cli.launchers.claude import launch; launch()" %*
