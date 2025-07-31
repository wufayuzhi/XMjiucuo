# GitHub部署指南

## 当前状态
项目已完成以下配置：
- ✅ Git仓库初始化完成
- ✅ 所有文件已提交到本地仓库
- ✅ 远程仓库已配置：https://github.com/wufayuzhi/XMjiucuo.git
- ✅ .gitignore已更新，排除了大文件
- ✅ GitHub Actions工作流已配置完成

## 网络连接问题
当前遇到GitHub连接问题：
```
fatal: unable to access 'https://github.com/wufayuzhi/XMjiucuo.git/': Failed to connect to github.com port 443
```

## 解决方案

### 方案1：网络连接问题排查
1. **检查网络环境**
   - 确认是否使用了代理或VPN
   - 测试GitHub连接：`ping github.com`
   - 检查防火墙设置

2. **配置Git代理（如果使用代理）**
   ```bash
   git config --global http.proxy http://proxy-server:port
   git config --global https.proxy https://proxy-server:port
   ```

3. **Git网络优化配置**
   ```bash
   git config --global http.postBuffer 524288000
   git config --global http.lowSpeedLimit 0
   git config --global http.lowSpeedTime 999999
   git config --global http.sslVerify false
   ```

### 方案2：使用SSH方式（推荐）
1. 生成SSH密钥：
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   ```

2. 将公钥添加到GitHub账户

3. 更改远程仓库URL为SSH：
   ```bash
   git remote set-url origin git@github.com:wufayuzhi/XMjiucuo.git
   ```

4. 推送代码：
   ```bash
   git push -u origin master
   ```

### 方案3：替代推送方法
1. **使用GitHub CLI**
   ```bash
   # 安装GitHub CLI
   winget install GitHub.cli
   # 登录并推送
   gh auth login
   gh repo create wufayuzhi/XMjiucuo --public
   git push origin master
   ```

2. **使用不同的DNS**
   ```bash
   # 临时使用Google DNS
   nslookup github.com 8.8.8.8
   ```

3. **手动上传**
   - 访问 https://github.com/wufayuzhi/XMjiucuo
   - 使用GitHub网页界面上传文件
   - 或者使用GitHub Desktop客户端

4. **网络重试脚本**
   ```bash
   # 创建重试推送脚本
   for i in {1..5}; do
     echo "尝试推送第 $i 次..."
     git push origin master && break
     sleep 10
   done
   ```

## 完成部署后的步骤

### 1. 推送代码
```bash
git push -u origin master
```

### 2. 创建版本标签触发自动发布
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 3. 验证自动化工作流
推送v1.0.0标签后，GitHub Actions将自动：
- 运行质量检查（lint, test, type-check）
- 构建生产版本
- 创建GitHub Release
- 上传插件包

## 已配置的GitHub Actions工作流

1. **ci.yml** - 持续集成
   - 代码质量检查
   - 自动化测试
   - 类型检查

2. **deploy.yml** - 自动部署
   - 构建生产版本
   - 创建插件包
   - 上传构建产物

3. **release.yml** - 版本发布
   - 自动创建GitHub Release
   - 生成发布说明
   - 上传插件安装包

4. **dependency-update.yml** - 依赖更新
   - 自动检查依赖更新
   - 创建PR更新依赖

## 插件安装说明

发布完成后，用户可以通过以下方式安装插件：

1. **从GitHub Releases下载**
   - 访问仓库的Releases页面
   - 下载最新的插件包
   - 解压到TraeIDE插件目录

2. **一键安装脚本**
   - 运行插件包中的`start-mcp.bat`
   - 插件将自动启动并集成到TraeIDE

## 注意事项

- 确保GitHub仓库设置为公开，以便用户下载
- 版本标签格式必须为`v*.*.*`（如v1.0.0）
- 推送标签将自动触发发布流程
- 所有自动化配置已完成，无需额外设置

## 技术支持

如果遇到问题，请检查：
1. 网络连接状态
2. GitHub访问权限
3. Git配置是否正确
4. 代理设置（如适用）