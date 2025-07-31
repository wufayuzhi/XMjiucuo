# GitHub推送重试脚本
Write-Host "开始GitHub推送重试脚本..." -ForegroundColor Green

# 检查Git状态
Write-Host "检查Git状态..." -ForegroundColor Yellow
git status

# 检查远程仓库配置
Write-Host "检查远程仓库配置..." -ForegroundColor Yellow
git remote -v

# 重试推送
$maxRetries = 5
$success = $false

for ($i = 1; $i -le $maxRetries; $i++) {
    Write-Host "尝试推送第 $i 次..." -ForegroundColor Cyan
    
    git push origin master
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "推送成功！" -ForegroundColor Green
        $success = $true
        break
    }
    else {
        Write-Host "推送失败，错误代码: $LASTEXITCODE" -ForegroundColor Red
        
        if ($i -lt $maxRetries) {
            Write-Host "等待 10 秒后重试..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
}

if ($success) {
    Write-Host "开始创建版本标签..." -ForegroundColor Green
    
    # 创建版本标签
    git tag v1.0.0
    
    # 推送标签
    Write-Host "推送版本标签..." -ForegroundColor Yellow
    $tagSuccess = $false
    
    for ($j = 1; $j -le 3; $j++) {
        Write-Host "尝试推送标签第 $j 次..." -ForegroundColor Cyan
        
        git push origin v1.0.0
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "标签推送成功！GitHub Actions将自动触发发布流程。" -ForegroundColor Green
            $tagSuccess = $true
            break
        }
        else {
            Write-Host "标签推送失败，错误代码: $LASTEXITCODE" -ForegroundColor Red
            if ($j -lt 3) {
                Start-Sleep -Seconds 10
            }
        }
    }
    
    if ($tagSuccess) {
        Write-Host "`n=== 部署完成 ===" -ForegroundColor Green
        Write-Host "✅ 代码已推送到GitHub" -ForegroundColor Green
        Write-Host "✅ 版本标签v1.0.0已创建" -ForegroundColor Green
        Write-Host "✅ GitHub Actions将自动构建和发布插件" -ForegroundColor Green
        Write-Host "`n请访问以下链接查看发布状态:" -ForegroundColor Yellow
        Write-Host "https://github.com/wufayuzhi/XMjiucuo/actions" -ForegroundColor Blue
    }
    else {
        Write-Host "`n代码推送成功，但标签推送失败。请手动执行:" -ForegroundColor Yellow
        Write-Host "git push origin v1.0.0" -ForegroundColor Cyan
    }
}
else {
    Write-Host "`n=== 推送失败 ===" -ForegroundColor Red
    Write-Host "请检查网络连接或尝试以下解决方案:" -ForegroundColor Yellow
    Write-Host "1. 检查代理设置" -ForegroundColor White
    Write-Host "2. 使用VPN" -ForegroundColor White
    Write-Host "3. 使用GitHub Desktop" -ForegroundColor White
    Write-Host "4. 查看GITHUB_DEPLOYMENT_GUIDE.md获取更多解决方案" -ForegroundColor White
}

Write-Host "`n按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")