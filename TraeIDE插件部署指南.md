# TraeIDE项目偏离预防MCP插件部署指南

## 1. 部署概述

本指南将帮助您将TraeIDE项目偏离预防系统作为MCP扩展插件部署到TraeIDE编辑器中。该插件基于MCP（模型上下文协议）实现，提供智能化的项目偏离预防解决方案。

### 1.1 部署架构

```
TraeIDE编辑器
├── MCP客户端（内置）
└── 项目偏离预防MCP插件
    ├── MCP服务器（Node.js）
    ├── Web界面（Vue.js）
    └── 配置文件（JSON）
```

### 1.2 系统要求

- **TraeIDE版本**：≥ 1.0.0（支持MCP协议）
- **Node.js版本**：≥ 16.0.0
- **操作系统**：Windows 10/11, macOS 10.15+, Linux Ubuntu 18.04+
- **内存要求**：≥ 4GB RAM
- **磁盘空间**：≥ 500MB

## 2. 插件打包准备

### 2.1 项目结构优化

确保项目结构符合TraeIDE MCP插件标准：

```
traeide-deviation-prevention/
├── package.json                 # 插件元数据
├── traeide-config.json         # TraeIDE配置文件
├── mcp-server.js               # MCP服务器入口
├── start-mcp.bat              # Windows启动脚本
├── start-mcp.sh               # Unix启动脚本
├── stop-mcp.bat               # Windows停止脚本
├── stop-mcp.sh                # Unix停止脚本
├── dist/                       # 前端构建产物
├── src/                        # 源代码
├── docs/                       # 文档
└── README.md                   # 说明文档
```

### 2.2 配置文件优化

#### 2.2.1 package.json 配置

```json
{
  "name": "traeide-deviation-prevention",
  "version": "1.0.0",
  "description": "TraeIDE项目偏离预防MCP插件",
  "main": "mcp-server.js",
  "type": "module",
  "engines": {
    "node": ">=16.0.0",
    "traeide": ">=1.0.0"
  },
  "keywords": [
    "traeide",
    "mcp",
    "deviation-prevention",
    "project-management",
    "ai-assistant"
  ],
  "author": "TraeIDE Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/traeide/deviation-prevention-mcp"
  },
  "scripts": {
    "start": "node mcp-server.js",
    "start-web": "node mcp-server.js --web-only",
    "start-all": "node mcp-server.js --full",
    "stop-all": "pkill -f mcp-server.js",
    "install-deps": "npm install",
    "health-check": "curl -f http://localhost:3001/api/status || exit 1",
    "build": "npm run build:web",
    "build:web": "vite build",
    "dev": "vite",
    "preview": "vite preview"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "express": "^4.18.2",
    "ws": "^8.14.2",
    "chokidar": "^3.5.3",
    "sqlite3": "^5.1.6",
    "node-cron": "^3.0.3"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@vitejs/plugin-vue": "^4.4.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0",
    "vue": "^3.3.0"
  },
  "traeide": {
    "displayName": "项目偏离预防助手",
    "description": "基于Claude-4-Sonnet的智能项目偏离预防系统",
    "category": "AI助手",
    "icon": "assets/icon.svg",
    "activationEvents": [
      "onStartupFinished",
      "onCommand:traeide.deviation.analyze"
    ],
    "contributes": {
      "commands": [
        {
          "command": "traeide.deviation.analyze",
          "title": "分析项目偏离",
          "category": "偏离预防"
        },
        {
          "command": "traeide.deviation.quickFix",
          "title": "快速修正",
          "category": "偏离预防"
        }
      ],
      "views": {
        "explorer": [
          {
            "id": "deviationPreventionView",
            "name": "偏离预防",
            "when": "workspaceHasProjects"
          }
        ]
      },
      "configuration": {
        "title": "偏离预防设置",
        "properties": {
          "traeide.deviation.autoStart": {
            "type": "boolean",
            "default": true,
            "description": "自动启动偏离检测"
          },
          "traeide.deviation.threshold": {
            "type": "number",
            "default": 60,
            "description": "偏离预警阈值（%）"
          }
        }
      }
    }
  }
}
```

#### 2.2.2 traeide-config.json 优化

