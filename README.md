# 🚀 TraeIDE项目偏差预防插件

[![CI Status](https://github.com/YOUR_USERNAME/XMjiucuo/workflows/持续集成检查/badge.svg)](https://github.com/YOUR_USERNAME/XMjiucuo/actions)
[![Release](https://github.com/YOUR_USERNAME/XMjiucuo/workflows/发布TraeIDE插件/badge.svg)](https://github.com/YOUR_USERNAME/XMjiucuo/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TraeIDE](https://img.shields.io/badge/TraeIDE-compatible-orange.svg)](https://trae.ai/)

一个智能的TraeIDE插件，专门用于预防项目开发过程中的偏差，提供实时监控、上下文管理、需求追踪和AI辅助分析功能。

## 📋 目录

- [功能特性](#-功能特性)
- [快速开始](#-快速开始)
- [安装方法](#-安装方法)
- [使用指南](#-使用指南)
- [开发指南](#-开发指南)
- [GitHub自动部署](#-github自动部署)
- [API文档](#-api文档)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

## ✨ 功能特性

### 🎯 核心功能
- **🔍 智能偏差检测**: 实时监控项目开发过程，自动识别偏离原始需求的情况
- **📊 项目仪表板**: 全面的项目状态概览，包括进度、质量指标和风险评估
- **🧠 上下文管理**: 自动维护和更新项目上下文信息，确保开发一致性
- **📝 需求管理**: 智能需求追踪和分析，支持需求变更管理
- **📚 文档中心**: 集中管理项目文档、历史记录和知识库
- **🤖 AI集成**: 支持DeepSeek等先进AI模型，提供智能建议和分析
- **🔄 会话回顾**: 完整的操作历史和会话追踪，支持回溯分析
- **⚙️ 系统配置**: 灵活的配置管理和参数调优

### 🚀 技术特性
- **高性能**: 内存使用 < 512MB，API响应时间 < 100ms
- **跨平台**: 支持Windows、macOS、Linux
- **现代化UI**: 基于Vue 3 + TypeScript + Tailwind CSS
- **实时通信**: WebSocket支持实时数据更新
- **安全可靠**: 生产级安全配置和错误处理
- **自动重启**: 支持服务自动恢复和健康检查

## 🚀 快速开始

### 系统要求
- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **TraeIDE**: 最新版本
- **内存**: 至少 512MB 可用内存

### 一键安装

#### 方法1: TraeIDE插件市场（推荐）
1. 打开TraeIDE
2. 按 `Ctrl+Shift+X` 打开扩展面板
3. 搜索 "项目偏差预防"
4. 点击 "安装" 按钮
5. 重启TraeIDE

#### 方法2: GitHub Releases
1. 访问 [Releases页面](https://github.com/YOUR_USERNAME/XMjiucuo/releases)
2. 下载最新版本的插件包
3. 解压到TraeIDE插件目录
4. 重启TraeIDE

## 📦 安装方法

### 开发环境安装

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/XMjiucuo.git
cd XMjiucuo

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，配置必要的API密钥

# 启动开发服务器
npm run dev

# 在另一个终端启动MCP服务器
npm run start-mcp
```

### 生产环境部署

```bash
# 构建生产版本
npm run build

# 运行部署脚本
.\deploy-plugin.bat  # Windows
# 或
./deploy-plugin.sh   # Linux/macOS

# 启动生产服务
node mcp-server.js
```

## 📖 使用指南

### 基本配置

1. **API配置**
   ```bash
   # 编辑.env文件
   DEEPSEEK_API_KEY=your_api_key_here
   DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
   ```

2. **服务端口**
   ```bash
   MCP_WEB_PORT=3001    # MCP服务器端口
   WEB_PORT=9000        # Web界面端口
   ```

3. **性能调优**
   ```bash
   MCP_MAX_MEMORY=512           # 内存限制(MB)
   MAX_CONCURRENT_REQUESTS=10   # 最大并发请求
   ```

### 核心功能使用

#### 1. 项目仪表板
- 访问 `http://localhost:9000/dashboard`
- 查看项目状态、进度和关键指标
- 监控偏差检测结果

#### 2. 上下文管理
- 自动捕获项目上下文变化
- 手动添加重要上下文信息
- 查看上下文历史和变更记录

#### 3. 需求管理
- 导入和管理项目需求
- 追踪需求变更和影响分析
- 生成需求覆盖率报告

#### 4. AI辅助分析
- 配置DeepSeek API密钥
- 使用AI进行代码分析和建议
- 自动生成项目报告

## 🛠️ 开发指南

### 项目结构

```
├── .github/                 # GitHub Actions工作流
│   ├── workflows/          # CI/CD配置
│   ├── ISSUE_TEMPLATE/     # Issue模板
│   └── CONTRIBUTING.md     # 贡献指南
├── src/                    # 前端源码
│   ├── components/         # Vue组件
│   ├── pages/             # 页面组件
│   ├── utils/             # 工具函数
│   ├── config/            # 配置文件
│   └── types/             # TypeScript类型
├── build/                 # 构建产物
├── scripts/               # 构建脚本
├── mcp-server.js         # MCP服务器
├── package.json          # 项目配置
└── README.md             # 项目说明
```

### 开发命令

```bash
# 开发服务器
npm run dev              # 启动前端开发服务器
npm run start-mcp        # 启动MCP服务器

# 代码质量
npm run lint             # ESLint检查
npm run lint:fix         # 自动修复ESLint问题
npm run format           # Prettier格式化
npm run type-check       # TypeScript类型检查

# 测试
npm test                 # 运行测试
npm run test:coverage    # 生成覆盖率报告

# 构建
npm run build            # 构建生产版本
npm run preview          # 预览构建结果
```

### 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **UI框架**: Tailwind CSS + Lucide Icons
- **状态管理**: Vue Composition API
- **路由**: Vue Router 4
- **后端**: Node.js + Express
- **通信协议**: MCP (Model Context Protocol)
- **AI集成**: DeepSeek API
- **构建工具**: Vite + TypeScript
- **代码质量**: ESLint + Prettier

## 🤖 GitHub自动部署

本项目配置了完整的GitHub Actions CI/CD流程，支持自动化构建、测试、部署和发布。

### 🔄 工作流概览

| 工作流 | 触发条件 | 功能 |
|--------|----------|------|
| **持续集成** | Push/PR到主分支 | 代码质量检查、测试、构建验证 |
| **自动部署** | Push到main分支 | 构建、打包、部署插件 |
| **版本发布** | 推送版本标签 | 创建GitHub Release |
| **依赖更新** | 每周定时/手动 | 自动更新依赖和安全修复 |

### 🚀 自动发布流程

1. **创建版本标签**
   ```bash
   # 更新版本号
   npm version patch  # 或 minor, major
   
   # 推送标签触发发布
   git push origin v1.0.1
   ```

2. **自动执行**
   - ✅ 代码质量检查
   - 🧪 运行所有测试
   - 🏗️ 构建生产版本
   - 📦 创建插件包
   - 🚀 发布到GitHub Releases
   - 📝 生成发布说明

3. **部署产物**
   - `traeide-deviation-prevention-plugin-v1.0.0-production.zip`
   - 安装指南和部署报告
   - SHA256校验和文件

### 📊 质量保证

- **多环境测试**: Ubuntu, Windows, macOS
- **多版本Node.js**: 18.x, 20.x, 22.x
- **安全扫描**: 自动依赖漏洞检查
- **性能测试**: 内存和响应时间监控
- **文档检查**: 确保文档完整性

详细配置请参考 [GitHub Actions配置文档](.github/README.md)。

## 📚 API文档

### MCP服务器API

#### 健康检查
```http
GET /api/status
Response: { "status": "ok", "timestamp": "2024-01-01T00:00:00Z" }
```

#### 项目分析
```http
POST /api/analyze
Content-Type: application/json

{
  "projectPath": "/path/to/project",
  "analysisType": "deviation"
}
```

#### 上下文管理
```http
GET /api/context
POST /api/context
PUT /api/context/:id
DELETE /api/context/:id
```

### 配置API

#### 获取配置
```http
GET /api/config
Response: { "mcp": {...}, "ai": {...}, "system": {...} }
```

#### 更新配置
```http
PUT /api/config
Content-Type: application/json

{
  "mcp": { "port": 3001 },
  "ai": { "apiKey": "xxx" }
}
```

完整API文档请参考 [API参考文档](docs/api.md)。

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [贡献指南](.github/CONTRIBUTING.md) 了解详细信息。

### 快速贡献

1. **Fork仓库**
2. **创建功能分支**: `git checkout -b feature/amazing-feature`
3. **提交变更**: `git commit -m 'feat: add amazing feature'`
4. **推送分支**: `git push origin feature/amazing-feature`
5. **创建Pull Request**

### 贡献类型

- 🐛 Bug修复
- ✨ 新功能开发
- 📝 文档改进
- 🧪 测试增强
- 🎨 UI/UX改进
- 🚀 性能优化

## 📞 支持与反馈

### 获取帮助

- 📖 **文档**: [项目文档](docs/)
- 🐛 **Bug报告**: [GitHub Issues](https://github.com/YOUR_USERNAME/XMjiucuo/issues)
- 💡 **功能请求**: [GitHub Issues](https://github.com/YOUR_USERNAME/XMjiucuo/issues)
- 💬 **讨论**: [GitHub Discussions](https://github.com/YOUR_USERNAME/XMjiucuo/discussions)

### 社区

- **GitHub**: [项目主页](https://github.com/YOUR_USERNAME/XMjiucuo)
- **文档**: [在线文档](https://your-username.github.io/XMjiucuo)
- **更新日志**: [CHANGELOG.md](CHANGELOG.md)

## 📄 许可证

本项目采用 [MIT许可证](LICENSE)。

## 🙏 致谢

感谢所有贡献者和以下开源项目：

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [TypeScript](https://www.typescriptlang.org/) - JavaScript的超集
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [TraeIDE](https://trae.ai/) - 智能开发环境

---

<div align="center">
  <p>🌟 如果这个项目对您有帮助，请给我们一个Star！</p>
  <p>Made with ❤️ by the TraeIDE Community</p>
</div>
