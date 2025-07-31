/**
 * MCP客户端工具类 - 优化版本
 * 实现自动端口发现和智能重连功能
 * 组合方案1+2实现
 */

import { logger } from './logger'
import { errorHandler, ErrorType, ErrorSeverity } from './errorHandler'
import { getServerConfig, getPathsConfig } from '../config/app.config'

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
    port?: number
  }
  capabilities?: {
    resources: boolean
    tools: boolean
    prompts: boolean
  }
  lastHeartbeat?: string
  discoveredPorts?: number[]
  connectionAttempts?: number
}

export interface MCPPortInfo {
  port: number
  wsUrl: string
  httpUrl: string
  pid: number
  startTime: string
  projectPath: string
  serverVersion?: string
}

class OptimizedMCPClient {
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
  private status: MCPStatus = { 
    connected: false, 
    discoveredPorts: [],
    connectionAttempts: 0
  }
  private currentPort: number | null = null
  private portDiscoveryAttempts = 0
  private maxPortDiscoveryAttempts = 3

  constructor(
    private baseServerUrl?: string,
    private options: {
      heartbeatInterval?: number
      requestTimeout?: number
      autoReconnect?: boolean
      portRange?: { start: number; end: number }
      projectPath?: string
    } = {}
  ) {
    const serverConfig = getServerConfig()
    const pathsConfig = getPathsConfig()
    
    this.baseServerUrl = baseServerUrl || `${serverConfig.mcp.protocol}://${serverConfig.mcp.host}`
    this.options = {
      heartbeatInterval: serverConfig.timeout.heartbeat,
      requestTimeout: serverConfig.timeout.request,
      autoReconnect: true,
      portRange: serverConfig.mcp.portRange,
      projectPath: pathsConfig.project || process.cwd(),
      ...options,
    }
  }

  /**
   * 从端口信息文件读取端口
   */
  async readPortFromFile(): Promise<MCPPortInfo | null> {
    try {
      const portFilePath = `${this.options.projectPath}/.mcp-port.json`
      const response = await fetch(`file://${portFilePath}`)
      if (response.ok) {
        const portInfo: MCPPortInfo = await response.json()
        logger.info('从文件读取到端口信息', portInfo)
        return portInfo
      }
    } catch (error: any) {
      logger.debug('无法从文件读取端口信息', { error: error.message })
    }
    return null
  }

  /**
   * 通过HTTP健康检查发现可用端口
   */
  async discoverPortByHealthCheck(): Promise<number | null> {
    const { start, end } = this.options.portRange!
    const discoveredPorts: number[] = []

    logger.info('开始端口发现', { range: `${start}-${end}` })

    for (let port = start; port <= end; port++) {
      try {
        const response = await fetch(`http://${this.baseServerUrl.replace('ws://', '').replace('wss://', '')}:${port}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000) // 2秒超时
        })
        
        if (response.ok) {
          const healthData = await response.json()
          if (healthData.status === 'healthy') {
            discoveredPorts.push(port)
            logger.info('发现健康的MCP服务', { port, healthData })
            
            // 验证是否为MCP服务
            const statusResponse = await fetch(`http://${this.baseServerUrl.replace('ws://', '').replace('wss://', '')}:${port}/api/status`)
            if (statusResponse.ok) {
              const statusData = await statusResponse.json()
              if (statusData.status === 'running') {
                logger.info('确认为MCP服务', { port, statusData })
                this.status.discoveredPorts = discoveredPorts
                return port
              }
            }
          }
        }
      } catch (error) {
        // 端口不可用，继续尝试下一个
        logger.debug(`端口 ${port} 不可用`, { error: error.message })
      }
    }

