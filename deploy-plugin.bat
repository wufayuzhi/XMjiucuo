@echo off
REM TraeIDE项目偏离预防MCP插件完整部署脚本
REM 集成构建、验证、打包和部署流程

setlocal enabledelayedexpansion

echo ========================================
echo 🚀 TraeIDE插件完整部署工具
echo ========================================
echo.

REM 设置变量
set PROJECT_ROOT=%~dp0
set SCRIPTS_DIR=%PROJECT_ROOT%scripts
set BUILD_DIR=%PROJECT_ROOT%build
set TIMESTAMP=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

REM 获取版本号
for /f "tokens=2 delims=:,\"" %%i in ('findstr "version" "%PROJECT_ROOT%package.json"') do (
    set VERSION=%%i
    set VERSION=!VERSION: =!
    goto :version_found
)
:version_found

echo 📦 项目版本: %VERSION%
echo 📁 项目根目录: %PROJECT_ROOT%
echo 🕐 构建时间: %TIMESTAMP%
echo.

REM 检查必要工具
echo 🔍 检查必要工具...

REM 检查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: Node.js未安装或不在PATH中
    echo 请安装Node.js 16.0.0或更高版本
    pause
    exit /b 1
)
echo ✅ Node.js: 已安装

REM 检查npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: npm未安装或不在PATH中
    pause
    exit /b 1
)
echo ✅ npm: 已安装

REM 检查PowerShell（用于ZIP压缩）
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ 警告: PowerShell不可用，将跳过ZIP包创建
    set POWERSHELL_AVAILABLE=false
) else (
    echo ✅ PowerShell: 已安装
    set POWERSHELL_AVAILABLE=true
)

echo.

REM 显示部署选项
echo 📋 部署选项:
echo 1. 完整部署（构建 + 验证 + 打包）
echo 2. 仅构建和打包
echo 3. 仅验证现有构建
echo 4. 清理构建目录
echo 5. 退出
echo.

set /p CHOICE="请选择部署选项 (1-5): "

if "%CHOICE%"=="1" goto :full_deploy
if "%CHOICE%"=="2" goto :build_only
if "%CHOICE%"=="3" goto :validate_only
if "%CHOICE%"=="4" goto :clean_only
if "%CHOICE%"=="5" goto :exit

echo ❌ 无效选择，退出
goto :exit

:full_deploy
echo.
echo 🚀 开始完整部署流程...
echo ========================================
echo.

REM 步骤1: 清理环境
echo 🧹 步骤1: 清理构建环境...
if exist "%BUILD_DIR%" (
    rmdir /s /q "%BUILD_DIR%"
    echo ✅ 构建目录已清理
) else (
    echo ℹ️ 构建目录不存在，跳过清理
)
echo.

REM 步骤2: 运行质量检查
echo 🔍 步骤2: 运行代码质量检查...
cd /d "%PROJECT_ROOT%"

REM 检查是否有lint脚本
findstr "lint" package.json >nul 2>&1
if %errorlevel% equ 0 (
    echo 运行代码检查...
    npm run lint
    if %errorlevel% neq 0 (
        echo ⚠️ 警告: 代码检查发现问题，但继续构建
    ) else (
        echo ✅ 代码检查通过
    )
) else (
    echo ℹ️ 未配置代码检查，跳过
)

REM 检查是否有test脚本
findstr "test" package.json >nul 2>&1
if %errorlevel% equ 0 (
    echo 运行单元测试...
    npm test
    if %errorlevel% neq 0 (
        echo ❌ 错误: 单元测试失败
        set /p CONTINUE="是否继续构建? (y/n): "
        if /i "!CONTINUE!" neq "y" (
            echo 构建已取消
            goto :exit
        )
    ) else (
        echo ✅ 单元测试通过
    )
) else (
    echo ℹ️ 未配置单元测试，跳过
)
echo.

REM 步骤3: 执行构建
echo 🏗️ 步骤3: 执行插件构建...
if exist "%SCRIPTS_DIR%\package-plugin.bat" (
    call "%SCRIPTS_DIR%\package-plugin.bat"
    if %errorlevel% neq 0 (
        echo ❌ 错误: 插件构建失败
        goto :exit
    )
    echo ✅ 插件构建完成
) else (
    echo ❌ 错误: 构建脚本不存在: %SCRIPTS_DIR%\package-plugin.bat
    goto :exit
)
echo.

