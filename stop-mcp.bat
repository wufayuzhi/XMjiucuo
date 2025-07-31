@echo off
REM TraeIDE项目偏离预防MCP服务停止脚本

setlocal enabledelayedexpansion

REM 设置项目路径
set PROJECT_PATH=%~dp0
set LOG_PATH=%PROJECT_PATH%logs
set LOG_FILE=%LOG_PATH%\mcp-server-%date:~0,4%%date:~5,2%%date:~8,2%.log

echo [%time%] 正在停止TraeIDE项目偏离预防MCP服务... >> "%LOG_FILE%"
echo 正在停止TraeIDE项目偏离预防MCP服务...

REM 查找并终止MCP服务器进程
echo [%time%] 查找MCP服务器进程... >> "%LOG_FILE%"
for /f "tokens=2" %%i in ('tasklist /fi "windowtitle eq TraeIDE MCP Server" /fo csv ^| find "node.exe"') do (
    echo [%time%] 终止MCP服务器进程: %%i >> "%LOG_FILE%"
    taskkill /pid %%i /f >nul 2>&1
)

REM 查找并终止Web应用进程
echo [%time%] 查找Web应用进程... >> "%LOG_FILE%"
for /f "tokens=2" %%i in ('tasklist /fi "windowtitle eq TraeIDE Web App" /fo csv ^| find "node.exe"') do (
    echo [%time%] 终止Web应用进程: %%i >> "%LOG_FILE%"
    taskkill /pid %%i /f >nul 2>&1
)

REM 通过端口查找并终止相关进程
echo [%time%] 通过端口查找进程... >> "%LOG_FILE%"

REM 终止占用3001端口的进程（MCP服务器）
for /f "tokens=5" %%i in ('netstat -ano ^| find ":3001"') do (
    echo [%time%] 终止占用3001端口的进程: %%i >> "%LOG_FILE%"
    taskkill /pid %%i /f >nul 2>&1
)

REM 终止占用5173-5176端口的进程（Web应用）
for %%p in (5173 5174 5175 5176) do (
    for /f "tokens=5" %%i in ('netstat -ano ^| find ":%%p"') do (
        echo [%time%] 终止占用%%p端口的进程: %%i >> "%LOG_FILE%"
        taskkill /pid %%i /f >nul 2>&1
    )
)

REM 等待进程完全终止
timeout /t 2 /nobreak >nul

REM 检查进程是否已终止
set MCP_RUNNING=0
set WEB_RUNNING=0

netstat -an | find ":3001" >nul
if not errorlevel 1 (
    set MCP_RUNNING=1
    echo [%time%] 警告: MCP服务器可能仍在运行 >> "%LOG_FILE%"
    echo 警告: MCP服务器可能仍在运行
) else (
    echo [%time%] MCP服务器已停止 >> "%LOG_FILE%"
    echo MCP服务器已停止
)

for %%p in (5173 5174 5175 5176) do (
    netstat -an | find ":%%p" >nul
    if not errorlevel 1 (
        set WEB_RUNNING=1
    )
)

if !WEB_RUNNING! equ 1 (
    echo [%time%] 警告: Web应用可能仍在运行 >> "%LOG_FILE%"
    echo 警告: Web应用可能仍在运行
) else (
    echo [%time%] Web应用已停止 >> "%LOG_FILE%"
    echo Web应用已停止
)

REM 删除状态文件
if exist "%PROJECT_PATH%status.json" (
    del "%PROJECT_PATH%status.json" >nul 2>&1
    echo [%time%] 状态文件已删除 >> "%LOG_FILE%"
)

REM 清理临时文件
if exist "%PROJECT_PATH%*.tmp" (
    del "%PROJECT_PATH%*.tmp" >nul 2>&1
    echo [%time%] 临时文件已清理 >> "%LOG_FILE%"
)

echo.
echo ========================================
echo TraeIDE项目偏离预防MCP服务停止完成
echo ========================================
echo MCP服务器: 已停止
echo Web应用: 已停止
echo 日志路径: %LOG_PATH%
echo ========================================
echo.

if !MCP_RUNNING! equ 1 (
    echo 注意: 如果MCP服务器仍在运行，请手动终止相关进程
)

if !WEB_RUNNING! equ 1 (
    echo 注意: 如果Web应用仍在运行，请手动终止相关进程
)

echo [%time%] 服务停止脚本执行完成 >> "%LOG_FILE%"

REM 保持窗口打开5秒
timeout /t 5 /nobreak

exit /b 0