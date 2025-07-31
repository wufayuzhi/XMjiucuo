#!/bin/bash

# TraeIDE项目偏离预防MCP插件打包脚本 (Unix/Linux/macOS)
# 自动化构建和打包插件

set -e  # 遇到错误立即退出

echo "========================================"
echo "🚀 TraeIDE插件打包工具"
echo "========================================"
echo

# 设置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_ROOT/build"
PLUGIN_DIR="$BUILD_DIR/traeide-deviation-prevention-plugin"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 获取版本号
VERSION=$(grep '"version"' "$PROJECT_ROOT/package.json" | sed 's/.*"version":[[:space:]]*"\([^"]*\)".*/\1/')

echo "📦 项目版本: $VERSION"
echo "📁 项目根目录: $PROJECT_ROOT"
echo "🏗️ 构建目录: $BUILD_DIR"
echo

# 步骤1: 清理构建目录
echo "🧹 步骤1: 清理构建目录..."
if [ -d "$BUILD_DIR" ]; then
    rm -rf "$BUILD_DIR"
fi
mkdir -p "$BUILD_DIR"
mkdir -p "$PLUGIN_DIR"
echo "✅ 构建目录清理完成"
echo

# 步骤2: 检查Node.js环境
echo "🔍 步骤2: 检查Node.js环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: Node.js未安装或不在PATH中"
    exit 1
fi
echo "✅ Node.js环境检查通过 ($(node --version))"
echo

# 步骤3: 安装依赖
echo "📦 步骤3: 安装项目依赖..."
cd "$PROJECT_ROOT"
npm install
if [ $? -ne 0 ]; then
    echo "❌ 错误: 依赖安装失败"
    exit 1
fi
echo "✅ 依赖安装完成"
echo

# 步骤4: 构建前端
echo "🏗️ 步骤4: 构建前端资源..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 错误: 前端构建失败"
    exit 1
fi
echo "✅ 前端构建完成"
echo

# 步骤5: 验证构建结果
echo "✅ 步骤5: 验证构建结果..."
if [ ! -f "$PROJECT_ROOT/dist/index.html" ]; then
    echo "❌ 错误: 缺少dist/index.html文件"
    exit 1
fi
if [ ! -d "$PROJECT_ROOT/dist/assets" ]; then
    echo "❌ 错误: 缺少dist/assets目录"
    exit 1
fi
echo "✅ 构建结果验证通过"
echo

# 步骤6: 复制插件文件
echo "📁 步骤6: 复制插件文件..."

# 复制dist目录
cp -r "$PROJECT_ROOT/dist" "$PLUGIN_DIR/dist"
echo "✅ 已复制: dist/"

# 复制配置文件
cp "$PROJECT_ROOT/package.json" "$PLUGIN_DIR/package.json"
echo "✅ 已复制: package.json"

cp "$PROJECT_ROOT/traeide-config.json" "$PLUGIN_DIR/traeide-config.json"
echo "✅ 已复制: traeide-config.json"

# 复制服务器文件
cp "$PROJECT_ROOT/mcp-server.js" "$PLUGIN_DIR/mcp-server.js"
echo "✅ 已复制: mcp-server.js"

# 复制文档
if [ -f "$PROJECT_ROOT/README.md" ]; then
    cp "$PROJECT_ROOT/README.md" "$PLUGIN_DIR/README.md"
    echo "✅ 已复制: README.md"
fi

if [ -f "$PROJECT_ROOT/LICENSE" ]; then
    cp "$PROJECT_ROOT/LICENSE" "$PLUGIN_DIR/LICENSE"
    echo "✅ 已复制: LICENSE"
fi

# 复制资源文件
if [ -d "$PROJECT_ROOT/assets" ]; then
    cp -r "$PROJECT_ROOT/assets" "$PLUGIN_DIR/assets"
    echo "✅ 已复制: assets/"
fi

echo "✅ 插件文件复制完成"
echo

# 步骤7: 创建启动脚本
echo "📝 步骤7: 创建启动脚本..."

# 创建Windows启动脚本
cat > "$PLUGIN_DIR/start-mcp.bat" << 'EOF'
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
    npm install --production
)