```json
{
  "name": "TraeIDE项目偏离预防MCP插件",
  "version": "1.0.0",
  "description": "基于Claude-4-Sonnet的智能项目偏离预防系统，通过MCP协议提供上下文管理、需求校验、历史追踪等功能",
  "type": "mcp-plugin",
  "webApp": {
    "enabled": true,
    "startCommand": "start-mcp.bat",
    "stopCommand": "stop-mcp.bat",
    "port": 3001,
    "healthCheckUrl": "http://localhost:3001/api/status"
  },
  "mcpServer": {
    "command": "node mcp-server.js",
    "env": {
      "TRAEIDE_PROJECT_PATH": "${workspaceFolder}",
      "MCP_WEB_PORT": "3001",
      "NODE_ENV": "production"
    }
  },
  "ui": {
    "sidebar": {
      "title": "偏离预防",
      "icon": "shield-check",
      "webview": "http://localhost:3001"
    },
    "panels": [
      {
        "id": "projectDashboard",
        "title": "项目仪表板",
        "webview": "http://localhost:3001/#/dashboard"
      },
      {
        "id": "contextManagement",
        "title": "上下文管理",
        "webview": "http://localhost:3001/#/context"
      },
      {
        "id": "requirementManagement",
        "title": "需求管理",
        "webview": "http://localhost:3001/#/requirements"
      },
      {
        "id": "historyCenter",
        "title": "历史文档中心",
        "webview": "http://localhost:3001/#/history"
      },
      {
        "id": "sessionBacktrack",
        "title": "会话回溯",
        "webview": "http://localhost:3001/#/sessions"
      },
      {
        "id": "claudeIntegration",
        "title": "Claude-4集成",
        "webview": "http://localhost:3001/#/claude"
      },
      {
        "id": "systemConfig",
        "title": "系统配置",
        "webview": "http://localhost:3001/#/config"
      }
    ],
    "contextMenu": [
      {
        "command": "traeide.deviation.analyze",
        "title": "分析偏离",
        "group": "deviation"
      },
      {
        "command": "traeide.deviation.quickFix",
        "title": "快速修正",
        "group": "deviation"
      },
      {
        "command": "traeide.deviation.addToContext",
        "title": "添加到上下文",
        "group": "deviation"
      }
    ],
    "notifications": {
      "deviationWarning": {
        "title": "偏离预警",
        "message": "检测到项目偏离，建议查看详情",
        "severity": "warning"
      }
    },
    "statusBar": [
      {
        "id": "deviationStatus",
        "text": "偏离状态: 正常",
        "tooltip": "点击查看偏离详情",
        "command": "traeide.deviation.showStatus"
      }
    ]
  },
  "commands": [
    {
      "command": "traeide.deviation.analyze",
      "title": "分析项目偏离",
      "category": "偏离预防"
    },
    {
      "command": "traeide.deviation.quickFix",
      "title": "快速修正偏离",
      "category": "偏离预防"
    },
    {
      "command": "traeide.deviation.addToContext",
      "title": "添加到上下文",
      "category": "偏离预防"
    },
    {
      "command": "traeide.deviation.showStatus",
      "title": "显示偏离状态",
      "category": "偏离预防"
    },
    {
      "command": "traeide.deviation.openDashboard",
      "title": "打开项目仪表板",
      "category": "偏离预防"
    }
  ],
  "keybindings": [
    {
      "command": "traeide.deviation.analyze",
      "key": "ctrl+shift+d",
      "mac": "cmd+shift+d",
      "when": "editorTextFocus"
    },
    {
      "command": "traeide.deviation.quickFix",
      "key": "ctrl+shift+f",
      "mac": "cmd+shift+f",
      "when": "editorTextFocus"
    }
  ],
  "configuration": {
    "traeide.autoStart": {
      "type": "boolean",
      "default": true,
      "description": "自动启动偏离检测服务"
    },
    "traeide.autoAnalyze": {
      "type": "boolean",
      "default": true,
      "description": "自动分析代码变更"
    },
    "traeide.notificationLevel": {
      "type": "string",
      "enum": ["all", "warning", "error", "none"],
      "default": "warning",
      "description": "通知级别"
    },
    "traeide.deviationThreshold": {
      "type": "number",
      "default": 60,
      "minimum": 0,
      "maximum": 100,
      "description": "偏离预警阈值（百分比）"
    },
    "traeide.deepseek.apiKey": {
      "type": "string",
      "default": "",
      "description": "DeepSeek API密钥"
    },
    "traeide.deepseek.model": {
      "type": "string",
      "enum": ["deepseek-chat", "deepseek-coder"],
      "default": "deepseek-chat",
      "description": "DeepSeek模型选择"
    }
  },
  "views": {
    "explorer": [
      {
        "id": "deviationPreventionExplorer",
        "name": "偏离预防",
        "when": "workspaceHasProjects"
      }
    ]
  },
  "viewsContainers": {
    "activitybar": [
      {
        "id": "deviationPrevention",
        "title": "偏离预防",
        "icon": "$(shield-check)"
      }
    ]
  },
  "dependencies": [
    "@modelcontextprotocol/sdk",
    "express",
    "ws",
    "chokidar"
  ],
  "scripts": {
    "start": "node mcp-server.js",
    "start-web": "node mcp-server.js --web-only",
    "start-all": "node mcp-server.js --full",
    "stop-all": "pkill -f mcp-server.js || taskkill /f /im node.exe",
    "install-deps": "npm install",
    "health-check": "curl -f http://localhost:3001/api/status || exit 1"
  },
  "engines": {
    "node": ">=16.0.0",
    "traeide": ">=1.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/traeide/deviation-prevention-mcp"
  },
  "keywords": [
    "traeide",
    "mcp",
    "deviation-prevention",
    "project-management",
    "ai-assistant",
    "claude-4-sonnet"
  ],
  "author": "TraeIDE Team",
  "license": "MIT"
}
```

