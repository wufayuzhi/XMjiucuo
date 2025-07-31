@echo off
REM TraeIDE Plugin Build Script (Simple Version)
REM Automated build and package plugin

setlocal enabledelayedexpansion

echo ========================================
echo TraeIDE Plugin Build Tool
echo ========================================
echo.

REM Set variables
set PROJECT_ROOT=%~dp0..
set BUILD_DIR=%PROJECT_ROOT%\build
set PLUGIN_DIR=%BUILD_DIR%\traeide-deviation-prevention-plugin

REM Get version from package.json
for /f "tokens=2 delims=:,\"" %%i in ('findstr "version" "%PROJECT_ROOT%\package.json"') do (
    set VERSION=%%i
    set VERSION=!VERSION: =!
    goto :version_found
)
:version_found

echo Project Version: %VERSION%
echo Project Root: %PROJECT_ROOT%
echo Build Directory: %BUILD_DIR%
echo.

REM Step 1: Clean build directory
echo Step 1: Cleaning build directory...
if exist "%BUILD_DIR%" (
    rmdir /s /q "%BUILD_DIR%"
)
mkdir "%BUILD_DIR%"
mkdir "%PLUGIN_DIR%"
echo Build directory cleaned
echo.

REM Step 2: Check Node.js environment
echo Step 2: Checking Node.js environment...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js not installed or not in PATH
    pause
    exit /b 1
)
echo Node.js environment check passed
echo.

REM Step 3: Install dependencies
echo Step 3: Installing project dependencies...
cd /d "%PROJECT_ROOT%"
npm install
if %errorlevel% neq 0 (
    echo Error: Dependencies installation failed
    pause
    exit /b 1
)
echo Dependencies installation completed
echo.

REM Step 4: Build frontend
echo Step 4: Building frontend resources...
npm run build
if %errorlevel% neq 0 (
    echo Error: Frontend build failed
    pause
    exit /b 1
)
echo Frontend build completed
echo.

REM Step 5: Validate build results
echo Step 5: Validating build results...
if not exist "%PROJECT_ROOT%\dist\index.html" (
    echo Error: Missing dist/index.html file
    pause
    exit /b 1
)
if not exist "%PROJECT_ROOT%\dist\assets" (
    echo Error: Missing dist/assets directory
    pause
    exit /b 1
)
echo Build results validation passed
echo.

REM Step 6: Copy plugin files
echo Step 6: Copying plugin files...

REM Copy dist directory
xcopy "%PROJECT_ROOT%\dist" "%PLUGIN_DIR%\dist\" /E /I /Y
echo Copied: dist/

REM Copy configuration files
copy "%PROJECT_ROOT%\package.json" "%PLUGIN_DIR%\package.json"
echo Copied: package.json

copy "%PROJECT_ROOT%\traeide-config.json" "%PLUGIN_DIR%\traeide-config.json"
echo Copied: traeide-config.json

REM Copy server file
copy "%PROJECT_ROOT%\mcp-server.js" "%PLUGIN_DIR%\mcp-server.js"
echo Copied: mcp-server.js

REM Copy documentation
if exist "%PROJECT_ROOT%\README.md" (
    copy "%PROJECT_ROOT%\README.md" "%PLUGIN_DIR%\README.md"
    echo Copied: README.md
)

if exist "%PROJECT_ROOT%\LICENSE" (
    copy "%PROJECT_ROOT%\LICENSE" "%PLUGIN_DIR%\LICENSE"
    echo Copied: LICENSE
)

REM Copy assets
if exist "%PROJECT_ROOT%\assets" (
    xcopy "%PROJECT_ROOT%\assets" "%PLUGIN_DIR%\assets\" /E /I /Y
    echo Copied: assets/
)

echo Plugin files copying completed
echo.

REM Step 7: Create startup scripts
echo Step 7: Creating startup scripts...

REM Create Windows startup script
echo @echo off > "%PLUGIN_DIR%\start-mcp.bat"
echo echo Starting TraeIDE Deviation Prevention MCP Server... >> "%PLUGIN_DIR%\start-mcp.bat"
echo. >> "%PLUGIN_DIR%\start-mcp.bat"
echo node --version ^>nul 2^>^&1 >> "%PLUGIN_DIR%\start-mcp.bat"
echo if %%errorlevel%% neq 0 ^( >> "%PLUGIN_DIR%\start-mcp.bat"
echo     echo Error: Node.js is not installed >> "%PLUGIN_DIR%\start-mcp.bat"
echo     exit /b 1 >> "%PLUGIN_DIR%\start-mcp.bat"
echo ^) >> "%PLUGIN_DIR%\start-mcp.bat"
echo. >> "%PLUGIN_DIR%\start-mcp.bat"
echo if not exist "node_modules" ^( >> "%PLUGIN_DIR%\start-mcp.bat"
echo     echo Installing dependencies... >> "%PLUGIN_DIR%\start-mcp.bat"
echo     npm install --production >> "%PLUGIN_DIR%\start-mcp.bat"
echo ^) >> "%PLUGIN_DIR%\start-mcp.bat"
echo. >> "%PLUGIN_DIR%\start-mcp.bat"
echo set TRAEIDE_PROJECT_PATH=%%CD%% >> "%PLUGIN_DIR%\start-mcp.bat"
echo set MCP_WEB_PORT=3001 >> "%PLUGIN_DIR%\start-mcp.bat"
echo set NODE_ENV=production >> "%PLUGIN_DIR%\start-mcp.bat"
echo. >> "%PLUGIN_DIR%\start-mcp.bat"
echo node mcp-server.js >> "%PLUGIN_DIR%\start-mcp.bat"

