@echo off
echo Starting Cortana LLM...
echo.
echo Checking for Ollama...
ollama --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Ollama not found. Please install Ollama first.
    echo Visit: https://ollama.ai
    pause
    exit /b 1
)

echo Ollama found!
echo.
echo Starting Ollama service...
start /b ollama serve

echo Waiting for Ollama to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting Cortana LLM application...
npm start

pause
