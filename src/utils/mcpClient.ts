/**
 * MCP客户端工具类
 * 实现与MCP服务器的双向通信
 */

import { logger } from './logger'
import { errorHandler, ErrorType, ErrorSeverity } from './errorHandler'
import { getServerConfig } from '../config/app.config'

export interface MCPResource {
  uri: string
  name: string
  description: string
  mimeType: string
}

export interface MCPTool {
  name: string
  description: string
  inputSchema: any
}

export interface MCPToolCall {
  name: string
  arguments: any
}

export interface MCPToolResult {
  content: Array<{
    type: string
    text: string
  }>
}

export interface MCPNotification {
  type: string
  data: any
  timestamp: string
}

export interface MCPStatus {
  connected: boolean
  serverInfo?: {
    name: string
    version: string
  }
  capabilities?: {
    resources: boolean
    tools: boolean
    prompts: boolean
  }
  lastHeartbeat?: string
}

class MCPClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: number | null = null
  private messageId = 0
  private pendingRequests = new Map<
    number,
    {
      resolve: (value: any) => void
      reject: (error: any) => void
      timeout: NodeJS.Timeout
    }
  >()
  private eventListeners = new Map<string, Set<Function>>()
  private status: MCPStatus = { connected: false }

  constructor(
    private serverUrl?: string,
    private options: {
      heartbeatInterval?: number
      requestTimeout?: number
      autoReconnect?: boolean
    } = {}
  ) {
    const serverConfig = getServerConfig()
    this.serverUrl = serverUrl || this.discoverServerUrl() || `${serverConfig.mcp.protocol}://${serverConfig.mcp.host}:${serverConfig.mcp.defaultPort}`
    this.options = {
      heartbeatInterval: serverConfig.timeout.heartbeat,
      requestTimeout: serverConfig.timeout.request,
      autoReconnect: true,
      ...options,
    }
  }

  /**
   * 发现MCP服务器URL
   */
  private discoverServerUrl(): string | null {
    try {
      // 尝试读取端口信息文件
      const portInfoPath = '.mcp-port.json'
      const fs = require('fs')
      if (fs.existsSync(portInfoPath)) {
        const portInfo = JSON.parse(fs.readFileSync(portInfoPath, 'utf-8'))
        if (portInfo.wsUrl) {
          logger.info('Discovered MCP server URL from port file', { url: portInfo.wsUrl })
          return portInfo.wsUrl
        }
      }
    } catch (error) {
      logger.warn('Failed to discover server URL from port file', error)
    }
    return null
  }

  /**
   * 连接到MCP服务器
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        logger.info('Connecting to MCP server', { url: this.serverUrl })

        this.ws = new WebSocket(this.serverUrl)

        this.ws.onopen = () => {
          logger.info('MCP WebSocket connected')
          this.status.connected = true
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.emit('connected')
          resolve()
        }

        this.ws.onmessage = event => {
          this.handleMessage(event.data)
        }

        this.ws.onclose = event => {
          logger.warn('MCP WebSocket closed', {
            code: event.code,
            reason: event.reason,
          })
          this.status.connected = false
          this.stopHeartbeat()
          this.emit('disconnected', { code: event.code, reason: event.reason })

          if (
            this.options.autoReconnect &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = _event => {
          const error = new Error('WebSocket connection error')
          logger.error('MCP WebSocket error', error)
          const appError = errorHandler.handleMCPError(error)
          this.emit('error', appError)
          reject(appError)
        }

        // 连接超时
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.ws?.close()
            const error = errorHandler.createError(
              ErrorType.MCP_CONNECTION,
              'Connection timeout',
              'MCP服务器连接超时',
              ErrorSeverity.HIGH
            )
            reject(error)
          }
        }, this.options.requestTimeout)
      } catch (error) {
        const appError = errorHandler.handleMCPError(error)
        reject(appError)
      }
    })
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    logger.info('Disconnecting from MCP server')
    this.options.autoReconnect = false
    this.stopHeartbeat()

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    this.status.connected = false
    this.emit('disconnected', { code: 1000, reason: 'Client disconnect' })
  }

  /**
   * 获取连接状态
   */
  getStatus(): MCPStatus {
    return { ...this.status }
  }

  /**
   * 发送请求到MCP服务器
   */
  async sendRequest(method: string, params: any = {}): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw errorHandler.createError(
        ErrorType.MCP_CONNECTION,
        'WebSocket not connected',
        'MCP服务器未连接',
        ErrorSeverity.HIGH
      )
    }

    const id = ++this.messageId
    const message = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id)
        reject(
          errorHandler.createError(
            ErrorType.TIMEOUT,
            'Request timeout',
            '请求超时，请稍后重试',
            ErrorSeverity.MEDIUM
          )
        )
      }, this.options.requestTimeout)

      this.pendingRequests.set(id, { resolve, reject, timeout })

      try {
        this.ws!.send(JSON.stringify(message))
        logger.debug('MCP request sent', { method, params, id })
      } catch (error) {
        this.pendingRequests.delete(id)
        clearTimeout(timeout)
        reject(errorHandler.handleMCPError(error))
      }
    })
  }

  /**
   * 获取可用资源列表
   */
  async listResources(): Promise<MCPResource[]> {
    try {
      const response = await this.sendRequest('resources/list')
      return response.resources || []
    } catch (error) {
      throw errorHandler.handleMCPError(error)
    }
  }

  /**
   * 获取可用工具列表
   */
  async listTools(): Promise<MCPTool[]> {
    try {
      const response = await this.sendRequest('tools/list')
      return response.tools || []
    } catch (error) {
      throw errorHandler.handleMCPError(error)
    }
  }

  /**
   * 调用MCP工具
   */
  async callTool(name: string, arguments_: any): Promise<MCPToolResult> {
    try {
      logger.info('Calling MCP tool', { name, arguments: arguments_ })
      const response = await this.sendRequest('tools/call', {
        name,
        arguments: arguments_,
      })
      logger.info('MCP tool call completed', { name, response })
      return response
    } catch (error) {
      logger.error('MCP tool call failed', error, {
        name,
        arguments: arguments_,
      })
      throw errorHandler.handleMCPError(error)
    }
  }

  /**
   * 分析项目偏离
   */
  async analyzeDeviation(filePath: string, content?: string): Promise<any> {
    return this.callTool('analyze_deviation', { filePath, content })
  }

  /**
   * 获取项目上下文
   */
  async getProjectContext(includeHistory: boolean = false): Promise<any> {
    return this.callTool('get_project_context', { includeHistory })
  }

  /**
   * 更新项目需求
   */
  async updateRequirements(
    requirements: string,
    version?: string
  ): Promise<any> {
    return this.callTool('update_requirements', { requirements, version })
  }

  /**
   * 自动生成需求
   */
  async autoGenerateRequirements(
    analysisDepth: 'basic' | 'detailed' | 'comprehensive' = 'detailed',
    includeDocuments: boolean = true,
    timeRange?: { start?: string; end?: string }
  ): Promise<any> {
    return this.callTool('auto_generate_requirements', {
      analysisDepth,
      includeDocuments,
      timeRange
    })
  }

  /**
   * 发送通知到MCP服务器
   */
  async sendNotification(type: string, data: any): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw errorHandler.createError(
        ErrorType.MCP_CONNECTION,
        'WebSocket not connected',
        'MCP服务器未连接',
        ErrorSeverity.HIGH
      )
    }

    const message = {
      jsonrpc: '2.0',
      method: 'notification',
      params: {
        type,
        data,
        timestamp: new Date().toISOString(),
      },
    }

    try {
      this.ws.send(JSON.stringify(message))
      logger.debug('MCP notification sent', { type, data })
    } catch (error) {
      throw errorHandler.handleMCPError(error)
    }
  }

  /**
   * 添加事件监听器
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(listener)
  }

  /**
   * 移除事件监听器
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(listener)
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          logger.error('Event listener error', error, { event, data })
        }
      })
    }
  }

  /**
   * 处理收到的消息
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data)
      logger.debug('MCP message received', message)

      if (message.id && this.pendingRequests.has(message.id)) {
        // 处理响应
        const request = this.pendingRequests.get(message.id)!
        this.pendingRequests.delete(message.id)
        clearTimeout(request.timeout)

        if (message.error) {
          const error = errorHandler.createError(
            ErrorType.MCP_CONNECTION,
            message.error.message || 'MCP server error',
            'MCP服务器返回错误',
            ErrorSeverity.MEDIUM,
            { code: message.error.code, details: message.error.data }
          )
          request.reject(error)
        } else {
          request.resolve(message.result)
        }
      } else if (message.method === 'notification') {
        // 处理通知
        this.handleNotification(message.params)
      } else if (message.method === 'heartbeat') {
        // 处理心跳
        this.status.lastHeartbeat = new Date().toISOString()
        this.emit('heartbeat')
      }
    } catch (error) {
      logger.error('Failed to parse MCP message', error, { data })
    }
  }

  /**
   * 处理服务器通知
   */
  private handleNotification(params: any): void {
    const notification: MCPNotification = {
      type: params.type,
      data: params.data,
      timestamp: params.timestamp || new Date().toISOString(),
    }

    logger.info('MCP notification received', notification)
    this.emit('notification', notification)
    this.emit(`notification:${notification.type}`, notification.data)
  }

  /**
   * 开始心跳
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    this.heartbeatInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              method: 'heartbeat',
              params: { timestamp: new Date().toISOString() },
            })
          )
        } catch (error) {
          logger.error('Heartbeat failed', error)
        }
      }
    }, this.options.heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    logger.info(`Scheduling MCP reconnect in ${delay}ms`, {
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
    })

    setTimeout(() => {
      if (
        this.options.autoReconnect &&
        this.reconnectAttempts <= this.maxReconnectAttempts
      ) {
        this.connect().catch(error => {
          logger.error('MCP reconnect failed', error)
        })
      }
    }, delay)
  }
}

// 创建全局MCP客户端实例
export const mcpClient = new MCPClient()

// 自动连接（如果在浏览器环境中）
if (typeof window !== 'undefined') {
  // 页面加载完成后自动连接
  window.addEventListener('load', () => {
    mcpClient.connect().catch(error => {
      logger.warn('Auto-connect to MCP server failed', error)
    })
  })

  // 页面卸载时断开连接
  window.addEventListener('beforeunload', () => {
    mcpClient.disconnect()
  })
}

export default mcpClient
