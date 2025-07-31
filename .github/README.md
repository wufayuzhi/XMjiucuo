# 🚀 GitHub自动部署配置

本目录包含了TraeIDE项目偏差预防插件的GitHub Actions自动化工作流配置，实现了完整的CI/CD流程。

## 📋 工作流概览

### 🔄 主要工作流

| 工作流 | 文件 | 触发条件 | 功能描述 |
|--------|------|----------|----------|
| **持续集成** | `ci.yml` | Push/PR到主分支 | 代码质量检查、测试、构建验证 |
| **自动部署** | `deploy.yml` | Push到main分支 | 构建、打包、部署插件 |
| **版本发布** | `release.yml` | 推送版本标签 | 创建GitHub Release和插件包 |
| **依赖更新** | `dependency-update.yml` | 定时/手动 | 自动更新依赖和安全修复 |

### 📝 模板文件

| 模板 | 文件 | 用途 |
|------|------|------|
| **Bug报告** | `ISSUE_TEMPLATE/bug_report.md` | 标准化Bug报告流程 |
| **功能请求** | `ISSUE_TEMPLATE/feature_request.md` | 标准化功能请求流程 |
| **PR模板** | `pull_request_template.md` | 标准化Pull Request流程 |
| **贡献指南** | `CONTRIBUTING.md` | 项目贡献指南和规范 |

## 🔧 配置说明

### 环境变量

工作流使用以下环境变量：

```yaml
env:
  NODE_VERSION: '22.17.1'  # Node.js版本
  PLUGIN_NAME: 'traeide-deviation-prevention-plugin'  # 插件名称
```

### 必需的Secrets

在GitHub仓库设置中配置以下Secrets：

| Secret | 描述 | 必需 |
|--------|------|------|
| `GITHUB_TOKEN` | GitHub访问令牌 | ✅ (自动提供) |
| `DEEPSEEK_API_KEY` | DeepSeek API密钥 | ❌ (可选) |

## 🚀 使用指南

### 1. 持续集成 (CI)

**触发条件**:
- 推送到 `main`、`master`、`develop` 分支
- 创建Pull Request
- 每天凌晨2点定时运行

**执行内容**:
- 多版本Node.js兼容性测试
- 代码质量检查 (ESLint, Prettier)
- TypeScript类型检查
- 安全扫描
- 性能测试
- 跨平台兼容性测试
- 文档检查
- 构建验证

### 2. 自动部署

**触发条件**:
- 推送到 `main` 或 `master` 分支
- 推送版本标签 (`v*`)
- 手动触发

**执行内容**:
- 代码质量检查
- 构建生产版本
- 创建插件包
- 生成部署报告
- 上传构建产物

### 3. 版本发布

**触发条件**:
- 推送版本标签 (`v*.*.*`)
- 手动触发（指定版本号）

**执行内容**:
- 完整的质量检查
- 构建生产版本插件包
- 创建GitHub Release
- 生成发布说明
- 上传插件包和文档

**发布步骤**:
```bash
# 1. 更新版本号
npm version patch  # 或 minor, major

# 2. 推送标签
git push origin v1.0.1

# 3. 自动触发发布工作流
```

### 4. 依赖更新

**触发条件**:
- 每周一凌晨2点自动运行
- 手动触发（可选择更新类型）

**更新类型**:
- `patch`: 补丁版本更新
- `minor`: 次要版本更新
- `major`: 主要版本更新
- `all`: 所有版本更新

**执行内容**:
- 检查过时的依赖
- 自动更新依赖
- 运行测试验证
- 安全漏洞扫描和修复
- 创建Pull Request

## 📦 部署产物

### 生产插件包结构

```
traeide-deviation-prevention-plugin-v1.0.0-production.zip
├── dist/                    # 前端构建文件
├── config/                  # 配置文件
├── mcp-server.js           # MCP服务器
├── package.json            # 包配置
├── package-lock.json       # 依赖锁定
├── traeide-config.json     # TraeIDE配置
├── .env.production         # 生产环境变量
├── start-mcp.bat          # Windows启动脚本
├── start-mcp.sh           # Unix启动脚本
├── stop-mcp.bat           # Windows停止脚本
├── README.md              # 说明文档
└── INSTALL.md             # 安装指南
```

### 发布文件

每次发布包含以下文件：
- `插件包.zip` - 主安装包
- `插件包.zip.sha256` - 校验和文件
- `INSTALL.md` - 安装指南
- `DEPLOYMENT_REPORT.md` - 部署报告

## 🔍 质量保证

### 代码质量检查

- **ESLint**: JavaScript/TypeScript代码规范
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查
- **Vue**: 组件规范检查

### 测试覆盖

- **单元测试**: 组件和函数测试
- **集成测试**: 模块间交互测试
- **端到端测试**: 完整流程测试
- **性能测试**: 响应时间和内存使用

### 安全检查

- **依赖扫描**: `npm audit` 安全漏洞检查
- **自动修复**: 自动修复已知安全问题
- **定期更新**: 每周自动检查依赖更新

## 🛠️ 本地开发

### 模拟CI环境

```bash
# 运行完整的质量检查
npm run quality

# 运行测试
npm test

# 构建生产版本
npm run build

# 启动本地服务
npm run dev
npm run start-mcp
```

### 测试部署脚本

```bash
# Windows
.\deploy-plugin.bat

# 验证构建产物
ls build/
```

## 🔧 自定义配置

### 修改工作流

1. **更改Node.js版本**:
   ```yaml
   env:
     NODE_VERSION: '20.x'  # 修改为所需版本
   ```

2. **添加新的检查步骤**:
   ```yaml
   - name: 自定义检查
     run: |
       echo "执行自定义检查"
       # 添加检查命令
   ```

3. **修改触发条件**:
   ```yaml
   on:
     push:
       branches: [ main, develop ]  # 添加或移除分支
   ```

### 添加新的环境

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: ['18.x', '20.x', '22.x']
```

## 📊 监控和通知

### 工作流状态

- ✅ **成功**: 所有检查通过
- ❌ **失败**: 存在问题需要修复
- ⏭️ **跳过**: 条件不满足，跳过执行
- 🔄 **运行中**: 正在执行

### 通知渠道

- **GitHub通知**: 自动发送到关注者
- **Email通知**: 根据GitHub设置
- **Slack集成**: 可配置Slack通知

## 🐛 故障排除

### 常见问题

1. **构建失败**
   - 检查Node.js版本兼容性
   - 验证依赖是否正确安装
   - 查看构建日志获取详细错误

2. **测试失败**
   - 检查测试环境配置
   - 验证模拟数据和API
   - 查看测试日志

3. **部署失败**
   - 检查权限设置
   - 验证Secrets配置
   - 查看部署日志

### 调试技巧

```yaml
# 添加调试输出
- name: 调试信息
  run: |
    echo "当前目录: $(pwd)"
    echo "文件列表: $(ls -la)"
    echo "环境变量: $(env | grep NODE)"
```

## 📚 相关文档

- [GitHub Actions文档](https://docs.github.com/en/actions)
- [Node.js CI最佳实践](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs)
- [TraeIDE插件开发指南](../README.md)
- [贡献指南](CONTRIBUTING.md)

## 🤝 贡献

如果您想改进CI/CD流程：

1. Fork仓库
2. 创建功能分支
3. 修改工作流文件
4. 测试变更
5. 提交Pull Request

请参考 [贡献指南](CONTRIBUTING.md) 了解详细信息。

---

🎉 **感谢使用GitHub自动部署！** 这些工作流将帮助您维护高质量的代码和可靠的发布流程。