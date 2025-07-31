#!/usr/bin/env node

/**
 * TraeIDE项目偏离预防MCP服务器
 * 实现MCP协议的双向通信服务
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
import { getServerConfig, getPathsConfig } from './config/app.config.js'

// ES模块中获取__dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 获取配置
const serverConfig = getServerConfig()
const pathsConfig = getPathsConfig()

class TraeIDEMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'traeide-deviation-prevention',
        version: '1.0.0',
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

    this.setupHandlers()
    this.setupFileWatcher()
    this.setupWebServer()
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
          {
            name: 'auto_generate_requirements',
            description: '自动生成需求评估',
            inputSchema: {
              type: 'object',
              properties: {
                timeRange: {
                  type: 'object',
                  description: '时间范围',
                  properties: {
                    start: { type: 'string', description: '开始时间' },
                    end: { type: 'string', description: '结束时间' }
                  }
                },
                analysisDepth: {
                  type: 'string',
                  description: '分析深度',
                  enum: ['basic', 'detailed', 'comprehensive']
                },
                includeDocuments: {
                  type: 'boolean',
                  description: '是否包含技术文档分析'
                },
                includeSessions: {
                  type: 'boolean',
                  description: '是否包含历史会话分析'
                }
              }
            },
          },
        ],
      }
    })

    // 注册工具调用处理器
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      switch (name) {
        case 'analyze_deviation':
          return await this.analyzeDeviation(args)
        case 'get_project_context':
          return await this.getProjectContext(args)
        case 'update_requirements':
          return await this.updateRequirements(args)
        case 'auto_generate_requirements':
          return await this.autoGenerateRequirements(args)
        default:
          throw new Error(`Unknown tool: ${name}`)
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

  setupWebServer() {
    const app = express()
    const port = process.env.MCP_WEB_PORT || serverConfig.mcp.defaultPort

    app.use(express.json())
    app.use(express.static(path.join(__dirname, 'dist')))

    // API路由
    app.get('/api/status', (req, res) => {
      res.json({
        status: 'running',
        projectPath: this.projectPath,
        clients: this.clients.size,
        timestamp: new Date().toISOString(),
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

    this.webServer = app.listen(port, () => {
      console.log(`MCP Web服务器运行在端口 ${port}`)
    })

    // WebSocket服务器
    this.wsServer = new WebSocketServer({ server: this.webServer })
    this.wsServer.on('connection', ws => {
      this.clients.add(ws)
      console.log('新的WebSocket连接')

      ws.on('close', () => {
        this.clients.delete(ws)
        console.log('WebSocket连接关闭')
      })

      ws.on('message', async message => {
        try {
          const data = JSON.parse(message)
          await this.handleWebSocketMessage(ws, data)
        } catch (error) {
          ws.send(JSON.stringify({ error: error.message }))
        }
      })
    })
  }

  async analyzeDeviation(args) {
    const { filePath, content } = args

    try {
      // 读取文件内容（如果未提供）
      let actualFilePath = filePath
      // 如果filePath是绝对路径，直接使用；否则拼接项目路径
      if (!path.isAbsolute(filePath)) {
        actualFilePath = path.join(this.projectPath, filePath)
      }
      
      const fileContent =
        content ||
        (await fs.readFile(actualFilePath, 'utf-8'))

      // 简单的偏离分析逻辑
      const analysis = {
        filePath,
        deviations: [],
        suggestions: [],
        score: 100,
        timestamp: new Date().toISOString(),
      }

      // 检查代码规范
      if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
        if (
          !fileContent.includes('use strict') &&
          !fileContent.includes('"use strict"')
        ) {
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
        files: [],
        structure: {},
        timestamp: new Date().toISOString(),
      }

      // 扫描项目文件
      const files = await this.scanProjectFiles(this.projectPath)
      context.files = files

      if (includeHistory) {
        // 添加历史记录（简化实现）
        context.history = {
          lastModified: new Date().toISOString(),
          changes: [],
        }
        context.sessions = await this.getHistoricalSessions()
        context.documents = await this.getTechnicalDocuments()
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

      const content = `# 项目需求文档\n\n版本: ${version}\n更新时间: ${new Date().toISOString()}\n\n${requirements}`
      await fs.writeFile(reqPath, content, 'utf-8')

      // 通知所有WebSocket客户端
      this.broadcastToClients({
        type: 'requirements_updated',
        version,
        timestamp: new Date().toISOString(),
      })

      return {
        content: [
          {
            type: 'text',
            text: '需求文档已更新',
          },
        ],
      }
    } catch (error) {
      throw new Error(`更新需求失败: ${error.message}`)
    }
  }

  async handleFileChange(filePath) {
    console.log(`文件变化: ${filePath}`)

    // 自动触发偏离分析
    try {
      const analysis = await this.analyzeDeviation({ filePath })

      // 通知所有客户端
      this.broadcastToClients({
        type: 'file_analysis',
        filePath,
        analysis: JSON.parse(analysis.content[0].text),
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error(`分析文件失败: ${error.message}`)
    }
  }

  async handleFileAdd(filePath) {
    console.log(`新文件: ${filePath}`)

    this.broadcastToClients({
      type: 'file_added',
      filePath,
      timestamp: new Date().toISOString(),
    })
  }

  async handleWebSocketMessage(ws, data) {
    const { type, payload } = data

    switch (type) {
      case 'get_status':
        ws.send(
          JSON.stringify({
            type: 'status',
            data: {
              status: 'running',
              projectPath: this.projectPath,
              timestamp: new Date().toISOString(),
            },
          })
        )
        break

      case 'analyze_file':
        try {
          const result = await this.analyzeDeviation(payload)
          ws.send(
            JSON.stringify({
              type: 'analysis_result',
              data: JSON.parse(result.content[0].text),
            })
          )
        } catch (error) {
          ws.send(
            JSON.stringify({
              type: 'error',
              message: error.message,
            })
          )
        }
        break

      default:
        ws.send(
          JSON.stringify({
            type: 'error',
            message: `未知消息类型: ${type}`,
          })
        )
    }
  }

  broadcastToClients(message) {
    const data = JSON.stringify(message)
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  }

  async scanProjectFiles(dir, files = []) {
    const items = await fs.readdir(dir)

    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = await fs.stat(fullPath)

      if (stat.isDirectory() && !item.startsWith('.')) {
        await this.scanProjectFiles(fullPath, files)
      } else if (stat.isFile()) {
        files.push({
          path: path.relative(this.projectPath, fullPath),
          size: stat.size,
          modified: stat.mtime.toISOString(),
        })
      }
    }

    return files
  }

  // 获取历史会话数据
  async getHistoricalSessions() {
    try {
      // 模拟历史会话数据（实际应该从TraeIDE会话记录中读取）
      const sessions = [
        {
          id: 'session_001',
          title: 'MCP协议集成讨论',
          type: 'requirement',
          startTime: '2024-01-15 09:00:00',
          duration: '2小时30分钟',
          messageCount: 45,
          decisionCount: 3,
          summary: '讨论MCP协议的集成方案，确定了客户端-服务端架构',
          participants: ['产品经理', '技术架构师', '前端开发'],
          decisions: [
            {
              id: 'dec_001',
              title: '通信协议选择',
              content: '采用WebSocket协议实现实时双向通信',
              maker: '技术架构师',
              impact: '影响整体架构设计',
              timestamp: '09:45:00'
            }
          ]
        },
        {
          id: 'session_002',
          title: '智能上下文管理需求',
          type: 'requirement',
          startTime: '2024-01-16 14:00:00',
          duration: '1小时45分钟',
          messageCount: 32,
          decisionCount: 2,
          summary: '讨论智能上下文管理功能，包括快照和信息压缩',
          participants: ['产品经理', '前端开发', 'UX设计师'],
          decisions: []
        },
        {
          id: 'session_003',
          title: '需求偏离预警系统设计',
          type: 'design',
          startTime: '2024-01-17 10:00:00',
          duration: '3小时15分钟',
          messageCount: 67,
          decisionCount: 5,
          summary: '设计需求偏离预警系统的算法和UI交互',
          participants: ['技术架构师', '算法工程师', 'UX设计师'],
          decisions: [
            {
              id: 'dec_002',
              title: '偏离度计算算法',
              content: '采用向量相似度和权重评分相结合的算法',
              maker: '算法工程师',
              impact: '影响预警准确性',
              timestamp: '11:30:00'
            }
          ]
        }
      ]
      
      return sessions
    } catch (error) {
      console.error('获取历史会话失败:', error)
      return []
    }
  }

  // 获取技术文档
  async getTechnicalDocuments() {
    try {
      const documents = []
      const docPaths = [
        path.join(this.projectPath, '.trae', 'documents'),
        path.join(this.projectPath, 'docs'),
        path.join(this.projectPath, 'README.md'),
        path.join(this.projectPath, 'package.json')
      ]
      
      for (const docPath of docPaths) {
        try {
          const stats = await fs.stat(docPath)
          
          if (stats.isDirectory()) {
            const files = await this.scanDocumentDirectory(docPath)
            documents.push(...files)
          } else if (stats.isFile()) {
            const doc = await this.loadTechnicalDocument(docPath)
            if (doc) documents.push(doc)
          }
        } catch (error) {
          // 文件不存在，跳过
          continue
        }
      }
      
      return documents
    } catch (error) {
      console.error('获取技术文档失败:', error)
      return []
    }
  }

  // 扫描文档目录
  async scanDocumentDirectory(dirPath) {
    const documents = []
    const allowedExtensions = ['.md', '.txt', '.json', '.ts', '.vue', '.js']
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        
        if (entry.isDirectory()) {
          // 递归扫描子目录
          const subDocs = await this.scanDocumentDirectory(fullPath)
          documents.push(...subDocs)
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name)
          if (allowedExtensions.includes(ext)) {
            const doc = await this.loadTechnicalDocument(fullPath)
            if (doc) documents.push(doc)
          }
        }
      }
    } catch (error) {
      console.warn(`扫描文档目录失败: ${dirPath}`, error)
    }
    
    return documents
  }

  // 加载技术文档
  async loadTechnicalDocument(filePath) {
    try {
      const stats = await fs.stat(filePath)
      const content = await fs.readFile(filePath, 'utf-8')
      
      return {
        path: filePath,
        name: path.basename(filePath),
        type: path.extname(filePath),
        content: content.substring(0, 10000), // 限制内容长度
        lastModified: stats.mtime.toISOString(),
        size: stats.size
      }
    } catch (error) {
      console.warn(`加载技术文档失败: ${filePath}`, error)
      return null
    }
  }

  // 自动生成需求评估
  async autoGenerateRequirements(args) {
    const {
      timeRange = { start: null, end: null },
      analysisDepth = 'detailed',
      includeDocuments = true,
      includeSessions = true
    } = args

    try {
      console.log('开始自动生成需求评估...')
      
      const analysisResult = {
        timestamp: new Date().toISOString(),
        config: { timeRange, analysisDepth, includeDocuments, includeSessions },
        generatedRequirements: [],
        analysisMetrics: {
          sessionsAnalyzed: 0,
          documentsScanned: 0,
          requirementsCandidates: 0,
          processingTime: 0
        },
        insights: []
      }

      const startTime = Date.now()

      // 1. 加载历史会话数据
      let sessions = []
      if (includeSessions) {
        sessions = await this.getHistoricalSessions()
        
        // 根据时间范围过滤会话
        if (timeRange.start || timeRange.end) {
          sessions = sessions.filter(session => {
            const sessionTime = new Date(session.startTime)
            const startFilter = !timeRange.start || sessionTime >= new Date(timeRange.start)
            const endFilter = !timeRange.end || sessionTime <= new Date(timeRange.end)
            return startFilter && endFilter
          })
        }
        
        analysisResult.analysisMetrics.sessionsAnalyzed = sessions.length
      }

      // 2. 扫描技术文档
      let documents = []
      if (includeDocuments) {
        documents = await this.getTechnicalDocuments()
        analysisResult.analysisMetrics.documentsScanned = documents.length
      }

      // 3. 分析会话内容，提取需求候选
      const requirementCandidates = await this.extractRequirementCandidates(sessions, documents, analysisDepth)
      analysisResult.analysisMetrics.requirementsCandidates = requirementCandidates.length

      // 4. 生成结构化需求
      analysisResult.generatedRequirements = await this.generateStructuredRequirements(requirementCandidates, analysisDepth)

      // 5. 生成分析洞察
      analysisResult.insights = await this.generateAnalysisInsights(sessions, documents, requirementCandidates)

      analysisResult.analysisMetrics.processingTime = Date.now() - startTime

      console.log(`需求评估生成完成，耗时 ${analysisResult.analysisMetrics.processingTime}ms`)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analysisResult, null, 2),
          },
        ],
      }
    } catch (error) {
      throw new Error(`自动生成需求评估失败: ${error.message}`)
    }
  }

  // 提取需求候选
  async extractRequirementCandidates(sessions, documents, analysisDepth) {
    const candidates = []

    // 从会话中提取需求
    for (const session of sessions) {
      // 基于会话类型和决策提取需求
      if (session.type === 'requirement' || session.decisions.length > 0) {
        candidates.push({
          id: `req_session_${session.id}`,
          title: session.title,
          description: session.summary,
          source: 'session',
          sourceId: session.id,
          priority: session.decisionCount > 2 ? 'high' : 'medium',
          category: this.categorizeRequirement(session.title, session.summary),
          extractedAt: new Date().toISOString(),
          confidence: this.calculateConfidence(session),
          relatedDecisions: session.decisions
        })
      }
    }

    // 从技术文档中提取需求
    for (const doc of documents) {
      if (doc.type === '.md' && (doc.name.includes('requirement') || doc.name.includes('spec'))) {
        const docRequirements = this.extractRequirementsFromDocument(doc)
        candidates.push(...docRequirements)
      }
    }

    return candidates
  }

  // 生成结构化需求
  async generateStructuredRequirements(candidates, analysisDepth) {
    const requirements = []

    for (const candidate of candidates) {
      const requirement = {
        id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: candidate.title,
        description: candidate.description,
        priority: candidate.priority,
        category: candidate.category,
        source: candidate.source,
        sourceId: candidate.sourceId,
        confidence: candidate.confidence,
        evaluation: {
          businessValue: this.evaluateBusinessValue(candidate),
          technicalFeasibility: this.evaluateTechnicalFeasibility(candidate),
          implementationCost: this.evaluateImplementationCost(candidate),
          riskAssessment: this.evaluateRisk(candidate),
          overallScore: 0
        },
        generatedAt: new Date().toISOString(),
        relatedItems: candidate.relatedDecisions || []
      }

      // 计算综合评分
      const scores = requirement.evaluation
      requirement.evaluation.overallScore = Math.round(
        (scores.businessValue + scores.technicalFeasibility + 
         (100 - scores.implementationCost) + (100 - scores.riskAssessment)) / 4
      )

      requirements.push(requirement)
    }

    // 按评分排序
    return requirements.sort((a, b) => b.evaluation.overallScore - a.evaluation.overallScore)
  }

  // 生成分析洞察
  async generateAnalysisInsights(sessions, documents, candidates) {
    const insights = []

    // 会话分析洞察
    if (sessions.length > 0) {
      const requirementSessions = sessions.filter(s => s.type === 'requirement')
      insights.push({
        type: 'session_analysis',
        title: '会话分析洞察',
        content: `分析了 ${sessions.length} 个历史会话，其中 ${requirementSessions.length} 个为需求相关会话。`,
        importance: 'medium'
      })
    }

    // 文档分析洞察
    if (documents.length > 0) {
      const specDocs = documents.filter(d => d.name.includes('spec') || d.name.includes('requirement'))
      insights.push({
        type: 'document_analysis',
        title: '文档分析洞察',
        content: `扫描了 ${documents.length} 个技术文档，发现 ${specDocs.length} 个规范文档。`,
        importance: 'medium'
      })
    }

    // 需求候选洞察
    if (candidates.length > 0) {
      const highPriority = candidates.filter(c => c.priority === 'high')
      insights.push({
        type: 'requirement_insights',
        title: '需求候选洞察',
        content: `识别出 ${candidates.length} 个需求候选，其中 ${highPriority.length} 个为高优先级。`,
        importance: 'high'
      })
    }

    return insights
  }

  // 辅助方法
  categorizeRequirement(title, description) {
    const text = (title + ' ' + description).toLowerCase()
    if (text.includes('ui') || text.includes('界面') || text.includes('交互')) return 'UI/UX'
    if (text.includes('api') || text.includes('接口') || text.includes('服务')) return 'API'
    if (text.includes('性能') || text.includes('优化') || text.includes('performance')) return '性能'
    if (text.includes('安全') || text.includes('权限') || text.includes('security')) return '安全'
    return '功能'
  }

  calculateConfidence(session) {
    let confidence = 50
    if (session.decisionCount > 0) confidence += 20
    if (session.messageCount > 30) confidence += 15
    if (session.participants.length > 2) confidence += 10
    return Math.min(confidence, 95)
  }

  extractRequirementsFromDocument(doc) {
    // 简化的文档需求提取逻辑
    const requirements = []
    const lines = doc.content.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('##') && (line.includes('需求') || line.includes('requirement'))) {
        requirements.push({
          id: `req_doc_${doc.name}_${i}`,
          title: line.replace(/^#+\s*/, ''),
          description: lines[i + 1] || '',
          source: 'document',
          sourceId: doc.path,
          priority: 'medium',
          category: '文档需求',
          confidence: 70
        })
      }
    }
    
    return requirements
  }

  evaluateBusinessValue(candidate) {
    let score = 60
    if (candidate.priority === 'high') score += 25
    if (candidate.confidence > 80) score += 10
    if (candidate.relatedDecisions && candidate.relatedDecisions.length > 0) score += 15
    return Math.min(score, 95)
  }

  evaluateTechnicalFeasibility(candidate) {
    let score = 70
    if (candidate.category === 'UI/UX') score += 15
    if (candidate.category === '性能') score -= 10
    if (candidate.source === 'session') score += 10
    return Math.max(Math.min(score, 95), 30)
  }

  evaluateImplementationCost(candidate) {
    let cost = 50
    if (candidate.priority === 'high') cost += 20
    if (candidate.category === 'API') cost += 15
    if (candidate.category === 'UI/UX') cost -= 10
    return Math.max(Math.min(cost, 90), 20)
  }

  evaluateRisk(candidate) {
    let risk = 40
    if (candidate.category === '安全') risk += 25
    if (candidate.confidence < 60) risk += 20
    if (candidate.priority === 'high') risk += 10
    return Math.max(Math.min(risk, 85), 15)
  }

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.log('TraeIDE MCP服务器已启动')
  }

  async stop() {
    if (this.watcher) {
      await this.watcher.close()
    }
    if (this.webServer) {
      this.webServer.close()
    }
    if (this.wsServer) {
      this.wsServer.close()
    }
    console.log('TraeIDE MCP服务器已停止')
  }
}

// 启动服务器
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMainModule) {
  const server = new TraeIDEMCPServer()

  process.on('SIGINT', async () => {
    console.log('\n正在关闭服务器...')
    await server.stop()
    process.exit(0)
  })

  server.start().catch(console.error)
}

export default TraeIDEMCPServer
