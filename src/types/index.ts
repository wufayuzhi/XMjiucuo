/**
 * 全局类型定义
 */

// MCP相关类型
export interface MCPResource {
  uri: string
  name: string
  description?: string
  mimeType?: string
}

export interface MCPTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export interface MCPToolResult {
  content: Array<{
    type: string
    text: string
  }>
  isError?: boolean
}

export interface MCPStatus {
  connected: boolean
  lastConnected?: string
  error?: string
  serverInfo?: {
    name: string
    version: string
  }
}

export interface MCPOptions {
  url: string
  autoReconnect: boolean
  reconnectInterval: number
  maxReconnectAttempts: number
  requestTimeout: number
  heartbeatInterval: number
}

// 错误处理类型
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  MCP_CONNECTION = 'MCP_CONNECTION',
  MCP_PROTOCOL = 'MCP_PROTOCOL',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
}

export interface AppError {
  type: ErrorType
  code: string
  message: string
  userMessage: string
  severity: ErrorSeverity
  timestamp: string
  context?: Record<string, unknown>
  stack?: string
  retryable: boolean
  retryCount: number
  maxRetries: number
}

// 日志类型
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: unknown
  error?: {
    name: string
    message: string
    stack?: string
  }
  context?: string
  sessionId: string
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableStorage: boolean
  maxStorageEntries: number
  enableRemoteLogging: boolean
  remoteEndpoint?: string
}

// 性能监控类型
export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: string
  tags?: Record<string, string>
}

export interface NavigationTiming {
  navigationStart: number
  unloadEventStart: number
  unloadEventEnd: number
  redirectStart: number
  redirectEnd: number
  fetchStart: number
  domainLookupStart: number
  domainLookupEnd: number
  connectStart: number
  connectEnd: number
  secureConnectionStart: number
  requestStart: number
  responseStart: number
  responseEnd: number
  domLoading: number
  domInteractive: number
  domContentLoadedEventStart: number
  domContentLoadedEventEnd: number
  domComplete: number
  loadEventStart: number
  loadEventEnd: number
}

export interface ResourceTiming {
  name: string
  entryType: string
  startTime: number
  duration: number
  initiatorType: string
  transferSize: number
  encodedBodySize: number
  decodedBodySize: number
}

export interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

// 项目相关类型
export interface ProjectContext {
  projectPath: string
  files: string[]
  structure: Record<string, unknown>
  timestamp: string
  history?: {
    lastModified: string
    changes: unknown[]
  }
}

export interface DeviationAnalysis {
  filePath: string
  deviations: Array<{
    type: string
    message: string
    line?: number
    severity: 'info' | 'warning' | 'error'
  }>
  suggestions: string[]
  score: number
  timestamp: string
}

// 会话相关类型
export interface SessionEvent {
  id: number
  type: 'message' | 'decision' | 'file'
  title: string
  content: string
  timestamp: string
  isDecision: boolean
  decision?: {
    content: string
    maker: string
    impact: string
    alternatives: string[]
  }
}

export interface Session {
  id: number
  title: string
  type: 'requirement' | 'design' | 'development' | 'testing'
  startTime: string
  duration: string
  messageCount: number
  decisionCount: number
  hasDecisions: boolean
  isActive: boolean
  summary: string
  participants: string[]
  timeline: SessionEvent[]
}

// 通用工具类型
export type EventListener = (...args: unknown[]) => void

export interface EventEmitter {
  on(event: string, listener: EventListener): void
  off(event: string, listener: EventListener): void
  emit(event: string, ...args: unknown[]): void
}

// 主题类型
export type Theme = 'light' | 'dark' | 'system'

// API响应类型
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 配置类型
export interface AppConfig {
  theme: Theme
  language: string
  autoSave: boolean
  notifications: boolean
  mcpServer: {
    url: string
    autoConnect: boolean
  }
  deepseek: {
    apiKey?: string
    model: string
    enabled: boolean
  }
}
