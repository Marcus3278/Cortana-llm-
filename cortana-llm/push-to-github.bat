@echo off
echo ========================================
echo    Push Cortana LLM to GitHub
echo ========================================
echo.

echo This script will help you push your project to GitHub.
echo.

echo Step 1: First, you need to create a repository on GitHub
echo 1. Go to https://github.com
echo 2. Click "New repository"
echo 3. Name: cortana-llm
echo 4. Description: A Cortana-style desktop AI assistant with local LLM integration
echo 5. Make it Public
echo 6. Don't initialize with README
echo 7. Click "Create repository"
echo.

set /p github_url="Enter your GitHub repository URL (e.g., https://github.com/username/cortana-llm.git): "

if "%github_url%"=="" (
    echo Error: No URL provided. Exiting.
    pause
    exit /b 1
)

echo.
echo Setting up remote repository...
git remote add origin %github_url%

echo.
echo Setting main branch...
git branch -M main

echo.
echo Pushing to GitHub...
git push -u origin main

if %errorlevel% == 0 (
    echo.
    echo 🎉 SUCCESS! Your Cortana LLM project is now on GitHub!
    echo.
    echo Repository URL: %github_url%
    echo.
    echo What's included:
    echo ✅ Complete Cortana LLM application
    echo ✅ Enhanced AI with personality features
    echo ✅ Weather and web search services
    echo ✅ Voice recognition and synthesis
    echo ✅ Animated avatar system
    echo ✅ Comprehensive documentation
    echo ✅ Setup scripts and guides
    echo ✅ MIT License for open source
    echo.
    echo Your project is ready for the world to use!
) else (
    echo.
    echo ❌ Push failed. This might be because:
    echo 1. You need to authenticate with GitHub
    echo 2. The repository URL is incorrect
    echo 3. You don't have push permissions
    echo.
    echo Try these solutions:
    echo 1. Make sure you're logged into GitHub
    echo 2. Check the repository URL is correct
    echo 3. Try using GitHub Desktop instead
    echo.
    echo Alternative: Use GitHub Desktop
    echo 1. Download from https://desktop.github.com/
    echo 2. Sign in to your GitHub account
    echo 3. File → Add Local Repository
    echo 4. Choose this cortana-llm folder
    echo 5. Click "Publish Repository"
)

echo.
pause
