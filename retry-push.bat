@echo off
echo 开始GitHub推送重试脚本...

echo 检查Git状态...
git status

echo 检查远程仓库配置...
git remote -v

echo 开始重试推送...
set /a count=0
:retry
set /a count+=1
echo 尝试推送第 %count% 次...

git push origin master
if %errorlevel% equ 0 (
    echo 推送成功！
    goto create_tag
) else (
    echo 推送失败，错误代码: %errorlevel%
    if %count% lss 5 (
        echo 等待 10 秒后重试...
        timeout /t 10 /nobreak >nul
        goto retry
    ) else (
        echo 所有重试都失败了
        goto failed
    )
)

:create_tag
echo 开始创建版本标签...
git tag v1.0.0

echo 推送版本标签...
set /a tag_count=0
:tag_retry
set /a tag_count+=1
echo 尝试推送标签第 %tag_count% 次...

git push origin v1.0.0
if %errorlevel% equ 0 (
    echo 标签推送成功！GitHub Actions将自动触发发布流程。
    goto success
) else (
    echo 标签推送失败，错误代码: %errorlevel%
    if %tag_count% lss 3 (
        timeout /t 10 /nobreak >nul
        goto tag_retry
    ) else (
        echo 代码推送成功，但标签推送失败。请手动执行:
        echo git push origin v1.0.0
        goto partial_success
    )
)

:success
echo.
echo === 部署完成 ===
echo ✅ 代码已推送到GitHub
echo ✅ 版本标签v1.0.0已创建
echo ✅ GitHub Actions将自动构建和发布插件
echo.
echo 请访问以下链接查看发布状态:
echo https://github.com/wufayuzhi/XMjiucuo/actions
goto end

:partial_success
echo.
echo === 部分成功 ===
echo ✅ 代码已推送到GitHub
echo ❌ 版本标签推送失败
echo 请手动推送标签以触发自动发布
goto end

:failed
echo.
echo === 推送失败 ===
echo 请检查网络连接或尝试以下解决方案:
echo 1. 检查代理设置
echo 2. 使用VPN
echo 3. 使用GitHub Desktop
echo 4. 查看GITHUB_DEPLOYMENT_GUIDE.md获取更多解决方案

:end
echo.
echo 按任意键退出...
pause >nul