## 3. 插件打包流程

### 3.1 构建前端资源

```bash
# 安装依赖
npm install

# 构建前端
npm run build

# 验证构建结果
ls -la dist/
```

### 3.2 创建启动脚本

#### Windows启动脚本 (start-mcp.bat)
```batch
@echo off
echo Starting TraeIDE Deviation Prevention MCP Server...

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    exit /b 1
)

REM 检查依赖是否安装
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM 启动MCP服务器
set TRAEIDE_PROJECT_PATH=%CD%
set MCP_WEB_PORT=3001
set NODE_ENV=production

node mcp-server.js
```

#### Unix启动脚本 (start-mcp.sh)
```bash
#!/bin/bash
echo "Starting TraeIDE Deviation Prevention MCP Server..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# 启动MCP服务器
export TRAEIDE_PROJECT_PATH=$(pwd)
export MCP_WEB_PORT=3001
export NODE_ENV=production

node mcp-server.js
```

### 3.3 打包插件

```bash
# 创建插件包目录
mkdir -p traeide-deviation-prevention-plugin

# 复制必要文件
cp -r dist/ traeide-deviation-prevention-plugin/
cp package.json traeide-deviation-prevention-plugin/
cp traeide-config.json traeide-deviation-prevention-plugin/
cp mcp-server.js traeide-deviation-prevention-plugin/
cp start-mcp.* traeide-deviation-prevention-plugin/
cp stop-mcp.* traeide-deviation-prevention-plugin/
cp README.md traeide-deviation-prevention-plugin/

# 创建插件压缩包
tar -czf traeide-deviation-prevention-v1.0.0.tgz traeide-deviation-prevention-plugin/

# 或者创建ZIP包（Windows用户）
# zip -r traeide-deviation-prevention-v1.0.0.zip traeide-deviation-prevention-plugin/
```

## 4. TraeIDE安装步骤

### 4.1 通过TraeIDE插件市场安装（推荐）

1. **打开TraeIDE编辑器**
2. **访问插件市场**：
   - 点击左侧活动栏的"扩展"图标
   - 或使用快捷键 `Ctrl+Shift+X` (Windows/Linux) 或 `Cmd+Shift+X` (macOS)
3. **搜索插件**：
   - 在搜索框中输入"项目偏离预防"或"deviation prevention"
   - 找到"TraeIDE项目偏离预防MCP插件"
4. **安装插件**：
   - 点击"安装"按钮
   - 等待安装完成
5. **重启TraeIDE**：
   - 安装完成后重启TraeIDE以激活插件

### 4.2 手动安装插件包

