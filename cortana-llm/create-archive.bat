@echo off
echo ========================================
echo    Create WinRAR Archive - Cortana LLM
echo ========================================
echo.

echo This script will create a WinRAR archive of your Cortana LLM project.
echo.

set archive_name=Cortana-LLM-Desktop-AI-Assistant.rar

echo Archive name: %archive_name%
echo Location: Desktop
echo.

echo Checking for WinRAR installation...

if exist "C:\Program Files\WinRAR\WinRAR.exe" (
    set winrar_path="C:\Program Files\WinRAR\WinRAR.exe"
    echo ✅ Found WinRAR at: C:\Program Files\WinRAR\
) else if exist "C:\Program Files (x86)\WinRAR\WinRAR.exe" (
    set winrar_path="C:\Program Files (x86)\WinRAR\WinRAR.exe"
    echo ✅ Found WinRAR at: C:\Program Files (x86)\WinRAR\
) else (
    echo ❌ WinRAR not found!
    echo.
    echo Please install WinRAR from: https://www.win-rar.com/download.html
    echo Or use the manual method described in CREATE_WINRAR_ARCHIVE_GUIDE.md
    echo.
    pause
    exit /b 1
)

echo.
echo Creating archive with the following settings:
echo - Format: RAR
echo - Compression: Normal
echo - Dictionary size: 4096 KB
echo - Recovery record: 3%%
echo - Excluding: node_modules, .git folders
echo.

cd ..

echo Creating archive...
%winrar_path% a -r -rr3 -m3 -md4096 -x*node_modules* -x*.git* "%archive_name%" cortana-llm\

if %errorlevel% == 0 (
    echo.
    echo 🎉 SUCCESS! Archive created successfully!
    echo.
    echo Archive: %archive_name%
    echo Location: %CD%
    echo.
    echo Archive contains:
    echo ✅ Complete Cortana LLM application
    echo ✅ Enhanced AI with personality features
    echo ✅ Weather and web search services
    echo ✅ Voice recognition and synthesis
    echo ✅ Animated avatar system
    echo ✅ Comprehensive documentation
    echo ✅ Setup scripts and guides
    echo ✅ MIT License for open source
    echo.
    echo File size: 
    for %%A in ("%archive_name%") do echo %%~zA bytes
    echo.
    echo Your archive is ready to share!
    echo.
    echo Sharing options:
    echo - Upload to Google Drive, Dropbox, or OneDrive
    echo - Send via WeTransfer (no account needed)
    echo - Email if under 25MB
    echo - Share on GitHub (follow PUSH_TO_GITHUB_INSTRUCTIONS.md)
) else (
    echo.
    echo ❌ Archive creation failed!
    echo.
    echo Possible solutions:
    echo 1. Make sure WinRAR is properly installed
    echo 2. Check if you have write permissions in this folder
    echo 3. Try the manual method in CREATE_WINRAR_ARCHIVE_GUIDE.md
    echo.
    echo Manual method:
    echo 1. Right-click on the cortana-llm folder
    echo 2. Select "Add to archive..."
    echo 3. Choose RAR format and click OK
)

echo.
pause