REM 启动MCP服务器
set TRAEIDE_PROJECT_PATH=%CD%
set MCP_WEB_PORT=3001
set NODE_ENV=production

node mcp-server.js
EOF

# 创建Windows停止脚本
cat > "$PLUGIN_DIR/stop-mcp.bat" << 'EOF'
@echo off
echo Stopping TraeIDE Deviation Prevention MCP Server...

REM 查找并终止Node.js进程
taskkill /f /im node.exe 2>nul
echo MCP Server stopped.
EOF

# 创建Unix启动脚本
cat > "$PLUGIN_DIR/start-mcp.sh" << 'EOF'
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
    npm install --production
fi

# 启动MCP服务器
export TRAEIDE_PROJECT_PATH=$(pwd)
export MCP_WEB_PORT=3001
export NODE_ENV=production

node mcp-server.js
EOF

# 创建Unix停止脚本
cat > "$PLUGIN_DIR/stop-mcp.sh" << 'EOF'
#!/bin/bash
echo "Stopping TraeIDE Deviation Prevention MCP Server..."

# 查找并终止MCP服务器进程
pkill -f "mcp-server.js"
echo "MCP Server stopped."
EOF

# 设置脚本执行权限
chmod +x "$PLUGIN_DIR/start-mcp.sh"
chmod +x "$PLUGIN_DIR/stop-mcp.sh"

echo "✅ 启动脚本创建完成"
echo

# 步骤8: 优化package.json
echo "⚙️ 步骤8: 优化package.json..."

# 使用jq优化package.json（如果可用）
if command -v jq &> /dev/null; then
    # 移除devDependencies并添加插件特定配置
    jq 'del(.devDependencies) | .main = "mcp-server.js" | .engines = {"node": ">=16.0.0", "traeide": ">=1.0.0"} | .traeide = {"displayName": "项目偏离预防助手", "description": "基于Claude-4-Sonnet的智能项目偏离预防系统", "category": "AI助手", "icon": "assets/icon.svg"}' "$PLUGIN_DIR/package.json" > "$PLUGIN_DIR/package.json.tmp" && mv "$PLUGIN_DIR/package.json.tmp" "$PLUGIN_DIR/package.json"
else
    echo "⚠️ jq未安装，跳过package.json优化"
fi

echo "✅ package.json优化完成"
echo

# 步骤9: 创建压缩包
echo "📦 步骤9: 创建插件压缩包..."

ARCHIVE_NAME="traeide-deviation-prevention-v$VERSION"
TAR_PATH="$BUILD_DIR/$ARCHIVE_NAME.tgz"
ZIP_PATH="$BUILD_DIR/$ARCHIVE_NAME.zip"

# 创建tar.gz压缩包
cd "$BUILD_DIR"
tar -czf "$ARCHIVE_NAME.tgz" traeide-deviation-prevention-plugin/
if [ $? -ne 0 ]; then
    echo "❌ 错误: tar.gz压缩包创建失败"
    exit 1
fi
echo "✅ tar.gz压缩包创建完成: $ARCHIVE_NAME.tgz"

# 创建ZIP压缩包（如果zip命令可用）
if command -v zip &> /dev/null; then
    zip -r "$ARCHIVE_NAME.zip" traeide-deviation-prevention-plugin/
    if [ $? -eq 0 ]; then
        echo "✅ ZIP压缩包创建完成: $ARCHIVE_NAME.zip"
    else
        echo "⚠️ ZIP压缩包创建失败，但tar.gz包可用"
    fi
else
    echo "⚠️ zip命令不可用，跳过ZIP包创建"
fi

echo

# 步骤10: 验证插件包
echo "🔍 步骤10: 验证插件包..."

