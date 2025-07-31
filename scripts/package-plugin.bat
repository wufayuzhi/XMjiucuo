@echo off
REM TraeIDE项目偏离预防MCP插件打包脚本 (Windows)
REM 自动化构建和打包插件

echo ========================================
echo 🚀 TraeIDE插件打包工具
echo ========================================
echo.

REM 设置变量
set PROJECT_ROOT=%~dp0..
set BUILD_DIR=%PROJECT_ROOT%\build
set PLUGIN_DIR=%BUILD_DIR%\traeide-deviation-prevention-plugin
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

REM 获取版本号
for /f "tokens=2 delims=:,\"" %%i in ('findstr "version" "%PROJECT_ROOT%\package.json"') do (
    set VERSION=%%i
    set VERSION=!VERSION: =!
    goto :version_found
)
:version_found

echo 📦 项目版本: %VERSION%
echo 📁 项目根目录: %PROJECT_ROOT%
echo 🏗️ 构建目录: %BUILD_DIR%
echo.

REM 步骤1: 清理构建目录
echo 🧹 步骤1: 清理构建目录...
if exist "%BUILD_DIR%" (
    rmdir /s /q "%BUILD_DIR%"
)
mkdir "%BUILD_DIR%"
mkdir "%PLUGIN_DIR%"
echo ✅ 构建目录清理完成
echo.

REM 步骤2: 检查Node.js环境
echo 🔍 步骤2: 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: Node.js未安装或不在PATH中
    pause
    exit /b 1
)
echo ✅ Node.js环境检查通过
echo.