REM Create Windows stop script
echo @echo off > "%PLUGIN_DIR%\stop-mcp.bat"
echo echo Stopping TraeIDE Deviation Prevention MCP Server... >> "%PLUGIN_DIR%\stop-mcp.bat"
echo taskkill /f /im node.exe 2^>nul >> "%PLUGIN_DIR%\stop-mcp.bat"
echo echo MCP Server stopped. >> "%PLUGIN_DIR%\stop-mcp.bat"

echo Startup scripts created
echo.

REM Step 8: Create ZIP package
echo Step 8: Creating ZIP package...
set ARCHIVE_NAME=traeide-deviation-prevention-v%VERSION%

REM Use PowerShell to create ZIP
powershell -Command "Compress-Archive -Path '%PLUGIN_DIR%\*' -DestinationPath '%BUILD_DIR%\%ARCHIVE_NAME%.zip' -Force"
if %errorlevel% equ 0 (
    echo ZIP package created: %ARCHIVE_NAME%.zip
) else (
    echo Warning: ZIP package creation failed
)
echo.

REM Step 9: Generate installation guide
echo Step 9: Generating installation guide...
echo # TraeIDE Deviation Prevention Plugin Installation Guide > "%BUILD_DIR%\INSTALL.md"
echo. >> "%BUILD_DIR%\INSTALL.md"
echo ## Quick Installation >> "%BUILD_DIR%\INSTALL.md"
echo. >> "%BUILD_DIR%\INSTALL.md"
echo ### Method 1: TraeIDE Extension Manager >> "%BUILD_DIR%\INSTALL.md"
echo 1. Open TraeIDE >> "%BUILD_DIR%\INSTALL.md"
echo 2. Press Ctrl+Shift+X to open Extensions >> "%BUILD_DIR%\INSTALL.md"
echo 3. Search for "Deviation Prevention" >> "%BUILD_DIR%\INSTALL.md"
echo 4. Click Install >> "%BUILD_DIR%\INSTALL.md"
echo. >> "%BUILD_DIR%\INSTALL.md"
echo ### Method 2: Manual Installation >> "%BUILD_DIR%\INSTALL.md"
echo ```bash >> "%BUILD_DIR%\INSTALL.md"
echo traeide --install-extension %ARCHIVE_NAME%.zip >> "%BUILD_DIR%\INSTALL.md"
echo ``` >> "%BUILD_DIR%\INSTALL.md"
echo. >> "%BUILD_DIR%\INSTALL.md"
echo ## Configuration >> "%BUILD_DIR%\INSTALL.md"
echo. >> "%BUILD_DIR%\INSTALL.md"
echo 1. Open TraeIDE Settings >> "%BUILD_DIR%\INSTALL.md"
echo 2. Search for "Deviation Prevention" >> "%BUILD_DIR%\INSTALL.md"
echo 3. Configure API keys and preferences >> "%BUILD_DIR%\INSTALL.md"
echo. >> "%BUILD_DIR%\INSTALL.md"
echo ## System Requirements >> "%BUILD_DIR%\INSTALL.md"
echo. >> "%BUILD_DIR%\INSTALL.md"
echo - Node.js >= 16.0.0 >> "%BUILD_DIR%\INSTALL.md"
echo - TraeIDE >= 1.0.0 >> "%BUILD_DIR%\INSTALL.md"
echo - Memory >= 4GB >> "%BUILD_DIR%\INSTALL.md"
echo - Disk Space >= 500MB >> "%BUILD_DIR%\INSTALL.md"

echo Installation guide generated
echo.

REM Final summary
echo ========================================
echo Build Completed Successfully!
echo ========================================
echo Plugin Name: TraeIDE Deviation Prevention MCP Plugin
echo Version: v%VERSION%
echo Build Directory: %BUILD_DIR%
echo ========================================
echo.
echo Build Contents:
if exist "%BUILD_DIR%" (
    dir /b "%BUILD_DIR%"
) else (
    echo Build directory not found
)
echo.
echo Next Steps:
echo 1. Test plugin installation
echo 2. Upload to TraeIDE marketplace
echo 3. Update project documentation
echo 4. Create release tag
echo.
echo Plugin is ready for deployment!
echo.

set /p OPEN_DIR="Open build directory? (y/n): "
if /i "%OPEN_DIR%"=="y" (
    if exist "%BUILD_DIR%" (
        explorer "%BUILD_DIR%"
    ) else (
        echo Build directory not found
    )
)

echo.
echo Build script completed. Press any key to exit...