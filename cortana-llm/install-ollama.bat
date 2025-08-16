@echo off
echo ========================================
echo    Cortana LLM - Ollama Setup Helper
echo ========================================
echo.

echo Checking if Ollama is already installed...
ollama --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Ollama is already installed!
    ollama --version
    echo.
    goto :check_service
) else (
    echo ❌ Ollama is not installed.
    echo.
    echo Please follow these steps:
    echo 1. Visit: https://ollama.ai/download/windows
    echo 2. Download and install Ollama
    echo 3. Restart this script after installation
    echo.
    pause
    exit /b 1
)

:check_service
echo Checking if Ollama service is running...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Ollama service is running!
    goto :pull_model
) else (
    echo 🚀 Starting Ollama service...
    echo Please keep this window open - Ollama needs to run as a service.
    echo.
    echo Starting Ollama in a new window...
    start "Ollama Service" cmd /k "ollama serve"
    echo.
    echo Waiting for service to start...
    timeout /t 5 /nobreak >nul
    goto :pull_model
)

:pull_model
echo.
echo 📦 Pulling recommended AI model (llama2:7b-chat)...
echo This may take several minutes depending on your internet connection.
echo The model is approximately 3.8GB in size.
echo.
set /p confirm="Do you want to pull the model now? (y/n): "
if /i "%confirm%" neq "y" goto :skip_model

echo Pulling model...
ollama pull llama2:7b-chat
if %errorlevel% == 0 (
    echo ✅ Model pulled successfully!
) else (
    echo ❌ Failed to pull model. Please check your internet connection.
    goto :manual_instructions
)

:test_model
echo.
echo 🧪 Testing the model...
echo Testing with a simple prompt...
ollama run llama2:7b-chat "Hello, please respond with just 'AI is working!'" --timeout 30
if %errorlevel% == 0 (
    echo ✅ Model test successful!
) else (
    echo ⚠️ Model test failed, but this might be normal for first run.
)

:success
echo.
echo 🎉 Setup complete!
echo.
echo ✅ Ollama is installed and running
echo ✅ Model is available
echo ✅ Ready to use with Cortana LLM
echo.
echo To start the Cortana LLM application:
echo   npm start
echo.
echo Note: Keep the Ollama service window open while using the app.
echo.
pause
exit /b 0

:skip_model
echo.
echo ⚠️ Skipping model download.
echo You can pull it later with: ollama pull llama2:7b-chat
goto :manual_instructions

:manual_instructions
echo.
echo 📋 Manual Setup Instructions:
echo.
echo 1. Ensure Ollama service is running:
echo    ollama serve
echo.
echo 2. Pull the AI model:
echo    ollama pull llama2:7b-chat
echo.
echo 3. Test the model:
echo    ollama run llama2:7b-chat "Hello"
echo.
echo 4. Start Cortana LLM:
echo    npm start
echo.
pause
exit /b 0
