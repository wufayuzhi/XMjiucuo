# 🤝 贡献指南

感谢您对TraeIDE项目偏差预防插件的关注！我们欢迎所有形式的贡献，包括但不限于代码、文档、测试、问题报告和功能建议。

## 📋 目录

- [开始之前](#开始之前)
- [开发环境设置](#开发环境设置)
- [贡献流程](#贡献流程)
- [代码规范](#代码规范)
- [测试指南](#测试指南)
- [文档贡献](#文档贡献)
- [问题报告](#问题报告)
- [功能请求](#功能请求)
- [社区准则](#社区准则)

## 🚀 开始之前

### 📖 了解项目
在开始贡献之前，请：
1. 阅读 [README.md](../README.md)
2. 查看 [项目文档](.trae/documents/TraeIDE项目偏离预防插件产品需求文档.md)
3. 浏览现有的 [Issues](../../issues) 和 [Pull Requests](../../pulls)
4. 了解项目的 [路线图](../../projects)

### 🎯 贡献类型
我们欢迎以下类型的贡献：
- 🐛 **Bug修复**: 修复现有功能中的问题
- ✨ **新功能**: 添加新的功能特性
- 📝 **文档改进**: 改善文档质量和完整性
- 🧪 **测试增强**: 添加或改进测试用例
- 🔧 **工具改进**: 改善开发工具和流程
- 🎨 **UI/UX改进**: 改善用户界面和体验
- 🚀 **性能优化**: 提升系统性能
- 🔒 **安全增强**: 提高系统安全性

## 🛠️ 开发环境设置

### 系统要求
- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **Git**: 2.20.0 或更高版本
- **TraeIDE**: 最新版本

### 环境配置

1. **Fork 仓库**
   ```bash
   # 在GitHub上Fork仓库，然后克隆到本地
   git clone https://github.com/YOUR_USERNAME/XMjiucuo.git
   cd XMjiucuo
   ```

2. **添加上游仓库**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/XMjiucuo.git
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑.env文件，配置必要的环境变量
   ```

5. **启动开发环境**
   ```bash
   # 启动前端开发服务器
   npm run dev
   
   # 在另一个终端启动MCP服务器
   npm run start-mcp
   ```

6. **验证环境**
   ```bash
   # 运行测试
   npm test
   
   # 运行代码检查
   npm run lint
   
   # 运行类型检查
   npm run type-check
   ```

## 🔄 贡献流程

### 1. 创建分支
```bash
# 确保主分支是最新的
git checkout main
git pull upstream main

# 创建新的功能分支
git checkout -b feature/your-feature-name
# 或者修复分支
git checkout -b fix/your-fix-name
```

### 2. 开发和测试
```bash
# 进行开发工作
# ...

# 运行测试
npm test

# 运行代码检查
npm run lint
npm run type-check

# 格式化代码
npm run format
```

### 3. 提交变更
```bash
# 添加变更文件
git add .

# 提交变更（使用规范的提交信息）
git commit -m "feat: add new feature description"
# 或者
git commit -m "fix: resolve issue description"
```

### 4. 推送和创建PR
```bash
# 推送到您的Fork仓库
git push origin feature/your-feature-name

# 在GitHub上创建Pull Request
```

## 📏 代码规范

### 提交信息规范
我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型 (type)**:
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档变更
- `style`: 代码格式变更（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变更
- `ci`: CI配置变更

**示例**:
```
feat(dashboard): add real-time project status monitoring

fix(mcp-server): resolve memory leak in context management

docs: update installation guide for Windows users
```

### 代码风格

#### TypeScript/JavaScript
- 使用 **ESLint** 和 **Prettier** 进行代码格式化
- 使用 **TypeScript** 进行类型检查
- 函数和变量使用 **camelCase**
- 常量使用 **UPPER_SNAKE_CASE**
- 类名使用 **PascalCase**

#### Vue组件
- 组件文件名使用 **PascalCase**
- 使用 **Composition API** 和 `<script setup>`
- Props和事件使用 **camelCase**
- 组件内部逻辑保持简洁，复杂逻辑提取到composables

#### CSS/样式
- 使用 **Tailwind CSS** 进行样式设计
- 避免使用 `@apply` 指令
- 保持响应式设计
- 使用语义化的类名

### 文件组织
```
src/
├── components/          # 可复用组件
├── pages/              # 页面组件
├── composables/        # Vue组合式函数
├── utils/              # 工具函数
├── types/              # TypeScript类型定义
├── config/             # 配置文件
└── assets/             # 静态资源
```

## 🧪 测试指南

### 测试类型
1. **单元测试**: 测试独立的函数和组件
2. **集成测试**: 测试组件间的交互
3. **端到端测试**: 测试完整的用户流程

### 测试要求
- 新功能必须包含相应的测试
- Bug修复应该包含回归测试
- 测试覆盖率应该保持在80%以上
- 所有测试必须通过才能合并

### 运行测试
```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test -- --testNamePattern="test-name"

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch
```

## 📝 文档贡献

### 文档类型
- **用户文档**: 安装、配置、使用指南
- **开发者文档**: API文档、架构说明
- **贡献文档**: 贡献指南、开发流程

### 文档规范
- 使用 **Markdown** 格式
- 包含清晰的标题和目录
- 提供代码示例和截图
- 保持内容的准确性和时效性

### 文档结构
```
docs/
├── user-guide/         # 用户指南
├── developer-guide/    # 开发者指南
├── api/               # API文档
└── contributing/      # 贡献指南
```

## 🐛 问题报告

### 报告Bug
1. 搜索现有issues，避免重复报告
2. 使用 [Bug报告模板](.github/ISSUE_TEMPLATE/bug_report.md)
3. 提供详细的复现步骤
4. 包含环境信息和日志
5. 添加相关的标签

### Bug报告质量
好的Bug报告应该包含：
- **清晰的标题**: 简洁描述问题
- **详细的描述**: 问题的具体表现
- **复现步骤**: 如何重现问题
- **期望行为**: 应该发生什么
- **实际行为**: 实际发生了什么
- **环境信息**: 操作系统、版本等
- **日志信息**: 相关的错误日志

## ✨ 功能请求

### 提出功能请求
1. 搜索现有的功能请求
2. 使用 [功能请求模板](.github/ISSUE_TEMPLATE/feature_request.md)
3. 详细描述功能需求和使用场景
4. 说明功能的价值和优先级
5. 考虑实现的复杂度

### 功能请求评估
功能请求将根据以下标准评估：
- **用户价值**: 对用户的实际价值
- **技术可行性**: 实现的技术难度
- **维护成本**: 长期维护的成本
- **项目一致性**: 与项目目标的一致性

## 👥 社区准则

### 行为准则
我们致力于为所有人提供友好、安全和欢迎的环境。请遵循以下准则：

1. **尊重他人**: 尊重不同的观点和经验
2. **建设性沟通**: 提供有建设性的反馈
3. **包容性**: 欢迎所有背景的贡献者
4. **专业性**: 保持专业和礼貌的交流
5. **协作精神**: 以团队合作的方式工作

### 沟通渠道
- **GitHub Issues**: 问题报告和功能请求
- **GitHub Discussions**: 一般讨论和问答
- **Pull Requests**: 代码审查和讨论

### 获得帮助
如果您需要帮助：
1. 查看现有的文档和FAQ
2. 搜索GitHub Issues
3. 在GitHub Discussions中提问
4. 联系维护者

## 🏆 贡献者认可

我们重视每一个贡献，无论大小。贡献者将在以下方式获得认可：

- **贡献者列表**: 在README中列出所有贡献者
- **发布说明**: 在版本发布时感谢贡献者
- **特殊徽章**: 为重要贡献者提供特殊认可

## 📞 联系我们

如果您有任何问题或建议，请通过以下方式联系我们：

- **GitHub Issues**: [创建新Issue](../../issues/new)
- **GitHub Discussions**: [参与讨论](../../discussions)
- **邮件**: [项目邮箱]

---

再次感谢您的贡献！您的参与使这个项目变得更好。🎉