@echo off
echo Starting QA-Hub Frontend...
cd /d "%~dp0frontend"
python -m http.server 3000
pause