# 检查必要文件
REQUIRED_FILES=(
    "package.json"
    "traeide-config.json"
    "mcp-server.js"
    "start-mcp.sh"
    "start-mcp.bat"
    "dist/index.html"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$PLUGIN_DIR/$file" ] && [ ! -d "$PLUGIN_DIR/$file" ]; then
        echo "❌ 错误: 缺少必要文件: $file"
        exit 1
    fi
done

# 验证JSON文件格式
if command -v jq &> /dev/null; then
    if ! jq empty "$PLUGIN_DIR/package.json" 2>/dev/null; then
        echo "❌ 错误: package.json格式不正确"
        exit 1
    fi
    
    if ! jq empty "$PLUGIN_DIR/traeide-config.json" 2>/dev/null; then
        echo "❌ 错误: traeide-config.json格式不正确"
        exit 1
    fi
fi

echo "✅ 插件包验证通过"
echo

# 步骤11: 生成安装说明
echo "📋 步骤11: 生成安装说明..."

cat > "$BUILD_DIR/INSTALL.md" << EOF
# TraeIDE项目偏离预防MCP插件 v$VERSION

## 快速安装

### 方法1: 通过TraeIDE插件市场
1. 打开TraeIDE
2. 点击扩展图标 (Ctrl+Shift+X)
3. 搜索"项目偏离预防"
4. 点击安装

### 方法2: 手动安装
\`\`\`bash
# 安装tar.gz包
traeide --install-extension $ARCHIVE_NAME.tgz

# 或者安装zip包（如果可用）
traeide --install-extension $ARCHIVE_NAME.zip
\`\`\`

### 方法3: 开发模式
\`\`\`bash
# 解压插件包
tar -xzf $ARCHIVE_NAME.tgz
cd traeide-deviation-prevention-plugin

# 安装依赖
npm install

# 启动MCP服务器
./start-mcp.sh
\`\`\`

## 配置要求

- Node.js >= 16.0.0
- TraeIDE >= 1.0.0
- 内存 >= 4GB
- 磁盘空间 >= 500MB

## 首次配置

1. 打开TraeIDE设置
2. 搜索"偏离预防"
3. 配置API密钥和基本参数
4. 重启TraeIDE

## 技术支持

- 文档: https://docs.traeide.com/deviation-prevention
- 问题反馈: https://github.com/traeide/deviation-prevention-mcp/issues
- 邮箱: support@traeide.com

---
构建时间: $(date -Iseconds)
构建版本: v$VERSION
构建平台: $(uname -s) $(uname -m)
EOF

echo "✅ 安装说明生成完成"
echo

# 步骤12: 生成校验和
echo "🔐 步骤12: 生成文件校验和..."

cd "$BUILD_DIR"

# 生成SHA256校验和
if command -v sha256sum &> /dev/null; then
    sha256sum "$ARCHIVE_NAME.tgz" > "$ARCHIVE_NAME.tgz.sha256"
    echo "✅ SHA256校验和生成完成"
elif command -v shasum &> /dev/null; then
    shasum -a 256 "$ARCHIVE_NAME.tgz" > "$ARCHIVE_NAME.tgz.sha256"
    echo "✅ SHA256校验和生成完成"
else
    echo "⚠️ 无法生成SHA256校验和（缺少sha256sum或shasum命令）"
fi

echo

# 显示构建摘要
echo "========================================"
echo "🎉 插件构建完成！"
echo "========================================"
echo "📦 插件名称: TraeIDE项目偏离预防MCP插件"
echo "🏷️ 版本号: v$VERSION"
echo "📁 构建目录: $BUILD_DIR"
echo "📦 插件包:"
echo "   - $ARCHIVE_NAME.tgz"
if [ -f "$ZIP_PATH" ]; then
    echo "   - $ARCHIVE_NAME.zip"
fi
echo "📋 文档: INSTALL.md"
if [ -f "$BUILD_DIR/$ARCHIVE_NAME.tgz.sha256" ]; then
    echo "🔐 校验和: $ARCHIVE_NAME.tgz.sha256"
fi
echo "========================================"
echo
echo "📋 下一步操作:"
echo "1. 测试插件包安装"
echo "2. 上传到TraeIDE插件市场"
echo "3. 更新文档和发布说明"
echo
echo "🚀 开始使用插件!"
echo

# 显示文件大小
echo "📊 文件大小信息:"
ls -lh "$BUILD_DIR"/*.tgz "$BUILD_DIR"/*.zip 2>/dev/null | awk '{print "   " $9 ": " $5}'
echo

# 询问是否打开构建目录
read -p "是否打开构建目录? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open "$BUILD_DIR"
    elif command -v open &> /dev/null; then
        open "$BUILD_DIR"
    else
        echo "构建目录: $BUILD_DIR"
    fi
fi

echo "构建完成！"