REM 步骤4: 验证插件
echo 🔍 步骤4: 验证插件包...
set PLUGIN_DIR=%BUILD_DIR%\traeide-deviation-prevention-plugin
if exist "%PLUGIN_DIR%" (
    if exist "%SCRIPTS_DIR%\validate-plugin.js" (
        node "%SCRIPTS_DIR%\validate-plugin.js" "%PLUGIN_DIR%"
        if %errorlevel% neq 0 (
            echo ❌ 错误: 插件验证失败
            set /p CONTINUE="是否继续部署? (y/n): "
            if /i "!CONTINUE!" neq "y" (
                echo 部署已取消
                goto :exit
            )
        ) else (
            echo ✅ 插件验证通过
        )
    ) else (
        echo ⚠️ 警告: 验证脚本不存在，跳过验证
    )
) else (
    echo ❌ 错误: 插件目录不存在，无法验证
    goto :exit
)
echo.

REM 步骤5: 生成部署包
echo 📦 步骤5: 生成最终部署包...
goto :create_deployment_package

:build_only
echo.
echo 🏗️ 开始构建和打包...
echo ========================================
echo.

cd /d "%PROJECT_ROOT%"
if exist "%SCRIPTS_DIR%\package-plugin.bat" (
    call "%SCRIPTS_DIR%\package-plugin.bat"
    if %errorlevel% neq 0 (
        echo ❌ 错误: 插件构建失败
        goto :exit
    )
) else (
    echo ❌ 错误: 构建脚本不存在
    goto :exit
)
goto :create_deployment_package

:validate_only
echo.
echo 🔍 开始验证现有构建...
echo ========================================
echo.

set PLUGIN_DIR=%BUILD_DIR%\traeide-deviation-prevention-plugin
if not exist "%PLUGIN_DIR%" (
    echo ❌ 错误: 插件目录不存在，请先构建插件
    goto :exit
)

if exist "%SCRIPTS_DIR%\validate-plugin.js" (
    node "%SCRIPTS_DIR%\validate-plugin.js" "%PLUGIN_DIR%"
) else (
    echo ❌ 错误: 验证脚本不存在
    goto :exit
)
goto :show_final_summary

:clean_only
echo.
echo 🧹 清理构建目录...
if exist "%BUILD_DIR%" (
    rmdir /s /q "%BUILD_DIR%"
    echo ✅ 构建目录已清理
) else (
    echo ℹ️ 构建目录不存在
)
echo.
echo 清理完成！
goto :exit

:create_deployment_package
echo.
echo 📦 创建部署包...

set ARCHIVE_NAME=traeide-deviation-prevention-v%VERSION%
set DEPLOYMENT_DIR=%BUILD_DIR%\deployment
set RELEASE_DIR=%BUILD_DIR%\release

REM 创建部署目录
if not exist "%DEPLOYMENT_DIR%" mkdir "%DEPLOYMENT_DIR%"
if not exist "%RELEASE_DIR%" mkdir "%RELEASE_DIR%"

REM 复制插件包
if exist "%BUILD_DIR%\%ARCHIVE_NAME%.zip" (
    copy "%BUILD_DIR%\%ARCHIVE_NAME%.zip" "%RELEASE_DIR%\%ARCHIVE_NAME%.zip"
    echo ✅ 已复制ZIP包到发布目录
)

REM 复制文档
if exist "%BUILD_DIR%\INSTALL.md" (
    copy "%BUILD_DIR%\INSTALL.md" "%RELEASE_DIR%\INSTALL.md"
    echo ✅ 已复制安装说明
)

if exist "%PROJECT_ROOT%\TraeIDE插件部署指南.md" (
    copy "%PROJECT_ROOT%\TraeIDE插件部署指南.md" "%RELEASE_DIR%\TraeIDE插件部署指南.md"
    echo ✅ 已复制部署指南
)

REM 生成发布说明
echo # TraeIDE项目偏离预防MCP插件 v%VERSION% > "%RELEASE_DIR%\RELEASE_NOTES.md"
echo. >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo ## 发布信息 >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo. >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo - **版本号**: v%VERSION% >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo - **构建时间**: %date% %time% >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo - **构建平台**: Windows >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo. >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo ## 包含文件 >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo. >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo - `%ARCHIVE_NAME%.zip` - 插件安装包 >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo - `INSTALL.md` - 快速安装指南 >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo - `TraeIDE插件部署指南.md` - 详细部署指南 >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo - `RELEASE_NOTES.md` - 发布说明 >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo. >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo ## 安装方法 >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo. >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo ### 方法1: TraeIDE插件市场 >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo 1. 打开TraeIDE >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo 2. 点击扩展图标 (Ctrl+Shift+X) >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo 3. 搜索"项目偏离预防" >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo 4. 点击安装 >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo. >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo ### 方法2: 手动安装 >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo ```bash >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo traeide --install-extension %ARCHIVE_NAME%.zip >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo ``` >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo. >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo ## 系统要求 >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo. >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo - Node.js ^>= 16.0.0 >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo - TraeIDE ^>= 1.0.0 >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo - 内存 ^>= 4GB >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo - 磁盘空间 ^>= 500MB >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo. >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo ## 技术支持 >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo. >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo - 文档: https://docs.traeide.com/deviation-prevention >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo - 问题反馈: https://github.com/traeide/deviation-prevention-mcp/issues >> "%RELEASE_DIR%\RELEASE_NOTES.md"
echo - 邮箱: support@traeide.com >> "%RELEASE_DIR%\RELEASE_NOTES.md"

