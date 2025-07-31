#!/usr/bin/env node

/**
 * TraeIDE项目偏离预防MCP插件验证脚本
 * 验证插件包的完整性、配置正确性和功能可用性
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

class PluginValidator {
    constructor(pluginPath) {
        this.pluginPath = path.resolve(pluginPath);
        this.errors = [];
        this.warnings = [];
        this.info = [];
    }

    /**
     * 添加错误信息
     */
    addError(message) {
        this.errors.push(message);
        console.error(`❌ 错误: ${message}`);
    }

    /**
     * 添加警告信息
     */
    addWarning(message) {
        this.warnings.push(message);
        console.warn(`⚠️ 警告: ${message}`);
    }

    /**
     * 添加信息
     */
    addInfo(message) {
        this.info.push(message);
        console.log(`ℹ️ 信息: ${message}`);
    }

    /**
     * 验证插件目录结构
     */
    validateStructure() {
        console.log('🔍 验证插件目录结构...');

        if (!fs.existsSync(this.pluginPath)) {
            this.addError(`插件目录不存在: ${this.pluginPath}`);
            return false;
        }

        const requiredFiles = [
            'package.json',
            'traeide-config.json',
            'mcp-server.js',
            'start-mcp.bat',
            'start-mcp.sh',
            'dist/index.html'
        ];

        const optionalFiles = [
            'README.md',
            'LICENSE',
            'stop-mcp.bat',
            'stop-mcp.sh',
            'assets/icon.svg'
        ];

        // 检查必需文件
        for (const file of requiredFiles) {
            const filePath = path.join(this.pluginPath, file);
            if (!fs.existsSync(filePath)) {
                this.addError(`缺少必需文件: ${file}`);
            } else {
                this.addInfo(`找到必需文件: ${file}`);
            }
        }

        // 检查可选文件
        for (const file of optionalFiles) {
            const filePath = path.join(this.pluginPath, file);
            if (!fs.existsSync(filePath)) {
                this.addWarning(`缺少可选文件: ${file}`);
            } else {
                this.addInfo(`找到可选文件: ${file}`);
            }
        }

        return this.errors.length === 0;
    }

    /**
     * 验证package.json
     */
    validatePackageJson() {
        console.log('📦 验证package.json...');

        const packageJsonPath = path.join(this.pluginPath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            this.addError('package.json文件不存在');
            return false;
        }

        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

            // 检查必需字段
            const requiredFields = ['name', 'version', 'description', 'main'];
            for (const field of requiredFields) {
                if (!packageJson[field]) {
                    this.addError(`package.json缺少必需字段: ${field}`);
                } else {
                    this.addInfo(`package.json包含字段: ${field} = ${packageJson[field]}`);
                }
            }

            // 检查版本格式
            if (packageJson.version && !/^\d+\.\d+\.\d+/.test(packageJson.version)) {
                this.addWarning(`版本号格式可能不正确: ${packageJson.version}`);
            }

            // 检查主入口文件
            if (packageJson.main) {
                const mainPath = path.join(this.pluginPath, packageJson.main);
                if (!fs.existsSync(mainPath)) {
                    this.addError(`主入口文件不存在: ${packageJson.main}`);
                }
            }

            // 检查依赖
            if (packageJson.dependencies) {
                const requiredDeps = ['@modelcontextprotocol/sdk', 'express', 'ws'];
                for (const dep of requiredDeps) {
                    if (!packageJson.dependencies[dep]) {
                        this.addWarning(`缺少推荐依赖: ${dep}`);
                    }
                }
            }

            // 检查引擎要求
            if (!packageJson.engines) {
                this.addWarning('未指定引擎要求');
            } else {
                if (!packageJson.engines.node) {
                    this.addWarning('未指定Node.js版本要求');
                }
                if (!packageJson.engines.traeide) {
                    this.addWarning('未指定TraeIDE版本要求');
                }
            }

            return true;
        } catch (error) {
            this.addError(`package.json解析失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 验证traeide-config.json
     */
    validateTraeideConfig() {
        console.log('⚙️ 验证traeide-config.json...');

        const configPath = path.join(this.pluginPath, 'traeide-config.json');
        if (!fs.existsSync(configPath)) {
            this.addError('traeide-config.json文件不存在');
            return false;
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

            // 检查必需字段
            const requiredFields = ['name', 'version', 'description', 'type'];
            for (const field of requiredFields) {
                if (!config[field]) {
                    this.addError(`traeide-config.json缺少必需字段: ${field}`);
                } else {
                    this.addInfo(`traeide-config.json包含字段: ${field}`);
                }
            }

            // 检查插件类型
            if (config.type && config.type !== 'mcp-plugin') {
                this.addWarning(`插件类型可能不正确: ${config.type}，期望: mcp-plugin`);
            }

            // 检查MCP服务器配置
            if (!config.mcpServer) {
                this.addWarning('未配置MCP服务器');
            } else {
                if (!config.mcpServer.command) {
                    this.addError('MCP服务器缺少启动命令');
                }
            }

            // 检查Web应用配置
            if (config.webApp) {
                if (!config.webApp.port) {
                    this.addWarning('Web应用未指定端口');
                }
                if (!config.webApp.healthCheckUrl) {
                    this.addWarning('Web应用未配置健康检查URL');
                }
            }

            // 检查UI配置
            if (!config.ui) {
                this.addWarning('未配置UI集成');
            } else {
                if (!config.ui.sidebar) {
                    this.addWarning('未配置侧边栏');
                }
                if (!config.ui.panels || config.ui.panels.length === 0) {
                    this.addWarning('未配置面板');
                }
            }

            return true;
        } catch (error) {
            this.addError(`traeide-config.json解析失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 验证MCP服务器文件
     */
    validateMcpServer() {
        console.log('🖥️ 验证MCP服务器文件...');

        const serverPath = path.join(this.pluginPath, 'mcp-server.js');
        if (!fs.existsSync(serverPath)) {
            this.addError('mcp-server.js文件不存在');
            return false;
        }

        try {
            const serverContent = fs.readFileSync(serverPath, 'utf8');

            // 检查关键导入
            const requiredImports = [
                '@modelcontextprotocol/sdk',
                'express',
                'ws'
            ];

            for (const imp of requiredImports) {
                if (!serverContent.includes(imp)) {
                    this.addWarning(`MCP服务器可能缺少导入: ${imp}`);
                }
            }

            // 检查关键功能
            const requiredFeatures = [
                'createServer',
                'WebSocket',
                'express',
                'listen'
            ];

            for (const feature of requiredFeatures) {
                if (!serverContent.includes(feature)) {
                    this.addWarning(`MCP服务器可能缺少功能: ${feature}`);
                }
            }

            // 检查语法
            try {
                // 简单的语法检查（不执行代码）
                new Function(serverContent);
                this.addInfo('MCP服务器语法检查通过');
            } catch (syntaxError) {
                this.addError(`MCP服务器语法错误: ${syntaxError.message}`);
            }

            return true;
        } catch (error) {
            this.addError(`读取MCP服务器文件失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 验证前端资源
     */
    validateFrontendAssets() {
        console.log('🎨 验证前端资源...');

        const distPath = path.join(this.pluginPath, 'dist');
        if (!fs.existsSync(distPath)) {
            this.addError('dist目录不存在');
            return false;
        }

        // 检查index.html
        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) {
            this.addError('dist/index.html不存在');
            return false;
        }

        try {
            const indexContent = fs.readFileSync(indexPath, 'utf8');
            
            // 检查HTML结构
            if (!indexContent.includes('<html') || !indexContent.includes('</html>')) {
                this.addWarning('index.html可能不是有效的HTML文件');
            }

            // 检查Vue应用挂载点
            if (!indexContent.includes('id="app"')) {
                this.addWarning('index.html可能缺少Vue应用挂载点');
            }

            this.addInfo('前端index.html验证通过');
        } catch (error) {
            this.addError(`读取index.html失败: ${error.message}`);
        }

        // 检查assets目录
        const assetsPath = path.join(distPath, 'assets');
        if (!fs.existsSync(assetsPath)) {
            this.addWarning('dist/assets目录不存在');
        } else {
            const assets = fs.readdirSync(assetsPath);
            if (assets.length === 0) {
                this.addWarning('assets目录为空');
            } else {
                this.addInfo(`找到${assets.length}个资源文件`);
            }
        }

        return true;
    }

    /**
     * 验证启动脚本
     */
    validateStartupScripts() {
        console.log('📝 验证启动脚本...');

        const scripts = [
            { name: 'start-mcp.bat', platform: 'Windows' },
            { name: 'start-mcp.sh', platform: 'Unix' },
            { name: 'stop-mcp.bat', platform: 'Windows' },
            { name: 'stop-mcp.sh', platform: 'Unix' }
        ];

        for (const script of scripts) {
            const scriptPath = path.join(this.pluginPath, script.name);
            if (!fs.existsSync(scriptPath)) {
                this.addWarning(`缺少${script.platform}启动脚本: ${script.name}`);
                continue;
            }

            try {
                const scriptContent = fs.readFileSync(scriptPath, 'utf8');
                
                // 检查脚本内容
                if (script.name.includes('start')) {
                    if (!scriptContent.includes('node mcp-server.js')) {
                        this.addWarning(`${script.name}可能缺少启动命令`);
                    }
                    if (!scriptContent.includes('NODE_ENV')) {
                        this.addWarning(`${script.name}可能缺少环境变量设置`);
                    }
                }

                this.addInfo(`${script.platform}脚本验证通过: ${script.name}`);
            } catch (error) {
                this.addError(`读取脚本文件失败: ${script.name} - ${error.message}`);
            }
        }

        return true;
    }

    /**
     * 验证依赖完整性
     */
    validateDependencies() {
        console.log('📦 验证依赖完整性...');

        const packageJsonPath = path.join(this.pluginPath, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            this.addError('无法验证依赖：package.json不存在');
            return false;
        }

        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const nodeModulesPath = path.join(this.pluginPath, 'node_modules');

            if (!fs.existsSync(nodeModulesPath)) {
                this.addWarning('node_modules目录不存在，需要运行npm install');
                return true; // 这不是错误，只是需要安装依赖
            }

            // 检查关键依赖是否安装
            if (packageJson.dependencies) {
                for (const [dep, version] of Object.entries(packageJson.dependencies)) {
                    const depPath = path.join(nodeModulesPath, dep);
                    if (!fs.existsSync(depPath)) {
                        this.addWarning(`依赖未安装: ${dep}`);
                    } else {
                        this.addInfo(`依赖已安装: ${dep}`);
                    }
                }
            }

            return true;
        } catch (error) {
            this.addError(`验证依赖失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 功能测试（可选）
     */
    async testFunctionality() {
        console.log('🧪 执行功能测试...');

        // 这里可以添加更多的功能测试
        // 例如：启动MCP服务器，测试API端点等
        
        this.addInfo('功能测试跳过（需要运行时环境）');
        return true;
    }

    /**
     * 生成验证报告
     */
    generateReport() {
        console.log('\n📋 生成验证报告...');

        const report = {
            timestamp: new Date().toISOString(),
            pluginPath: this.pluginPath,
            summary: {
                errors: this.errors.length,
                warnings: this.warnings.length,
                info: this.info.length
            },
            errors: this.errors,
            warnings: this.warnings,
            info: this.info
        };

        const reportPath = path.join(path.dirname(this.pluginPath), 'validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log(`\n📊 验证报告已保存: ${reportPath}`);
        return report;
    }

    /**
     * 显示验证摘要
     */
    showSummary() {
        console.log('\n========================================');
        console.log('📊 验证摘要');
        console.log('========================================');
        console.log(`📁 插件路径: ${this.pluginPath}`);
        console.log(`❌ 错误: ${this.errors.length}`);
        console.log(`⚠️ 警告: ${this.warnings.length}`);
        console.log(`ℹ️ 信息: ${this.info.length}`);
        console.log('========================================');

        if (this.errors.length === 0) {
            console.log('✅ 插件验证通过！');
            if (this.warnings.length > 0) {
                console.log('⚠️ 请注意警告信息，建议修复后再发布');
            }
        } else {
            console.log('❌ 插件验证失败，请修复错误后重试');
        }

        console.log('\n🔍 详细信息请查看验证报告');
    }

    /**
     * 执行完整验证
     */
    async validate() {
        console.log('🚀 开始验证TraeIDE插件...');
        console.log('========================================\n');

        try {
            // 执行各项验证
            this.validateStructure();
            this.validatePackageJson();
            this.validateTraeideConfig();
            this.validateMcpServer();
            this.validateFrontendAssets();
            this.validateStartupScripts();
            this.validateDependencies();
            await this.testFunctionality();

            // 生成报告和摘要
            this.generateReport();
            this.showSummary();

            return this.errors.length === 0;
        } catch (error) {
            console.error('\n❌ 验证过程中发生错误:', error.message);
            console.error(error.stack);
            return false;
        }
    }
}

// 主程序入口
if (require.main === module) {
    const pluginPath = process.argv[2];
    
    if (!pluginPath) {
        console.error('❌ 错误: 请指定插件目录路径');
        console.log('用法: node validate-plugin.js <插件目录路径>');
        process.exit(1);
    }

    const validator = new PluginValidator(pluginPath);
    validator.validate().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = PluginValidator;