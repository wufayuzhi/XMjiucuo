/**
 * 生产级日志系统
 * 支持多级别日志、文件输出、错误追踪
 */

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
  data?: any
  error?: Error
  context?: string
  userId?: string
  sessionId?: string
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableStorage: boolean
  maxStorageEntries: number
  enableRemoteLogging: boolean
  remoteEndpoint?: string
}

class Logger {
  private config: LoggerConfig
  private logs: LogEntry[] = []
  private sessionId: string

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableStorage: true,
      maxStorageEntries: 1000,
      enableRemoteLogging: false,
      ...config,
    }

    this.sessionId = this.generateSessionId()
    this.loadStoredLogs()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadStoredLogs(): void {
    if (!this.config.enableStorage) return

    try {
      const stored = localStorage.getItem('traeide_logs')
      if (stored) {
        this.logs = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load stored logs:', error)
    }
  }

  private saveToStorage(): void {
    if (!this.config.enableStorage) return

    try {
      // 保持日志数量在限制内
      if (this.logs.length > this.config.maxStorageEntries) {
        this.logs = this.logs.slice(-this.config.maxStorageEntries)
      }

      localStorage.setItem('traeide_logs', JSON.stringify(this.logs))
    } catch (error) {
      console.warn('Failed to save logs to storage:', error)
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemoteLogging || !this.config.remoteEndpoint) return

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      console.warn('Failed to send log to remote endpoint:', error)
    }
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const levelName = LogLevel[level]
    let formatted = `[${timestamp}] [${levelName}] ${message}`

    if (data) {
      formatted += ` | Data: ${JSON.stringify(data)}`
    }

    return formatted
  }

  private log(
    level: LogLevel,
    message: string,
    data?: any,
    error?: Error,
    context?: string
  ): void {
    if (level < this.config.level) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error: error
        ? ({
            name: error.name,
            message: error.message,
            stack: error.stack,
          } as any)
        : undefined,
      context,
      sessionId: this.sessionId,
    }

    this.logs.push(entry)

    // 控制台输出
    if (this.config.enableConsole) {
      const formatted = this.formatMessage(level, message, data)

      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formatted, error)
          break
        case LogLevel.INFO:
          console.info(formatted, error)
          break
        case LogLevel.WARN:
          console.warn(formatted, error)
          break
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(formatted, error)
          break
      }
    }

    // 存储到本地
    this.saveToStorage()

    // 发送到远程
    this.sendToRemote(entry)
  }

  debug(message: string, data?: any, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, undefined, context)
  }

  info(message: string, data?: any, context?: string): void {
    this.log(LogLevel.INFO, message, data, undefined, context)
  }

  warn(message: string, data?: any, context?: string): void {
    this.log(LogLevel.WARN, message, data, undefined, context)
  }

  error(message: string, error?: Error, data?: any, context?: string): void {
    this.log(LogLevel.ERROR, message, data, error, context)
  }

  fatal(message: string, error?: Error, data?: any, context?: string): void {
    this.log(LogLevel.FATAL, message, data, error, context)
  }

  // 性能监控
  time(label: string): void {
    console.time(label)
    this.debug(`Timer started: ${label}`, undefined, 'performance')
  }

  timeEnd(label: string): void {
    console.timeEnd(label)
    this.debug(`Timer ended: ${label}`, undefined, 'performance')
  }

  // 获取日志
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filtered = this.logs

    if (level !== undefined) {
      filtered = this.logs.filter(log => log.level >= level)
    }

    if (limit) {
      filtered = filtered.slice(-limit)
    }

    return filtered
  }

  // 清除日志
  clearLogs(): void {
    this.logs = []
    if (this.config.enableStorage) {
      localStorage.removeItem('traeide_logs')
    }
    this.info('Logs cleared')
  }

  // 导出日志
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  // 更新配置
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
    this.info('Logger configuration updated', config)
  }

  // 获取统计信息
  getStats(): { total: number; byLevel: Record<string, number> } {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<string, number>,
    }

    this.logs.forEach(log => {
      const levelName = LogLevel[log.level]
      stats.byLevel[levelName] = (stats.byLevel[levelName] || 0) + 1
    })

    return stats
  }
}

// 创建默认实例
export const logger = new Logger({
  level: import.meta.env?.DEV ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableStorage: true,
  maxStorageEntries: 1000,
  enableRemoteLogging: false,
})

// 全局错误处理
window.addEventListener('error', errorEvent => {
  logger.error(
    'Global error caught',
    errorEvent.error,
    {
      filename: errorEvent.filename,
      lineno: errorEvent.lineno,
      colno: errorEvent.colno,
    },
    'global'
  )
})

window.addEventListener('unhandledrejection', rejectionEvent => {
  logger.error(
    'Unhandled promise rejection',
    rejectionEvent.reason,
    {
      promise: rejectionEvent.promise,
    },
    'global'
  )
})

export default logger
