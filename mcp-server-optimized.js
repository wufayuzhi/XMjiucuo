#!/usr/bin/env node

/**
 * TraeIDE项目偏离预防MCP服务器 - 优化版本
 * 实现自动端口分配 + 客户端自动发现功能
 * 组合方案1+2实现
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListResourcesRequestSchema, ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chokidar from 'chokidar'
import express from 'express'
import { WebSocketServer } from 'ws'
import net from 'net'

// ES模块中获取__dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class OptimizedTraeIDEMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'traeide-deviation-prevention-optimized',
        version: '2.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    )

    this.projectPath = process.env.TRAEIDE_PROJECT_PATH || process.cwd()
    this.webServer = null
    this.wsServer = null
    this.clients = new Set()
    this.actualPort = null
    this.portFile = path.join(this.projectPath, '.mcp-port.json')
    this.statusFile = path.join(this.projectPath, '.mcp-status.json')

    this.setupHandlers()
    this.setupFileWatcher()
  }

  /**
   * 自动查找可用端口
   */
  async findAvailablePort(startPort = parseInt(process.env.MCP_PORT_RANGE_START) || 3001, maxAttempts = 50) {
    for (let port = startPort; port < startPort + maxAttempts; port++) {
      if (await this.isPortAvailable(port)) {
        return port
      }
    }
    throw new Error(`无法找到可用端口，尝试范围: ${startPort}-${startPort + maxAttempts - 1}`)
  }

  /**
   * 检查端口是否可用
   */
  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = net.createServer()
      
      server.listen(port, () => {
        server.close(() => resolve(true))
      })
      
      server.on('error', () => {
        resolve(false)
      })
    })
  }

  /**
   * 写入端口信息文件
   */
  async writePortInfo(port) {
    const portInfo = {
      port,
      wsUrl: `ws://${process.env.MCP_HOST || 'localhost'}:${port}`,
      httpUrl: `http://${process.env.MCP_HOST || 'localhost'}:${port}`,
      pid: process.pid,
      startTime: new Date().toISOString(),
      projectPath: this.projectPath,
      serverVersion: '2.0.0'
    }

    try {
      await fs.writeFile(this.portFile, JSON.stringify(portInfo, null, 2), 'utf-8')
      console.log(`端口信息已写入: ${this.portFile}`)
    } catch (error) {
      console.error('写入端口信息失败:', error.message)
    }
  }

  /**
   * 写入服务状态文件
   */
  async writeStatusInfo(status = 'running') {
    const statusInfo = {
      status,
      port: this.actualPort,
      pid: process.pid,
      clients: this.clients.size,
      projectPath: this.projectPath,
      lastUpdate: new Date().toISOString(),
      uptime: process.uptime()
    }

    try {
      await fs.writeFile(this.statusFile, JSON.stringify(statusInfo, null, 2), 'utf-8')
    } catch (error) {
      console.error('写入状态信息失败:', error.message)
    }
  }

  /**
   * 清理端口和状态文件
   */
  async cleanup() {
    try {
      await fs.unlink(this.portFile).catch(() => {})
      await fs.unlink(this.statusFile).catch(() => {})
      console.log('清理端口和状态文件完成')
    } catch (error) {
      console.error('清理文件失败:', error.message)
    }
  }

  setupHandlers() {
    // 注册资源列表处理器
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'file://project-context',
            name: 'project-context',
            description: '项目上下文信息',
            mimeType: 'application/json',
          },
          {
            uri: 'file://requirements',
            name: 'requirements',
            description: '项目需求和规范文档',
            mimeType: 'text/markdown',
          },
          {
            uri: 'file://port-info',
            name: 'port-info',
            description: '服务器端口信息',
            mimeType: 'application/json',
          },
        ],
      }
    })

    // 注册工具列表处理器
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyze_deviation',
            description: '分析项目偏离情况',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: { type: 'string', description: '文件路径' },
                content: { type: 'string', description: '文件内容' },
              },
              required: ['filePath'],
            },
          },
          {
            name: 'get_project_context',
            description: '获取项目上下文信息',
            inputSchema: {
              type: 'object',
              properties: {
                includeHistory: {
                  type: 'boolean',
                  description: '是否包含历史记录',
                },
              },
            },
          },
          {
            name: 'get_server_info',
            description: '获取服务器信息和端口状态',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'update_requirements',
            description: '更新项目需求',
            inputSchema: {
              type: 'object',
              properties: {
                requirements: { type: 'string', description: '需求内容' },
                version: { type: 'string', description: '版本号' },
              },
              required: ['requirements'],
            },
          },
        ],
      }
    })

    // 注册工具调用处理器
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params
      const requestId = Math.random().toString(36).substr(2, 9)
      
      console.log(`[${requestId}] 处理工具调用: ${name}`, args)
      const startTime = Date.now()
      
      try {
        // 设置请求超时（25秒，小于客户端30秒超时）
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`工具调用超时: ${name} (25秒)`))
          }, 25000)
        })
        
        let result
        switch (name) {
          case 'analyze_deviation':
            result = await Promise.race([this.analyzeDeviation(args), timeoutPromise])
            break
          case 'get_project_context':
            result = await Promise.race([this.getProjectContext(args), timeoutPromise])
            break
          case 'get_server_info':
            result = await Promise.race([this.getServerInfo(args), timeoutPromise])
            break
          case 'update_requirements':
            result = await Promise.race([this.updateRequirements(args), timeoutPromise])
            break
          default:
            throw new Error(`Unknown tool: ${name}`)
        }
        
        const duration = Date.now() - startTime
        console.log(`[${requestId}] 工具调用完成: ${name} (${duration}ms)`)
        return result
        
      } catch (error) {
        const duration = Date.now() - startTime
        console.error(`[${requestId}] 工具调用失败: ${name} (${duration}ms)`, error.message)
        
        // 返回结构化错误响应
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: true,
              message: error.message,
              tool: name,
              requestId,
              duration,
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        }
      }
    })
  }

  setupFileWatcher() {
    // 监听项目文件变化
    this.watcher = chokidar.watch(this.projectPath, {
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
      persistent: true,
      ignoreInitial: true,
    })

    this.watcher.on('change', async filePath => {
      await this.handleFileChange(filePath)
    })

    this.watcher.on('add', async filePath => {
      await this.handleFileAdd(filePath)
    })
  }

  async setupWebServer() {
    const app = express()
    
    // 自动分配端口
    const preferredPort = parseInt(process.env.MCP_WEB_PORT) || 3001
    this.actualPort = await this.findAvailablePort(preferredPort)
    
    console.log(`使用端口: ${this.actualPort} (首选端口: ${preferredPort})`)

    app.use(express.json())
    app.use(express.static(path.join(__dirname, 'dist')))

    // 健康检查端点
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        port: this.actualPort,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      })
    })

    // API路由
    app.get('/api/status', (req, res) => {
      res.json({
        status: 'running',
        port: this.actualPort,
        projectPath: this.projectPath,
        clients: this.clients.size,
        pid: process.pid,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      })
    })

    app.get('/api/port-info', (req, res) => {
      res.json({
        port: this.actualPort,
        wsUrl: `ws://${process.env.MCP_HOST || 'localhost'}:${this.actualPort}`,
        httpUrl: `http://${process.env.MCP_HOST || 'localhost'}:${this.actualPort}`,
        pid: process.pid,
        startTime: new Date().toISOString(),
        projectPath: this.projectPath,
      })
    })

    app.post('/api/analyze', async (req, res) => {
      try {
        const result = await this.analyzeDeviation(req.body)
        res.json(result)
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    this.webServer = app.listen(this.actualPort, () => {
      console.log(`MCP优化服务器运行在端口 ${this.actualPort}`)
      console.log(`WebSocket地址: ws://${process.env.MCP_HOST || 'localhost'}:${this.actualPort}`)
      console.log(`HTTP地址: http://${process.env.MCP_HOST || 'localhost'}:${this.actualPort}`)
    })

    // 写入端口信息文件
    await this.writePortInfo(this.actualPort)
    await this.writeStatusInfo('running')

    // WebSocket服务器
    this.wsServer = new WebSocketServer({ server: this.webServer })
    this.wsServer.on('connection', ws => {
      this.clients.add(ws)
      console.log(`新的WebSocket连接 (总连接数: ${this.clients.size})`)
      
      // 发送欢迎消息
      ws.send(JSON.stringify({
        type: 'welcome',
        serverInfo: {
          name: 'traeide-deviation-prevention-optimized',
          version: '2.0.0',
          port: this.actualPort
        },
        timestamp: new Date().toISOString()
      }))

      ws.on('close', () => {
        this.clients.delete(ws)
        console.log(`WebSocket连接关闭 (剩余连接数: ${this.clients.size})`)
        this.writeStatusInfo('running') // 更新状态
      })

      ws.on('message', async message => {
        try {
          const data = JSON.parse(message)
          await this.handleWebSocketMessage(ws, data)
        } catch (error) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            error: error.message,
            timestamp: new Date().toISOString()
          }))
        }
      })
      
      // 更新状态
      this.writeStatusInfo('running')
    })

    // 定期更新状态文件
    setInterval(() => {
      this.writeStatusInfo('running')
    }, 30000) // 每30秒更新一次
  }

  async getServerInfo(args) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            serverName: 'traeide-deviation-prevention-optimized',
            version: '2.0.0',
            port: this.actualPort,
            pid: process.pid,
            uptime: process.uptime(),
            clients: this.clients.size,
            projectPath: this.projectPath,
            portFile: this.portFile,
            statusFile: this.statusFile,
            capabilities: ['auto-port-allocation', 'client-discovery', 'health-check'],
            timestamp: new Date().toISOString()
          }, null, 2),
        },
      ],
    }
  }

  async analyzeDeviation(args) {
    const { filePath, content } = args

    try {
      let actualFilePath = filePath
      if (!path.isAbsolute(filePath)) {
        actualFilePath = path.join(this.projectPath, filePath)
      }
      
      const fileContent = content || (await fs.readFile(actualFilePath, 'utf-8'))

      const analysis = {
        filePath,
        deviations: [],
        suggestions: [],
        score: 100,
        timestamp: new Date().toISOString(),
        serverPort: this.actualPort
      }

      // 检查代码规范
      if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
        if (!fileContent.includes('use strict') && !fileContent.includes('"use strict"')) {
          analysis.deviations.push({
            type: 'code_standard',
            message: '缺少严格模式声明',
            line: 1,
            severity: 'warning',
          })
          analysis.score -= 5
        }
      }

      // 检查文档注释
      if (!fileContent.includes('/**') && !fileContent.includes('//')) {
        analysis.deviations.push({
          type: 'documentation',
          message: '缺少代码注释',
          severity: 'info',
        })
        analysis.score -= 10
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analysis, null, 2),
          },
        ],
      }
    } catch (error) {
      throw new Error(`分析失败: ${error.message}`)
    }
  }

  async getProjectContext(args) {
    const { includeHistory = false } = args

    try {
      const context = {
        projectPath: this.projectPath,
        serverPort: this.actualPort,
        files: [],
        structure: {},
        timestamp: new Date().toISOString(),
      }

      // 扫描项目文件
      const files = await this.scanProjectFiles(this.projectPath)
      context.files = files

      if (includeHistory) {
        context.history = {
          lastModified: new Date().toISOString(),
          changes: [],
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(context, null, 2),
          },
        ],
      }
    } catch (error) {
      throw new Error(`获取项目上下文失败: ${error.message}`)
    }
  }

  async updateRequirements(args) {
    const { requirements, version = '1.0.0' } = args

    try {
      const reqPath = path.join(this.projectPath, '.trae', 'requirements.md')
      await fs.mkdir(path.dirname(reqPath), { recursive: true })

      const content = `# 项目需求文档\n\n版本: ${version}\n更新时间: ${new Date().toISOString()}\n服务器端口: ${this.actualPort}\n\n${requirements}`
      await fs.writeFile(reqPath, content, 'utf-8')

      // 通知所有WebSocket客户端
      this.broadcastToClients({
        type: 'requirements_updated',
        version,
        serverPort: this.actualPort,
        timestamp: new Date().toISOString(),
      })

      return {
        content: [
          {
            type: 'text',
            text: `需求文档已更新到版本 ${version}`,
          },
        ],
      }
    } catch (error) {
      throw new Error(`更新需求失败: ${error.message}`)
    }
  }

  async scanProjectFiles(dirPath, maxDepth = 5, currentDepth = 0) {
    const files = []
    
    // 防止递归过深
    if (currentDepth >= maxDepth) {
      console.warn(`达到最大扫描深度 ${maxDepth}，跳过: ${dirPath}`)
      return files
    }
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })
      
      // 限制单个目录的文件数量，防止性能问题
      const maxFilesPerDir = 1000
      let fileCount = 0
      
      for (const entry of entries) {
        if (fileCount >= maxFilesPerDir) {
          console.warn(`目录文件数量超过限制 ${maxFilesPerDir}，停止扫描: ${dirPath}`)
          break
        }
        
        // 跳过隐藏文件和常见的大型目录
        if (entry.name.startsWith('.') || 
            ['node_modules', 'dist', 'build', '.git', '.vscode'].includes(entry.name)) {
          continue
        }
        
        const fullPath = path.join(dirPath, entry.name)
        
        if (entry.isDirectory()) {
          // 递归扫描子目录
          const subFiles = await this.scanProjectFiles(fullPath, maxDepth, currentDepth + 1)
          files.push(...subFiles)
        } else {
          files.push({
            path: path.relative(this.projectPath, fullPath),
            name: entry.name,
            type: 'file',
            size: await this.getFileSize(fullPath)
          })
          fileCount++
        }
      }
    } catch (error) {
      console.error(`扫描文件失败 (${dirPath}):`, error.message)
    }
    
    return files
  }
  
  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath)
      return stats.size
    } catch (error) {
      return 0
    }
  }

  async handleFileChange(filePath) {
    console.log('文件变更:', filePath)
    this.broadcastToClients({
      type: 'file_changed',
      filePath,
      timestamp: new Date().toISOString(),
    })
  }

  async handleFileAdd(filePath) {
    console.log('文件添加:', filePath)
    this.broadcastToClients({
      type: 'file_added',
      filePath,
      timestamp: new Date().toISOString(),
    })
  }

  async handleWebSocketMessage(ws, data) {
    console.log('收到WebSocket消息:', data)
    
    switch (data.type) {
      case 'ping':
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString(),
          serverPort: this.actualPort
        }))
        break
      case 'get_status':
        ws.send(JSON.stringify({
          type: 'status',
          data: {
            port: this.actualPort,
            clients: this.clients.size,
            uptime: process.uptime(),
            projectPath: this.projectPath
          },
          timestamp: new Date().toISOString()
        }))
        break
      default:
        ws.send(JSON.stringify({
          type: 'error',
          error: `未知消息类型: ${data.type}`,
          timestamp: new Date().toISOString()
        }))
    }
  }

  broadcastToClients(message) {
    const messageStr = JSON.stringify(message)
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(messageStr)
      }
    })
  }

  async start() {
    try {
      console.log('启动MCP优化服务器...')
      await this.setupWebServer()
      
      // 设置优雅关闭
      process.on('SIGINT', () => this.gracefulShutdown())
      process.on('SIGTERM', () => this.gracefulShutdown())
      process.on('exit', () => this.cleanup())
      
      console.log('MCP优化服务器启动完成')
      console.log(`项目路径: ${this.projectPath}`)
      console.log(`端口信息文件: ${this.portFile}`)
      console.log(`状态信息文件: ${this.statusFile}`)
      
    } catch (error) {
      console.error('启动服务器失败:', error.message)
      await this.cleanup()
      process.exit(1)
    }
  }

  async gracefulShutdown() {
    console.log('\n正在优雅关闭服务器...')
    
    // 通知所有客户端服务器即将关闭
    this.broadcastToClients({
      type: 'server_shutdown',
      message: '服务器即将关闭',
      timestamp: new Date().toISOString()
    })
    
    // 关闭WebSocket服务器
    if (this.wsServer) {
      this.wsServer.close()
    }
    
    // 关闭HTTP服务器
    if (this.webServer) {
      this.webServer.close()
    }
    
    // 关闭文件监听器
    if (this.watcher) {
      await this.watcher.close()
    }
    
    // 清理文件
    await this.cleanup()
    
    console.log('服务器已优雅关闭')
    process.exit(0)
  }
}

// 启动服务器
const server = new OptimizedTraeIDEMCPServer()
server.start().catch(error => {
  console.error('服务器启动失败:', error)
  process.exit(1)
})