1. **下载插件包**：
   - 下载 `traeide-deviation-prevention-v1.0.0.tgz` 文件

2. **安装插件**：
   ```bash
   # 方法1：使用TraeIDE命令行
   traeide --install-extension traeide-deviation-prevention-v1.0.0.tgz
   
   # 方法2：通过TraeIDE界面
   # 打开TraeIDE -> 扩展 -> 更多操作(···) -> 从VSIX安装
   ```

3. **验证安装**：
   - 重启TraeIDE
   - 检查左侧活动栏是否出现"偏离预防"图标
   - 查看扩展列表确认插件已启用

### 4.3 开发模式安装（开发者）

1. **克隆项目**：
   ```bash
   git clone https://github.com/traeide/deviation-prevention-mcp.git
   cd deviation-prevention-mcp
   ```

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **构建项目**：
   ```bash
   npm run build
   ```

4. **链接到TraeIDE**：
   ```bash
   # 创建符号链接到TraeIDE扩展目录
   ln -s $(pwd) ~/.traeide/extensions/deviation-prevention-mcp
   
   # Windows用户使用
   # mklink /D "%USERPROFILE%\.traeide\extensions\deviation-prevention-mcp" "%CD%"
   ```

5. **启动开发模式**：
   - 打开TraeIDE
   - 按 `F5` 启动扩展开发主机
   - 在新窗口中测试插件功能

## 5. 插件配置与激活

### 5.1 首次配置

1. **打开设置**：
   - `文件` -> `首选项` -> `设置`
   - 或使用快捷键 `Ctrl+,` (Windows/Linux) 或 `Cmd+,` (macOS)

2. **搜索偏离预防设置**：
   - 在设置搜索框中输入"偏离预防"或"deviation"

3. **配置基本参数**：
   ```json
   {
     "traeide.autoStart": true,
     "traeide.autoAnalyze": true,
     "traeide.notificationLevel": "warning",
     "traeide.deviationThreshold": 60,
     "traeide.deepseek.apiKey": "your-api-key-here",
     "traeide.deepseek.model": "deepseek-chat"
   }
   ```

### 5.2 API密钥配置

