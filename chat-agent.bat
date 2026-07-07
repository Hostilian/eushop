@echo off
setlocal
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
    echo Error: Virtual environment python not found at .venv\Scripts\python.exe
    exit /b 1
)

rem Check if --new-window is passed
set "NEW_WINDOW=0"
for %%a in (%*) do (
    if "%%a"=="--new-window" set "NEW_WINDOW=1"
)

if "%NEW_WINDOW%"=="1" (
    echo Launching EUshop AI Agent in a new CMD window...
    rem Filter out --new-window
    set "ARGS="
    for %%a in (%*) do (
        if not "%%a"=="--new-window" (
            call set ARGS=%%ARGS%% %%a
        )
    )
    start "EUshop AI Agent" cmd /c ".venv\Scripts\python.exe scripts\chat_agent.py %ARGS% & echo. & pause"
) else (
    .venv\Scripts\python.exe scripts\chat_agent.py %*
)
