@echo off
rem EUshop FCC Claude Launcher Wrapper
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\.fcc\Start-FCC-Claude-Correct.ps1" %*
exit /b %ERRORLEVEL%
