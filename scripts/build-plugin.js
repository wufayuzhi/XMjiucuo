#!/usr/bin/env node

/**
 * TraeIDE项目偏离预防MCP插件打包脚本
 * 自动化构建、打包和验证插件
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

class PluginBuilder {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.buildDir = path.join(this.projectRoot, 'build');
        this.pluginDir = path.join(this.buildDir, 'traeide-deviation-prevention-plugin');
        this.version = this.getVersion();
    }

    /**
     * 获取项目版本号
     */
    getVersion() {
        const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
        return packageJson.version;
    }

    /**
     * 清理构建目录
     */
    cleanBuildDir() {
        console.log('🧹 清理构建目录...');
        if (fs.existsSync(this.buildDir)) {
            fs.rmSync(this.buildDir, { recursive: true, force: true });
        }
        fs.mkdirSync(this.buildDir, { recursive: true });
        fs.mkdirSync(this.pluginDir, { recursive: true });
    }

    /**
     * 安装依赖
     */
    installDependencies() {
        console.log('📦 安装项目依赖...');
        try {
            execSync('npm install', { 
                cwd: this.projectRoot, 
                stdio: 'inherit' 
            });
        } catch (error) {
            console.error('❌ 依赖安装失败:', error.message);
            process.exit(1);
        }
    }

    /**
     * 构建前端资源
     */
    buildFrontend() {
        console.log('🏗️ 构建前端资源...');
        try {
            execSync('npm run build', { 
                cwd: this.projectRoot, 
                stdio: 'inherit' 
            });
        } catch (error) {
            console.error('❌ 前端构建失败:', error.message);
            process.exit(1);
        }
    }

    /**
     * 验证构建结果
     */
    validateBuild() {
        console.log('✅ 验证构建结果...');
        const distDir = path.join(this.projectRoot, 'dist');
        if (!fs.existsSync(distDir)) {
            console.error('❌ dist目录不存在');
            process.exit(1);
        }

        const requiredFiles = ['index.html', 'assets'];
        for (const file of requiredFiles) {
            const filePath = path.join(distDir, file);
            if (!fs.existsSync(filePath)) {
                console.error(`❌ 缺少必要文件: ${file}`);
                process.exit(1);
            }
        }
        console.log('✅ 构建结果验证通过');
    }

    /**
     * 复制插件文件
     */
    copyPluginFiles() {
        console.log('📁 复制插件文件...');
        
        const filesToCopy = [
            { src: 'dist', dest: 'dist', type: 'dir' },
            { src: 'package.json', dest: 'package.json', type: 'file' },
            { src: 'traeide-config.json', dest: 'traeide-config.json', type: 'file' },
            { src: 'mcp-server.js', dest: 'mcp-server.js', type: 'file' },
            { src: 'README.md', dest: 'README.md', type: 'file' },
            { src: 'LICENSE', dest: 'LICENSE', type: 'file' },
            { src: 'assets', dest: 'assets', type: 'dir' }
        ];

        for (const item of filesToCopy) {
            const srcPath = path.join(this.projectRoot, item.src);
            const destPath = path.join(this.pluginDir, item.dest);

            if (fs.existsSync(srcPath)) {
                if (item.type === 'dir') {
                    this.copyDirectory(srcPath, destPath);
                } else {
                    fs.copyFileSync(srcPath, destPath);
                }
                console.log(`✅ 已复制: ${item.src}`);
            } else {
                console.warn(`⚠️ 文件不存在，跳过: ${item.src}`);
            }
        }
    }

    /**
     * 递归复制目录
     */
    copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    /**
     * 创建启动脚本
     */
    createStartupScripts() {
        console.log('📝 创建启动脚本...');

        // Windows启动脚本
        const windowsScript = `@echo off
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
`;

        // Unix启动脚本
        const unixScript = `#!/bin/bash
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
`;

        // Windows停止脚本
        const windowsStopScript = `@echo off
echo Stopping TraeIDE Deviation Prevention MCP Server...

REM 查找并终止Node.js进程
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq node.exe" /fo table /nh ^| findstr mcp-server') do (
    taskkill /pid %%i /f
)

echo MCP Server stopped.
`;

        // Unix停止脚本
        const unixStopScript = `#!/bin/bash
echo "Stopping TraeIDE Deviation Prevention MCP Server..."

# 查找并终止MCP服务器进程
pkill -f "mcp-server.js"

echo "MCP Server stopped."
`;

        // 写入脚本文件
        fs.writeFileSync(path.join(this.pluginDir, 'start-mcp.bat'), windowsScript);
        fs.writeFileSync(path.join(this.pluginDir, 'start-mcp.sh'), unixScript);
        fs.writeFileSync(path.join(this.pluginDir, 'stop-mcp.bat'), windowsStopScript);
        fs.writeFileSync(path.join(this.pluginDir, 'stop-mcp.sh'), unixStopScript);

        // 设置Unix脚本执行权限
        try {
            execSync('chmod +x start-mcp.sh stop-mcp.sh', { cwd: this.pluginDir });
        } catch (error) {
            console.warn('⚠️ 无法设置脚本执行权限（可能在Windows系统上）');
        }

        console.log('✅ 启动脚本创建完成');
    }

    /**
     * 优化package.json
     */
    optimizePackageJson() {
        console.log('⚙️ 优化package.json...');
        
        const packageJsonPath = path.join(this.pluginDir, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // 移除开发依赖
        delete packageJson.devDependencies;

        // 添加插件特定配置
        packageJson.main = 'mcp-server.js';
        packageJson.engines = {
            node: '>=16.0.0',
            traeide: '>=1.0.0'
        };

        // 添加插件元数据
        packageJson.traeide = {
            displayName: '项目偏离预防助手',
            description: '基于Claude-4-Sonnet的智能项目偏离预防系统',
            category: 'AI助手',
            icon: 'assets/icon.svg'
        };

        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('✅ package.json优化完成');
    }

    /**
     * 创建插件压缩包
     */
    async createArchive() {
        console.log('📦 创建插件压缩包...');
        
        const archiveName = `traeide-deviation-prevention-v${this.version}`;
        const tarPath = path.join(this.buildDir, `${archiveName}.tgz`);
        const zipPath = path.join(this.buildDir, `${archiveName}.zip`);

        // 创建tar.gz压缩包
        await this.createTarArchive(tarPath);
        
        // 创建zip压缩包
        await this.createZipArchive(zipPath);

        console.log(`✅ 插件包创建完成:`);
        console.log(`   📦 ${tarPath}`);
        console.log(`   📦 ${zipPath}`);
    }

    /**
     * 创建tar.gz压缩包
     */
    createTarArchive(outputPath) {
        return new Promise((resolve, reject) => {
            try {
                execSync(`tar -czf "${outputPath}" -C "${this.buildDir}" traeide-deviation-prevention-plugin`, {
                    stdio: 'inherit'
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 创建zip压缩包
     */
    createZipArchive(outputPath) {
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(outputPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => {
                resolve();
            });

            archive.on('error', (err) => {
                reject(err);
            });

            archive.pipe(output);
            archive.directory(this.pluginDir, 'traeide-deviation-prevention-plugin');
            archive.finalize();
        });
    }

    /**
     * 验证插件包
     */
    validatePlugin() {
        console.log('🔍 验证插件包...');
        
        const requiredFiles = [
            'package.json',
            'traeide-config.json',
            'mcp-server.js',
            'start-mcp.bat',
            'start-mcp.sh',
            'dist/index.html'
        ];

        for (const file of requiredFiles) {
            const filePath = path.join(this.pluginDir, file);
            if (!fs.existsSync(filePath)) {
                console.error(`❌ 缺少必要文件: ${file}`);
                process.exit(1);
            }
        }

        // 验证package.json格式
        try {
            const packageJson = JSON.parse(fs.readFileSync(path.join(this.pluginDir, 'package.json'), 'utf8'));
            if (!packageJson.name || !packageJson.version || !packageJson.main) {
                console.error('❌ package.json格式不正确');
                process.exit(1);
            }
        } catch (error) {
            console.error('❌ package.json解析失败:', error.message);
            process.exit(1);
        }

        // 验证traeide-config.json格式
        try {
            const config = JSON.parse(fs.readFileSync(path.join(this.pluginDir, 'traeide-config.json'), 'utf8'));
            if (!config.name || !config.version || !config.type) {
                console.error('❌ traeide-config.json格式不正确');
                process.exit(1);
            }
        } catch (error) {
            console.error('❌ traeide-config.json解析失败:', error.message);
            process.exit(1);
        }

        console.log('✅ 插件包验证通过');
    }

    /**
     * 生成安装说明
     */
    generateInstallInstructions() {
        console.log('📋 生成安装说明...');
        
        const instructions = `# TraeIDE项目偏离预防MCP插件 v${this.version}

## 快速安装

### 方法1：通过TraeIDE插件市场
1. 打开TraeIDE
2. 点击扩展图标 (Ctrl+Shift+X)
3. 搜索"项目偏离预防"
4. 点击安装

### 方法2：手动安装
\`\`\`bash
# 安装插件包
traeide --install-extension traeide-deviation-prevention-v${this.version}.tgz

# 或者使用zip包
traeide --install-extension traeide-deviation-prevention-v${this.version}.zip
\`\`\`

### 方法3：开发模式
\`\`\`bash
# 解压插件包
tar -xzf traeide-deviation-prevention-v${this.version}.tgz
cd traeide-deviation-prevention-plugin

# 安装依赖
npm install

# 启动MCP服务器
npm start
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

- 文档：https://docs.traeide.com/deviation-prevention
- 问题反馈：https://github.com/traeide/deviation-prevention-mcp/issues
- 邮箱：support@traeide.com

---
构建时间：${new Date().toISOString()}
构建版本：v${this.version}
`;

        fs.writeFileSync(path.join(this.buildDir, 'INSTALL.md'), instructions);
        console.log('✅ 安装说明生成完成');
    }

    /**
     * 显示构建摘要
     */
    showBuildSummary() {
        console.log('\n🎉 插件构建完成！');
        console.log('==========================================');
        console.log(`📦 插件名称: TraeIDE项目偏离预防MCP插件`);
        console.log(`🏷️ 版本号: v${this.version}`);
        console.log(`📁 构建目录: ${this.buildDir}`);
        console.log(`📦 插件包:`);
        console.log(`   - traeide-deviation-prevention-v${this.version}.tgz`);
        console.log(`   - traeide-deviation-prevention-v${this.version}.zip`);
        console.log('==========================================');
        console.log('\n📋 下一步操作:');
        console.log('1. 测试插件包安装');
        console.log('2. 上传到TraeIDE插件市场');
        console.log('3. 更新文档和发布说明');
        console.log('\n🚀 开始使用插件!');
    }

    /**
     * 执行完整构建流程
     */
    async build() {
        try {
            console.log('🚀 开始构建TraeIDE插件...');
            console.log('==========================================\n');

            this.cleanBuildDir();
            this.installDependencies();
            this.buildFrontend();
            this.validateBuild();
            this.copyPluginFiles();
            this.createStartupScripts();
            this.optimizePackageJson();
            this.validatePlugin();
            await this.createArchive();
            this.generateInstallInstructions();
            this.showBuildSummary();

        } catch (error) {
            console.error('\n❌ 构建失败:', error.message);
            console.error(error.stack);
            process.exit(1);
        }
    }
}

// 主程序入口
if (require.main === module) {
    const builder = new PluginBuilder();
    builder.build();
}

module.exports = PluginBuilder;