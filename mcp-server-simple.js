#!/usr/bin/env node

/**
 * TraeIDE MCP Server - 简化版本
 * 提供项目偏离检测和需求管理功能
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'

// ES模块中获取__dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class SimpleTraeIDEMCPServer {
  constructor() {
    this.projectPath = process.cwd()
    this.server = new Server(
      {
        name: 'TraeIDE MCP Server',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    )

    this.setupHandlers()
    this.setupWebServer()
  }

  setupHandlers() {
    // 简单的工具列表处理器
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
            name: 'get_project_status',
            description: '获取项目状态',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      }
    })

    // 工具调用处理器
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      switch (name) {
        case 'analyze_deviation':
          return await this.analyzeDeviation(args)
        case 'get_project_status':
          return await this.getProjectStatus(args)
        default:
          throw new Error(`Unknown tool: ${name}`)
      }
    })
  }

  async analyzeDeviation(args) {
    const { filePath, content } = args

    try {
      // 简单的偏离分析逻辑
      const analysis = {
        filePath,
        deviations: [],
        suggestions: [],
        score: 100,
        timestamp: new Date().toISOString(),
      }

      // 基本检查
      if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
        if (content && !content.includes('console.log')) {
          analysis.suggestions.push({
            type: 'logging',
            message: '建议添加适当的日志记录',
            severity: 'info',
          })
        }
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

  async getProjectStatus() {
    try {
      const status = {
        projectPath: this.projectPath,
        timestamp: new Date().toISOString(),
        status: 'running',
        message: 'MCP服务器运行正常',
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(status, null, 2),
          },
        ],
      }
    } catch (error) {
      throw new Error(`获取项目状态失败: ${error.message}`)
    }
  }

  setupWebServer() {
    const app = express()
    const port = parseInt(process.env.MCP_WEB_PORT) || parseInt(process.env.MCP_PORT_RANGE_START) || 3001

    app.use(express.json())

    // API路由
    app.get('/api/status', (req, res) => {
      res.json({
        status: 'running',
        projectPath: this.projectPath,
        timestamp: new Date().toISOString(),
      })
    })

    this.webServer = app.listen(port, () => {
      console.log(`MCP Web服务器运行在端口 ${port}`)
    })
  }

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.log('TraeIDE MCP服务器已启动')
  }

  async stop() {
    if (this.webServer) {
      this.webServer.close()
    }
    console.log('TraeIDE MCP服务器已停止')
  }
}

// 启动服务器
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMainModule) {
  const server = new SimpleTraeIDEMCPServer()

  process.on('SIGINT', async () => {
    console.log('\n正在关闭服务器...')
    await server.stop()
    process.exit(0)
  })

  server.start().catch(console.error)
}

export default SimpleTraeIDEMCPServer