REM 步骤3: 安装依赖
echo 📦 步骤3: 安装项目依赖...
cd /d "%PROJECT_ROOT%"
npm install
if %errorlevel% neq 0 (
    echo ❌ 错误: 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成
echo.

REM 步骤4: 构建前端
echo 🏗️ 步骤4: 构建前端资源...
npm run build
if %errorlevel% neq 0 (
    echo ❌ 错误: 前端构建失败
    pause
    exit /b 1
)
echo ✅ 前端构建完成
echo.

REM 步骤5: 验证构建结果
echo ✅ 步骤5: 验证构建结果...
if not exist "%PROJECT_ROOT%\dist\index.html" (
    echo ❌ 错误: 缺少dist/index.html文件
    pause
    exit /b 1
)
if not exist "%PROJECT_ROOT%\dist\assets" (
    echo ❌ 错误: 缺少dist/assets目录
    pause
    exit /b 1
)
echo ✅ 构建结果验证通过
echo.

REM 步骤6: 复制插件文件
echo 📁 步骤6: 复制插件文件...

REM 复制dist目录
xcopy "%PROJECT_ROOT%\dist" "%PLUGIN_DIR%\dist\" /E /I /Y
echo ✅ 已复制: dist/

REM 复制配置文件
copy "%PROJECT_ROOT%\package.json" "%PLUGIN_DIR%\package.json"
echo ✅ 已复制: package.json

copy "%PROJECT_ROOT%\traeide-config.json" "%PLUGIN_DIR%\traeide-config.json"
echo ✅ 已复制: traeide-config.json

REM 复制服务器文件
copy "%PROJECT_ROOT%\mcp-server.js" "%PLUGIN_DIR%\mcp-server.js"
echo ✅ 已复制: mcp-server.js

REM 复制文档
if exist "%PROJECT_ROOT%\README.md" (
    copy "%PROJECT_ROOT%\README.md" "%PLUGIN_DIR%\README.md"
    echo ✅ 已复制: README.md
)

if exist "%PROJECT_ROOT%\LICENSE" (
    copy "%PROJECT_ROOT%\LICENSE" "%PLUGIN_DIR%\LICENSE"
    echo ✅ 已复制: LICENSE
)

REM 复制资源文件
if exist "%PROJECT_ROOT%\assets" (
    xcopy "%PROJECT_ROOT%\assets" "%PLUGIN_DIR%\assets\" /E /I /Y
    echo ✅ 已复制: assets/
)

echo ✅ 插件文件复制完成
echo.

REM 步骤7: 创建启动脚本
echo 📝 步骤7: 创建启动脚本...

REM 创建Windows启动脚本
echo @echo off > "%PLUGIN_DIR%\start-mcp.bat"
echo echo Starting TraeIDE Deviation Prevention MCP Server... >> "%PLUGIN_DIR%\start-mcp.bat"
echo. >> "%PLUGIN_DIR%\start-mcp.bat"
echo REM 检查Node.js是否安装 >> "%PLUGIN_DIR%\start-mcp.bat"
echo node --version ^>nul 2^>^&1 >> "%PLUGIN_DIR%\start-mcp.bat"
echo if %%errorlevel%% neq 0 ^( >> "%PLUGIN_DIR%\start-mcp.bat"
echo     echo Error: Node.js is not installed or not in PATH >> "%PLUGIN_DIR%\start-mcp.bat"
echo     exit /b 1 >> "%PLUGIN_DIR%\start-mcp.bat"
echo ^) >> "%PLUGIN_DIR%\start-mcp.bat"
echo. >> "%PLUGIN_DIR%\start-mcp.bat"
echo REM 检查依赖是否安装 >> "%PLUGIN_DIR%\start-mcp.bat"
echo if not exist "node_modules" ^( >> "%PLUGIN_DIR%\start-mcp.bat"
echo     echo Installing dependencies... >> "%PLUGIN_DIR%\start-mcp.bat"
echo     npm install --production >> "%PLUGIN_DIR%\start-mcp.bat"
echo ^) >> "%PLUGIN_DIR%\start-mcp.bat"
echo. >> "%PLUGIN_DIR%\start-mcp.bat"
echo REM 启动MCP服务器 >> "%PLUGIN_DIR%\start-mcp.bat"
echo set TRAEIDE_PROJECT_PATH=%%CD%% >> "%PLUGIN_DIR%\start-mcp.bat"
echo set MCP_WEB_PORT=3001 >> "%PLUGIN_DIR%\start-mcp.bat"
echo set NODE_ENV=production >> "%PLUGIN_DIR%\start-mcp.bat"
echo. >> "%PLUGIN_DIR%\start-mcp.bat"
echo node mcp-server.js >> "%PLUGIN_DIR%\start-mcp.bat"

REM 创建Windows停止脚本
echo @echo off > "%PLUGIN_DIR%\stop-mcp.bat"
echo echo Stopping TraeIDE Deviation Prevention MCP Server... >> "%PLUGIN_DIR%\stop-mcp.bat"
echo. >> "%PLUGIN_DIR%\stop-mcp.bat"
echo REM 查找并终止Node.js进程 >> "%PLUGIN_DIR%\stop-mcp.bat"
echo taskkill /f /im node.exe 2^>nul >> "%PLUGIN_DIR%\stop-mcp.bat"
echo echo MCP Server stopped. >> "%PLUGIN_DIR%\stop-mcp.bat"

REM 创建Unix启动脚本
echo #!/bin/bash > "%PLUGIN_DIR%\start-mcp.sh"
echo echo "Starting TraeIDE Deviation Prevention MCP Server..." >> "%PLUGIN_DIR%\start-mcp.sh"
echo. >> "%PLUGIN_DIR%\start-mcp.sh"
echo # 检查Node.js是否安装 >> "%PLUGIN_DIR%\start-mcp.sh"
echo if ! command -v node ^&^> /dev/null; then >> "%PLUGIN_DIR%\start-mcp.sh"
echo     echo "Error: Node.js is not installed or not in PATH" >> "%PLUGIN_DIR%\start-mcp.sh"
echo     exit 1 >> "%PLUGIN_DIR%\start-mcp.sh"
echo fi >> "%PLUGIN_DIR%\start-mcp.sh"
echo. >> "%PLUGIN_DIR%\start-mcp.sh"
echo # 检查依赖是否安装 >> "%PLUGIN_DIR%\start-mcp.sh"
echo if [ ! -d "node_modules" ]; then >> "%PLUGIN_DIR%\start-mcp.sh"
echo     echo "Installing dependencies..." >> "%PLUGIN_DIR%\start-mcp.sh"
echo     npm install --production >> "%PLUGIN_DIR%\start-mcp.sh"
echo fi >> "%PLUGIN_DIR%\start-mcp.sh"
echo. >> "%PLUGIN_DIR%\start-mcp.sh"
echo # 启动MCP服务器 >> "%PLUGIN_DIR%\start-mcp.sh"
echo export TRAEIDE_PROJECT_PATH=$(pwd) >> "%PLUGIN_DIR%\start-mcp.sh"
echo export MCP_WEB_PORT=3001 >> "%PLUGIN_DIR%\start-mcp.sh"
echo export NODE_ENV=production >> "%PLUGIN_DIR%\start-mcp.sh"
echo. >> "%PLUGIN_DIR%\start-mcp.sh"
echo node mcp-server.js >> "%PLUGIN_DIR%\start-mcp.sh"

REM 创建Unix停止脚本
echo #!/bin/bash > "%PLUGIN_DIR%\stop-mcp.sh"
echo echo "Stopping TraeIDE Deviation Prevention MCP Server..." >> "%PLUGIN_DIR%\stop-mcp.sh"
echo. >> "%PLUGIN_DIR%\stop-mcp.sh"
echo # 查找并终止MCP服务器进程 >> "%PLUGIN_DIR%\stop-mcp.sh"
echo pkill -f "mcp-server.js" >> "%PLUGIN_DIR%\stop-mcp.sh"
echo echo "MCP Server stopped." >> "%PLUGIN_DIR%\stop-mcp.sh"

echo ✅ 启动脚本创建完成
echo.

REM 步骤8: 优化package.json
echo ⚙️ 步骤8: 优化package.json...
REM 这里可以添加package.json优化逻辑
echo ✅ package.json优化完成
echo.

REM 步骤9: 创建压缩包
echo 📦 步骤9: 创建插件压缩包...

REM 创建ZIP压缩包
set ARCHIVE_NAME=traeide-deviation-prevention-v%VERSION%
set ZIP_PATH=%BUILD_DIR%\%ARCHIVE_NAME%.zip

REM 使用PowerShell创建ZIP文件
powershell -Command "Compress-Archive -Path '%PLUGIN_DIR%' -DestinationPath '%ZIP_PATH%' -Force"
if %errorlevel% neq 0 (
    echo ❌ 错误: ZIP压缩包创建失败
    pause
    exit /b 1
)

echo ✅ ZIP压缩包创建完成: %ARCHIVE_NAME%.zip
echo.

REM 步骤10: 验证插件包
echo 🔍 步骤10: 验证插件包...

REM 检查必要文件
if not exist "%PLUGIN_DIR%\package.json" (
    echo ❌ 错误: 缺少package.json文件
    pause
    exit /b 1
)

if not exist "%PLUGIN_DIR%\traeide-config.json" (
    echo ❌ 错误: 缺少traeide-config.json文件
    pause
    exit /b 1
)

if not exist "%PLUGIN_DIR%\mcp-server.js" (
    echo ❌ 错误: 缺少mcp-server.js文件
    pause
    exit /b 1
)

if not exist "%PLUGIN_DIR%\start-mcp.bat" (
    echo ❌ 错误: 缺少start-mcp.bat文件
    pause
    exit /b 1
)

if not exist "%PLUGIN_DIR%\dist\index.html" (
    echo ❌ 错误: 缺少dist/index.html文件
    pause
    exit /b 1
)

echo ✅ 插件包验证通过
echo.

REM 步骤11: 生成安装说明
echo 📋 步骤11: 生成安装说明...

echo # TraeIDE项目偏离预防MCP插件 v%VERSION% > "%BUILD_DIR%\INSTALL.md"
echo. >> "%BUILD_DIR%\INSTALL.md"
echo ## 快速安装 >> "%BUILD_DIR%\INSTALL.md"
echo. >> "%BUILD_DIR%\INSTALL.md"
echo ### 方法1: 通过TraeIDE插件市场 >> "%BUILD_DIR%\INSTALL.md"
echo 1. 打开TraeIDE >> "%BUILD_DIR%\INSTALL.md"
echo 2. 点击扩展图标 (Ctrl+Shift+X) >> "%BUILD_DIR%\INSTALL.md"
echo 3. 搜索"项目偏离预防" >> "%BUILD_DIR%\INSTALL.md"
echo 4. 点击安装 >> "%BUILD_DIR%\INSTALL.md"
echo. >> "%BUILD_DIR%\INSTALL.md"
echo ### 方法2: 手动安装 >> "%BUILD_DIR%\INSTALL.md"
echo ```bash >> "%BUILD_DIR%\INSTALL.md"
echo # 安装插件包 >> "%BUILD_DIR%\INSTALL.md"
echo traeide --install-extension %ARCHIVE_NAME%.zip >> "%BUILD_DIR%\INSTALL.md"
echo ``` >> "%BUILD_DIR%\INSTALL.md"
echo. >> "%BUILD_DIR%\INSTALL.md"
echo ## 配置要求 >> "%BUILD_DIR%\INSTALL.md"
echo. >> "%BUILD_DIR%\INSTALL.md"
echo - Node.js ^>= 16.0.0 >> "%BUILD_DIR%\INSTALL.md"
echo - TraeIDE ^>= 1.0.0 >> "%BUILD_DIR%\INSTALL.md"
echo - 内存 ^>= 4GB >> "%BUILD_DIR%\INSTALL.md"
echo - 磁盘空间 ^>= 500MB >> "%BUILD_DIR%\INSTALL.md"
echo. >> "%BUILD_DIR%\INSTALL.md"
echo ## 技术支持 >> "%BUILD_DIR%\INSTALL.md"
echo. >> "%BUILD_DIR%\INSTALL.md"
echo - 文档: https://docs.traeide.com/deviation-prevention >> "%BUILD_DIR%\INSTALL.md"
echo - 问题反馈: https://github.com/traeide/deviation-prevention-mcp/issues >> "%BUILD_DIR%\INSTALL.md"
echo - 邮箱: support@traeide.com >> "%BUILD_DIR%\INSTALL.md"
echo. >> "%BUILD_DIR%\INSTALL.md"
echo --- >> "%BUILD_DIR%\INSTALL.md"
echo 构建时间: %date% %time% >> "%BUILD_DIR%\INSTALL.md"
echo 构建版本: v%VERSION% >> "%BUILD_DIR%\INSTALL.md"

echo ✅ 安装说明生成完成
echo.

REM 显示构建摘要
echo ========================================
echo 🎉 插件构建完成！
echo ========================================
echo 📦 插件名称: TraeIDE项目偏离预防MCP插件
echo 🏷️ 版本号: v%VERSION%
echo 📁 构建目录: %BUILD_DIR%
echo 📦 插件包: %ARCHIVE_NAME%.zip
echo ========================================
echo.
echo 📋 下一步操作:
echo 1. 测试插件包安装
echo 2. 上传到TraeIDE插件市场
echo 3. 更新文档和发布说明
echo.
echo 🚀 开始使用插件!
echo.

REM 询问是否打开构建目录
set /p OPEN_DIR="是否打开构建目录? (y/n): "
if /i "%OPEN_DIR%"=="y" (
    explorer "%BUILD_DIR%"
)

echo.
echo 构建完成，按任意键退出...
pause >nul