    this.status.discoveredPorts = discoveredPorts
    return discoveredPorts.length > 0 ? discoveredPorts[0] : null
  }

  /**
   * 智能端口发现
   */
  async discoverPort(): Promise<number> {
    this.portDiscoveryAttempts++
    logger.info('开始智能端口发现', { attempt: this.portDiscoveryAttempts })

    // 方法1: 从端口信息文件读取
    const portInfo = await this.readPortFromFile()
    if (portInfo && portInfo.port) {
      logger.info('从文件发现端口', { port: portInfo.port })
      return portInfo.port
    }

    // 方法2: 通过健康检查发现
    const discoveredPort = await this.discoverPortByHealthCheck()
    if (discoveredPort) {
      logger.info('通过健康检查发现端口', { port: discoveredPort })
      return discoveredPort
    }

    // 方法3: 使用默认端口
    const defaultPort = this.options.portRange!.start
    logger.warn('使用默认端口', { port: defaultPort })
    return defaultPort
  }

  /**
   * 连接到MCP服务器
   */
  async connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // 智能端口发现
        this.currentPort = await this.discoverPort()
        const serverUrl = `${this.baseServerUrl}:${this.currentPort}`        
        logger.info('尝试连接MCP服务器', { 
          url: serverUrl, 
          attempt: this.reconnectAttempts + 1,
          portDiscoveryAttempt: this.portDiscoveryAttempts
        })

        this.ws = new WebSocket(serverUrl)
        this.status.connectionAttempts++

        this.ws.onopen = () => {
          logger.info('MCP WebSocket连接成功', { port: this.currentPort })
          this.status.connected = true
          this.reconnectAttempts = 0
          this.portDiscoveryAttempts = 0
          this.startHeartbeat()
          this.emit('connected', { port: this.currentPort })
          resolve()
        }

        this.ws.onmessage = event => {
          this.handleMessage(event.data)
        }

        this.ws.onclose = event => {
          logger.warn('MCP WebSocket连接关闭', {
            code: event.code,
            reason: event.reason,
            port: this.currentPort
          })
          this.status.connected = false
          this.stopHeartbeat()
          this.emit('disconnected', { 
            code: event.code, 
            reason: event.reason,
            port: this.currentPort
          })

          if (
            this.options.autoReconnect &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.scheduleReconnect()
          } else if (this.portDiscoveryAttempts < this.maxPortDiscoveryAttempts) {
            // 尝试重新发现端口
            logger.info('尝试重新发现端口')
            setTimeout(() => {
              this.connect().catch(error => {
                logger.error('重新连接失败', error)
              })
            }, this.reconnectDelay * 2)
          }
        }

        this.ws.onerror = _event => {
          const error = new Error(`WebSocket连接错误 (端口: ${this.currentPort})`)
          logger.error('MCP WebSocket错误', error)
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
              `连接超时 (端口: ${this.currentPort})`,
              `MCP服务器连接超时 (端口: ${this.currentPort})`,
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
   * 计划重连
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) // 指数退避
    
    logger.info('计划重连', {
      attempt: this.reconnectAttempts,
      delay,
      maxAttempts: this.maxReconnectAttempts
    })

    setTimeout(() => {
      this.connect().catch(error => {
        logger.error('重连失败', error)
        this.emit('reconnect_failed', { 
          attempt: this.reconnectAttempts, 
          error: error.message 
        })
      })
    }, delay)
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    logger.info('主动断开MCP连接', { port: this.currentPort })
    this.options.autoReconnect = false
    this.stopHeartbeat()

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    this.status.connected = false
    this.currentPort = null
    this.emit('disconnected', { code: 1000, reason: 'Client disconnect' })
  }

  /**
   * 获取连接状态
   */
  getStatus(): MCPStatus {
    return { 
      ...this.status,
      serverInfo: {
        ...this.status.serverInfo,
        port: this.currentPort || undefined
      }
    }
  }

  /**
   * 获取当前端口
   */
  getCurrentPort(): number | null {
    return this.currentPort
  }

  /**
   * 获取发现的端口列表
   */
  getDiscoveredPorts(): number[] {
    return this.status.discoveredPorts || []
  }

  /**
   * 手动设置端口并重连
   */
  async setPortAndReconnect(port: number): Promise<void> {
    logger.info('手动设置端口并重连', { port })
    
    if (this.ws) {
      this.disconnect()
    }
    
    this.currentPort = port
    await this.connect()
  }

  /**
   * 发送请求到MCP服务器
   */
  async sendRequest(method: string, params: any = {}, retryCount = 0): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw errorHandler.createError(
        ErrorType.MCP_CONNECTION,
        'WebSocket未连接',
        `MCP服务器未连接 (当前端口: ${this.currentPort})`,
        ErrorSeverity.HIGH
      )
    }

    const id = ++this.messageId
    const requestId = `req_${id}_${Date.now()}`
    const message = {
      jsonrpc: '2.0',
      id,
      method,
      params,
      requestId
    }
    
    logger.info(`发送MCP请求 [${requestId}]`, { method, params, port: this.currentPort })

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id)
        logger.error(`MCP请求超时 [${requestId}]`, { method, params, port: this.currentPort, retryCount } as any)
        
        // 如果是第一次超时且允许重试，尝试重试
        if (retryCount < 2 && this.ws && this.ws.readyState === WebSocket.OPEN) {
          logger.info(`重试MCP请求 [${requestId}]`, { attempt: retryCount + 1 })
          setTimeout(() => {
            this.sendRequest(method, params, retryCount + 1)
              .then(resolve)
              .catch(reject)
          }, 1000 * (retryCount + 1)) // 递增延迟
        } else {
          reject(
            errorHandler.createError(
              ErrorType.MCP_CONNECTION,
              `请求超时 [${requestId}]`,
              `MCP请求超时，已重试${retryCount}次 (端口: ${this.currentPort})`,
              ErrorSeverity.MEDIUM
            )
          )
        }
      }, this.options.requestTimeout)

      this.pendingRequests.set(id, { resolve, reject, timeout })

      try {
        this.ws!.send(JSON.stringify(message))
        logger.debug(`MCP请求已发送 [${requestId}]`, { method, params, id, port: this.currentPort })
      } catch (error) {
        this.pendingRequests.delete(id)
        clearTimeout(timeout)
        logger.error(`发送MCP请求失败 [${requestId}]`, error)
        reject(errorHandler.handleMCPError(error))
      }
    })
  }

  /**
   * 列出可用工具
   */
  async listTools(): Promise<MCPTool[]> {
    const response = await this.sendRequest('tools/list')
    return response.tools || []
  }

  /**
   * 调用工具
   */
  async callTool(name: string, arguments_: any): Promise<MCPToolResult> {
    return await this.sendRequest('tools/call', {
      name,
      arguments: arguments_,
    })
  }

  /**
   * 列出资源
   */
  async listResources(): Promise<MCPResource[]> {
    const response = await this.sendRequest('resources/list')
    return response.resources || []
  }

  /**
   * 获取服务器信息
   */
  async getServerInfo(): Promise<any> {
    try {
      return await this.callTool('get_server_info', {})
    } catch (error) {
      logger.warn('无法获取服务器信息', error)
      return null
    }
  }

  /**
   * Ping服务器
   */
  async ping(): Promise<boolean> {
    try {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return false
      }

      this.ws.send(JSON.stringify({
        type: 'ping',
        timestamp: new Date().toISOString()
      }))
      
      return true
    } catch (error) {
      logger.warn('Ping失败', error)
      return false
    }
  }

  /**
   * 处理收到的消息
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data)
      logger.debug('收到MCP消息', { message, port: this.currentPort })

      // 处理响应
      if (message.id && this.pendingRequests.has(message.id)) {
        const request = this.pendingRequests.get(message.id)!
        this.pendingRequests.delete(message.id)
        clearTimeout(request.timeout)

        if (message.error) {
          request.reject(
            errorHandler.createError(
              ErrorType.MCP_CONNECTION,
              message.error.message || 'MCP request error',
              `MCP请求错误: ${message.error.message}`,
              ErrorSeverity.MEDIUM
            )
          )
        } else {
          request.resolve(message.result)
        }
        return
      }

      // 处理通知
      if (message.type) {
        switch (message.type) {
          case 'welcome':
            this.status.serverInfo = message.serverInfo
            this.emit('welcome', message)
            break
          case 'pong':
            this.status.lastHeartbeat = message.timestamp
            this.emit('pong', message)
            break
          case 'server_shutdown':
            logger.warn('服务器即将关闭', message)
            this.emit('server_shutdown', message)
            break
          default:
            this.emit('notification', message)
        }
      }
    } catch (error) {
      logger.error('处理MCP消息失败', error)
      this.emit('message_error', { error: error.message, data })
    }
  }

  /**
   * 开始心跳
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    this.heartbeatInterval = setInterval(() => {
      this.ping().catch(error => {
        logger.warn('心跳失败', error)
      })
    }, this.options.heartbeatInterval!) as any
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
   * 事件监听
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(listener)
  }

  /**
   * 移除事件监听
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
        } catch (error: any) {
          logger.error('事件监听器执行失败', error.message, { eventName: event })
        }
      })
    }
  }
}

// 导出类作为默认导出
export default OptimizedMCPClient

// 命名导出
export { OptimizedMCPClient }

// 创建默认实例
export const optimizedMcpClient = new OptimizedMCPClient()