@echo off
chcp 65001 >nul
echo ========================================
echo    TraeIDE MCP服务器 - 优化版本停止
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

:: 读取端口信息
if exist ".mcp-port.json" (
    echo [信息] 发现端口信息文件
    for /f "tokens=2 delims=:,\"" %%a in ('type ".mcp-port.json" ^| findstr "port"') do (
        set MCP_PORT=%%a
        set MCP_PORT=!MCP_PORT: =!
    )
    
    for /f "tokens=2 delims=:,\"" %%a in ('type ".mcp-port.json" ^| findstr "pid"') do (
        set MCP_PID=%%a
        set MCP_PID=!MCP_PID: =!
    )
    
    echo [信息] MCP服务端口: !MCP_PORT!
    echo [信息] MCP服务PID: !MCP_PID!
    echo.
    
    :: 尝试通过PID停止进程
    if defined MCP_PID (
        echo [停止] 正在停止PID为 !MCP_PID! 的MCP服务...
        taskkill /PID !MCP_PID! /F >nul 2>&1
        if !errorlevel! equ 0 (
            echo [成功] MCP服务已停止
        ) else (
            echo [警告] 无法通过PID停止服务，尝试其他方法
        )
    )
) else (
    echo [警告] 未找到端口信息文件，尝试通用停止方法
)

echo.
echo [清理] 停止所有可能的MCP相关进程...

:: 停止所有node进程中包含mcp-server的
tasklist | findstr "node.exe" >nul 2>&1
if %errorlevel% equ 0 (
    echo [扫描] 查找MCP相关的Node.js进程...
    
    :: 使用wmic获取详细的进程信息
    for /f "tokens=2" %%i in ('wmic process where "name='node.exe' and commandline like '%%mcp-server%%'" get processid /value ^| findstr "ProcessId"') do (
        set PID=%%i
        if defined PID (
            echo [停止] 停止MCP进程 PID: !PID!
            taskkill /PID !PID! /F >nul 2>&1
        )
    )
)

:: 检查并停止占用MCP端口的进程
echo [检查] 扫描MCP端口范围 %MCP_PORT_RANGE_START%-%MCP_PORT_RANGE_END%...
for /L %%p in (%MCP_PORT_RANGE_START%,1,%MCP_PORT_RANGE_END%) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p "') do (
        set PORT_PID=%%a
        if defined PORT_PID (
            echo [发现] 端口 %%p 被PID !PORT_PID! 占用，正在停止...
            taskkill /PID !PORT_PID! /F >nul 2>&1
        )
    )
)

echo.
echo [清理] 删除临时文件...

:: 清理端口和状态文件
if exist ".mcp-port.json" (
    del ".mcp-port.json"
    echo [清理] 已删除端口信息文件
)

if exist ".mcp-status.json" (
    del ".mcp-status.json"
    echo [清理] 已删除状态信息文件
)

:: 清理可能的日志文件
if exist "mcp-server.log" (
    del "mcp-server.log"
    echo [清理] 已删除日志文件
)

echo.
echo [完成] MCP服务器停止操作完成
echo [提示] 如果仍有进程残留，请手动检查任务管理器
echo.
pause