echo ✅ 发布说明已生成

REM 创建部署脚本
echo @echo off > "%RELEASE_DIR%\install.bat"
echo echo 安装TraeIDE项目偏离预防MCP插件... >> "%RELEASE_DIR%\install.bat"
echo. >> "%RELEASE_DIR%\install.bat"
echo REM 检查TraeIDE是否安装 >> "%RELEASE_DIR%\install.bat"
echo traeide --version ^>nul 2^>^&1 >> "%RELEASE_DIR%\install.bat"
echo if %%errorlevel%% neq 0 ^( >> "%RELEASE_DIR%\install.bat"
echo     echo 错误: TraeIDE未安装或不在PATH中 >> "%RELEASE_DIR%\install.bat"
echo     pause >> "%RELEASE_DIR%\install.bat"
echo     exit /b 1 >> "%RELEASE_DIR%\install.bat"
echo ^) >> "%RELEASE_DIR%\install.bat"
echo. >> "%RELEASE_DIR%\install.bat"
echo REM 安装插件 >> "%RELEASE_DIR%\install.bat"
echo echo 正在安装插件... >> "%RELEASE_DIR%\install.bat"
echo traeide --install-extension %ARCHIVE_NAME%.zip >> "%RELEASE_DIR%\install.bat"
echo if %%errorlevel%% equ 0 ^( >> "%RELEASE_DIR%\install.bat"
echo     echo 插件安装成功！ >> "%RELEASE_DIR%\install.bat"
echo     echo 请重启TraeIDE以激活插件 >> "%RELEASE_DIR%\install.bat"
echo ^) else ^( >> "%RELEASE_DIR%\install.bat"
echo     echo 插件安装失败，请查看错误信息 >> "%RELEASE_DIR%\install.bat"
echo ^) >> "%RELEASE_DIR%\install.bat"
echo. >> "%RELEASE_DIR%\install.bat"
echo pause >> "%RELEASE_DIR%\install.bat"

echo ✅ 安装脚本已生成

REM 生成校验和文件
if "%POWERSHELL_AVAILABLE%"=="true" (
    echo 🔐 生成文件校验和...
    powershell -Command "Get-FileHash '%RELEASE_DIR%\%ARCHIVE_NAME%.zip' -Algorithm SHA256 | Select-Object Hash | Export-Csv '%RELEASE_DIR%\%ARCHIVE_NAME%.zip.sha256' -NoTypeInformation"
    if %errorlevel% equ 0 (
        echo ✅ SHA256校验和已生成
    ) else (
        echo ⚠️ 校验和生成失败
    )
)

echo ✅ 部署包创建完成
echo.

:show_final_summary
REM 显示最终摘要
echo ========================================
echo 🎉 部署完成！
echo ========================================
echo 📦 插件名称: TraeIDE项目偏离预防MCP插件
echo 🏷️ 版本号: v%VERSION%
echo 📁 发布目录: %RELEASE_DIR%
echo ========================================
echo.
echo 📋 发布包内容:
if exist "%RELEASE_DIR%" (
    dir /b "%RELEASE_DIR%"
) else (
    echo 发布目录不存在
)
echo.
echo 📋 下一步操作:
echo 1. 测试插件安装: 运行 install.bat
echo 2. 上传到TraeIDE插件市场
echo 3. 更新项目文档
echo 4. 发布版本标签
echo.
echo 🚀 插件已准备就绪！
echo.

REM 询问是否打开发布目录
set /p OPEN_DIR="是否打开发布目录? (y/n): "
if /i "%OPEN_DIR%"=="y" (
    if exist "%RELEASE_DIR%" (
        explorer "%RELEASE_DIR%"
    ) else (
        echo 发布目录不存在
    )
)

REM 询问是否测试安装
set /p TEST_INSTALL="是否测试插件安装? (y/n): "
if /i "%TEST_INSTALL%"=="y" (
    if exist "%RELEASE_DIR%\install.bat" (
        echo.
        echo 🧪 开始测试安装...
        call "%RELEASE_DIR%\install.bat"
    ) else (
        echo 安装脚本不存在
    )
)

goto :exit

:exit
echo.
echo 部署脚本执行完成，按任意键退出...
pause >nul