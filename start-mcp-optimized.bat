@echo off
chcp 65001 >nul
echo ========================================
echo    TraeIDE MCP服务器 - 优化版本启动
echo    支持自动端口分配和客户端自动发现
echo ========================================
echo.

:: 读取环境变量配置
if exist ".env" (
    for /f "tokens=1,2 delims==" %%a in ('type ".env" ^| findstr "MCP_PORT_RANGE"') do (
        if "%%a"=="MCP_PORT_RANGE_START" set MCP_PORT_RANGE_START=%%b
        if "%%a"=="MCP_PORT_RANGE_END" set MCP_PORT_RANGE_END=%%b
    )
)

:: 设置默认值
if not defined MCP_PORT_RANGE_START set MCP_PORT_RANGE_START=3001
if not defined MCP_PORT_RANGE_END set MCP_PORT_RANGE_END=3010

:: 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    pause
    exit /b 1
)

:: 显示当前配置
echo [信息] 当前工作目录: %CD%
echo [信息] 项目路径: %CD%
echo [信息] 端口范围: %MCP_PORT_RANGE_START%-%MCP_PORT_RANGE_END% (自动分配)
echo [信息] 启动时间: %date% %time%
echo.

:: 清理旧的端口和状态文件
if exist ".mcp-port.json" (
    echo [清理] 删除旧的端口信息文件
    del ".mcp-port.json"
)
if exist ".mcp-status.json" (
    echo [清理] 删除旧的状态信息文件
    del ".mcp-status.json"
)

:: 检查是否有其他MCP服务正在运行
echo [检查] 扫描现有MCP服务...
for /L %%p in (%MCP_PORT_RANGE_START%,1,%MCP_PORT_RANGE_END%) do (
    netstat -an | findstr ":%%p " >nul 2>&1
    if !errorlevel! equ 0 (
        echo [发现] 端口 %%p 已被占用
    )
)

echo.
echo [启动] 正在启动MCP优化服务器...
echo [提示] 服务器将自动选择可用端口
echo [提示] 按 Ctrl+C 可停止服务器
echo.

:: 设置环境变量
set TRAEIDE_PROJECT_PATH=%CD%
if not defined MCP_WEB_PORT set MCP_WEB_PORT=%MCP_PORT_RANGE_START%

:: 启动优化版本的MCP服务器
node mcp-server-optimized.js

:: 如果服务器异常退出
echo.
echo [警告] MCP服务器已停止
echo [信息] 检查错误日志以获取详细信息
echo.
pause