1. **获取DeepSeek API密钥**：
   - 访问 [DeepSeek开放平台](https://platform.deepseek.com/)
   - 注册账户并获取API密钥

2. **配置API密钥**：
   - 在TraeIDE设置中找到 `traeide.deepseek.apiKey`
   - 输入您的API密钥
   - 保存设置

### 5.3 工作区配置

在项目根目录创建 `.traeide/deviation-prevention.json` 配置文件：

```json
{
  "projectName": "我的项目",
  "coreRequirements": [
    "实现用户认证系统",
    "提供数据可视化功能",
    "确保系统安全性"
  ],
  "deviationThreshold": 60,
  "autoSnapshot": {
    "enabled": true,
    "interval": 30,
    "maxSnapshots": 50
  },
  "contextCompression": {
    "enabled": true,
    "summaryLength": 300,
    "layerDepth": 3
  },
  "notifications": {
    "deviationWarning": true,
    "snapshotCreated": false,
    "requirementConflict": true
  }
}
```

## 6. 功能验证与测试

### 6.1 基础功能验证

1. **检查MCP服务器状态**：
   - 打开TraeIDE终端
   - 运行：`curl http://localhost:3001/api/status`
   - 应返回服务器状态信息

2. **验证界面集成**：
   - 检查左侧活动栏是否显示"偏离预防"图标
   - 点击图标查看侧边栏面板
   - 验证各功能页面是否正常加载

3. **测试快捷键**：
   - `Ctrl+Shift+D`：分析项目偏离
   - `Ctrl+Shift+F`：快速修正偏离

### 6.2 核心功能测试

1. **项目仪表板测试**：
   - 打开项目仪表板页面
   - 检查项目概览信息显示
   - 验证偏离预警功能

2. **上下文管理测试**：
   - 创建代码快照
   - 测试快照恢复功能
   - 验证上下文压缩效果

3. **需求管理测试**：
   - 添加核心需求
   - 测试新需求评估
   - 验证需求冲突检测

4. **历史文档测试**：
   - 搜索历史文档
   - 测试智能检索功能
   - 验证文档关联展示

5. **会话回溯测试**：
   - 查看历史会话
   - 测试会话复用功能
   - 验证智能回溯效果

### 6.3 性能测试

1. **响应时间测试**：
   ```bash
   # 测试API响应时间
   time curl http://localhost:3001/api/status
   time curl http://localhost:3001/api/project/context
   ```

2. **内存使用测试**：
   - 使用任务管理器监控Node.js进程内存使用
   - 确保内存使用不超过200MB

3. **并发测试**：
   ```bash
   # 使用ab工具进行并发测试
   ab -n 100 -c 10 http://localhost:3001/api/status
   ```

## 7. 故障排除

### 7.1 常见问题

#### 问题1：插件无法启动
**症状**：TraeIDE中看不到偏离预防图标
**解决方案**：
1. 检查插件是否正确安装：`traeide --list-extensions`
2. 查看TraeIDE开发者控制台错误信息
3. 重启TraeIDE
4. 重新安装插件

#### 问题2：MCP服务器连接失败
**症状**：显示"MCP服务器连接失败"错误
**解决方案**：
1. 检查Node.js是否安装：`node --version`
2. 检查端口3001是否被占用：`netstat -an | grep 3001`
3. 手动启动MCP服务器：`node mcp-server.js`
4. 检查防火墙设置

#### 问题3：API密钥配置错误
**症状**：Claude-4集成功能无法使用
**解决方案**：
1. 验证API密钥格式是否正确
2. 检查API密钥是否有效
3. 确认网络连接正常
4. 查看控制台错误日志

### 7.2 日志查看

1. **TraeIDE日志**：
   - Windows：`%APPDATA%\TraeIDE\logs\`
   - macOS：`~/Library/Application Support/TraeIDE/logs/`
   - Linux：`~/.config/TraeIDE/logs/`

2. **MCP服务器日志**：
   ```bash
   # 查看实时日志
   tail -f .mcp-server.log
   
   # 查看错误日志
   grep ERROR .mcp-server.log
   ```

3. **开发者控制台**：
   - 在TraeIDE中按 `F12` 打开开发者工具
   - 查看Console标签页的错误信息

### 7.3 重置配置

如果遇到配置问题，可以重置插件配置：

```bash
# 删除配置文件
rm -rf ~/.traeide/extensions/deviation-prevention-mcp/
rm -f .traeide/deviation-prevention.json

# 重新安装插件
traeide --install-extension traeide-deviation-prevention-v1.0.0.tgz
```

## 8. 更新与维护

### 8.1 插件更新

1. **自动更新**：
   - TraeIDE会自动检查插件更新
   - 在扩展页面点击"更新"按钮

2. **手动更新**：
   ```bash
   # 下载新版本插件包
   wget https://releases.github.com/traeide/deviation-prevention-mcp/v1.1.0.tgz
   
   # 卸载旧版本
   traeide --uninstall-extension traeide-deviation-prevention
   
   # 安装新版本
   traeide --install-extension traeide-deviation-prevention-v1.1.0.tgz
   ```

### 8.2 数据备份

定期备份插件数据：

```bash
# 备份配置文件
cp -r .traeide/ backup/traeide-config-$(date +%Y%m%d)/

# 备份数据库文件
cp .mcp-data.db backup/mcp-data-$(date +%Y%m%d).db
```

### 8.3 性能优化

1. **清理历史数据**：
   - 定期清理过期的快照和会话记录
   - 在系统配置页面设置数据保留策略

2. **调整配置参数**：
   - 根据项目规模调整快照频率
   - 优化上下文压缩参数
   - 调整偏离检测敏感度

## 9. 技术支持

### 9.1 获取帮助

- **官方文档**：https://docs.traeide.com/deviation-prevention
- **GitHub仓库**：https://github.com/traeide/deviation-prevention-mcp
- **问题反馈**：https://github.com/traeide/deviation-prevention-mcp/issues
- **社区论坛**：https://community.traeide.com

### 9.2 联系方式

- **技术支持邮箱**：support@traeide.com
- **开发团队**：dev@traeide.com
- **商务合作**：business@traeide.com

---

**部署完成后，您将拥有一个完整的TraeIDE项目偏离预防MCP插件，为您的开发工作提供智能化的偏离预防和项目管理支持！**