@echo off
REM TraeIDE项目偏离预防MCP服务自动启动脚本
REM 此脚本将随TraeIDE自动启动

setlocal enabledelayedexpansion

REM 设置项目路径
set PROJECT_PATH=%~dp0
set MCP_SERVER_PATH=%PROJECT_PATH%mcp-server.js
set WEB_APP_PATH=%PROJECT_PATH%
set LOG_PATH=%PROJECT_PATH%logs

REM 创建日志目录
if not exist "%LOG_PATH%" mkdir "%LOG_PATH%"

REM 设置日志文件
set LOG_FILE=%LOG_PATH%\mcp-server-%date:~0,4%%date:~5,2%%date:~8,2%.log
set WEB_LOG_FILE=%LOG_PATH%\web-app-%date:~0,4%%date:~5,2%%date:~8,2%.log

echo [%time%] 启动TraeIDE项目偏离预防MCP服务... >> "%LOG_FILE%"
echo 项目路径: %PROJECT_PATH% >> "%LOG_FILE%"
echo MCP服务器路径: %MCP_SERVER_PATH% >> "%LOG_FILE%"

REM 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo [%time%] 错误: 未找到Node.js，请先安装Node.js >> "%LOG_FILE%"
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

REM 检查npm是否安装
npm --version >nul 2>&1
if errorlevel 1 (
    echo [%time%] 错误: 未找到npm >> "%LOG_FILE%"
    echo 错误: 未找到npm
    pause
    exit /b 1
)

REM 切换到项目目录
cd /d "%PROJECT_PATH%"

REM 检查package.json是否存在
if not exist "package.json" (
    echo [%time%] 错误: 未找到package.json文件 >> "%LOG_FILE%"
    echo 错误: 未找到package.json文件
    pause
    exit /b 1
)

REM 安装依赖（如果需要）
if not exist "node_modules" (
    echo [%time%] 安装项目依赖... >> "%LOG_FILE%"
    echo 正在安装项目依赖...
    npm install >> "%LOG_FILE%" 2>&1
    if errorlevel 1 (
        echo [%time%] 错误: 依赖安装失败 >> "%LOG_FILE%"
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

REM 检查MCP服务器文件是否存在
if not exist "%MCP_SERVER_PATH%" (
    echo [%time%] 错误: 未找到MCP服务器文件 >> "%LOG_FILE%"
    echo 错误: 未找到MCP服务器文件
    pause
    exit /b 1
)

REM 设置环境变量
set TRAEIDE_PROJECT_PATH=%PROJECT_PATH%
set MCP_WEB_PORT=3001
set NODE_ENV=production

echo [%time%] 启动MCP服务器... >> "%LOG_FILE%"
echo 正在启动MCP服务器...

REM 启动MCP服务器（后台运行）
start "TraeIDE MCP Server" /min node "%MCP_SERVER_PATH%" >> "%LOG_FILE%" 2>&1

REM 等待MCP服务器启动
timeout /t 3 /nobreak >nul

REM 检查MCP服务器是否启动成功
netstat -an | find ":3001" >nul
if errorlevel 1 (
    echo [%time%] 警告: MCP服务器可能未正常启动 >> "%LOG_FILE%"
    echo 警告: MCP服务器可能未正常启动
) else (
    echo [%time%] MCP服务器启动成功，端口: 3001 >> "%LOG_FILE%"
    echo MCP服务器启动成功，端口: 3001
)

REM 启动Web应用（开发模式）
echo [%time%] 启动Web应用... >> "%WEB_LOG_FILE%"
echo 正在启动Web应用...

REM 检查是否有可用的包管理器
if exist "pnpm-lock.yaml" (
    set PKG_MANAGER=pnpm
) else if exist "yarn.lock" (
    set PKG_MANAGER=yarn
) else (
    set PKG_MANAGER=npm
)

echo [%time%] 使用包管理器: !PKG_MANAGER! >> "%WEB_LOG_FILE%"

REM 启动开发服务器
start "TraeIDE Web App" /min !PKG_MANAGER! run dev >> "%WEB_LOG_FILE%" 2>&1

REM 等待Web应用启动
timeout /t 5 /nobreak >nul

REM 检查Web应用是否启动成功
netstat -an | find ":5173" >nul
if errorlevel 1 (
    netstat -an | find ":5174" >nul
    if errorlevel 1 (
        netstat -an | find ":5175" >nul
        if errorlevel 1 (
            netstat -an | find ":5176" >nul
            if errorlevel 1 (
                echo [%time%] 警告: Web应用可能未正常启动 >> "%WEB_LOG_FILE%"
                echo 警告: Web应用可能未正常启动
            ) else (
                echo [%time%] Web应用启动成功，端口: 5176 >> "%WEB_LOG_FILE%"
                echo Web应用启动成功，端口: 5176
                set WEB_PORT=5176
            )
        ) else (
            echo [%time%] Web应用启动成功，端口: 5175 >> "%WEB_LOG_FILE%"
            echo Web应用启动成功，端口: 5175
            set WEB_PORT=5175
        )
    ) else (
        echo [%time%] Web应用启动成功，端口: 5174 >> "%WEB_LOG_FILE%"
        echo Web应用启动成功，端口: 5174
        set WEB_PORT=5174
    )
) else (
    echo [%time%] Web应用启动成功，端口: 5173 >> "%WEB_LOG_FILE%"
    echo Web应用启动成功，端口: 5173
    set WEB_PORT=5173
)

REM 创建状态文件
echo {
  "status": "running",
  "mcpPort": 3001,
  "webPort": %WEB_PORT%,
  "projectPath": "%PROJECT_PATH%",
  "startTime": "%date% %time%",
  "logPath": "%LOG_PATH%"
} > "%PROJECT_PATH%status.json"

echo.
echo ========================================
echo TraeIDE项目偏离预防MCP服务已启动
echo ========================================
echo MCP服务器: http://localhost:3001
echo Web应用: http://localhost:%WEB_PORT%
echo 项目路径: %PROJECT_PATH%
echo 日志路径: %LOG_PATH%
echo ========================================
echo.
echo 服务正在后台运行...
echo 可以关闭此窗口，服务将继续运行
echo 要停止服务，请运行 stop-mcp.bat
echo.

REM 记录启动完成
echo [%time%] 所有服务启动完成 >> "%LOG_FILE%"

REM 保持窗口打开10秒后自动关闭
timeout /t 10 /nobreak

exit /b 0