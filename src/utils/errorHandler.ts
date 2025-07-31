/**
 * 生产级错误处理系统
 * 提供统一的错误处理、重试机制、用户友好的错误提示
 */

import { logger } from './logger'
import { toast } from 'vue-sonner'

export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
  MCP_CONNECTION = 'MCP_CONNECTION',
  FILE_SYSTEM = 'FILE_SYSTEM',
  DEEPSEEK_API = 'DEEPSEEK_API',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface AppError {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  userMessage: string
  code?: string | number
  details?: any
  timestamp: string
  context?: string
  retryable: boolean
  originalError?: Error
}

export interface RetryConfig {
  maxAttempts: number
  delay: number
  backoff: number
  retryCondition?: (error: AppError) => boolean
}

class ErrorHandler {
  private errorHistory: AppError[] = []
  private maxHistorySize = 100

  /**
   * 创建应用错误
   */
  createError(
    type: ErrorType,
    message: string,
    userMessage: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options: Partial<AppError> = {}
  ): AppError {
    const error: AppError = {
      type,
      severity,
      message,
      userMessage,
      timestamp: new Date().toISOString(),
      retryable: this.isRetryable(type),
      ...options,
    }

    this.addToHistory(error)
    return error
  }

  /**
   * 处理错误
   */
  handleError(error: Error | AppError, context?: string): AppError {
    let appError: AppError

    if (this.isAppError(error)) {
      appError = error
    } else {
      appError = this.convertToAppError(error as Error, context)
    }

    // 记录日志
    this.logError(appError)

    // 显示用户提示
    this.showUserNotification(appError)

    // 上报错误（如果需要）
    this.reportError(appError)

    return appError
  }

  /**
   * 带重试的异步操作
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    retryConfig: Partial<RetryConfig> = {},
    context?: string
  ): Promise<T> {
    const config: RetryConfig = {
      maxAttempts: 3,
      delay: 1000,
      backoff: 2,
      retryCondition: error => error.retryable,
      ...retryConfig,
    }

    let lastError: AppError
    let attempt = 0

    while (attempt < config.maxAttempts) {
      try {
        attempt++
        logger.debug(
          `Attempting operation (${attempt}/${config.maxAttempts})`,
          { context }
        )

        const result = await operation()

        if (attempt > 1) {
          logger.info(`Operation succeeded after ${attempt} attempts`, {
            context,
          })
        }

        return result
      } catch (error) {
        lastError = this.handleError(error as Error, context)

        if (
          attempt >= config.maxAttempts ||
          !config.retryCondition!(lastError)
        ) {
          break
        }

        const delay = config.delay * Math.pow(config.backoff, attempt - 1)
        logger.warn(`Operation failed, retrying in ${delay}ms`, {
          attempt,
          maxAttempts: config.maxAttempts,
          error: lastError.message,
          context,
        })

        await this.sleep(delay)
      }
    }

    throw lastError
  }

  /**
   * 网络请求错误处理
   */
  handleNetworkError(error: any, url?: string): AppError {
    let type = ErrorType.NETWORK
    let userMessage = '网络连接失败，请检查网络设置'
    let severity = ErrorSeverity.MEDIUM

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      type = ErrorType.TIMEOUT
      userMessage = '请求超时，请稍后重试'
    } else if (error.response) {
      const status = error.response.status
      type = ErrorType.API

      switch (status) {
        case 401:
          type = ErrorType.AUTHENTICATION
          userMessage = '身份验证失败，请重新登录'
          severity = ErrorSeverity.HIGH
          break
        case 403:
          type = ErrorType.AUTHORIZATION
          userMessage = '权限不足，无法执行此操作'
          severity = ErrorSeverity.HIGH
          break
        case 404:
          type = ErrorType.NOT_FOUND
          userMessage = '请求的资源不存在'
          break
        case 429:
          userMessage = '请求过于频繁，请稍后重试'
          break
        case 500:
        case 502:
        case 503:
        case 504:
          userMessage = '服务器错误，请稍后重试'
          severity = ErrorSeverity.HIGH
          break
        default:
          userMessage = `请求失败 (${status})`
      }
    }

    return this.createError(
      type,
      error.message || 'Network request failed',
      userMessage,
      severity,
      {
        code: error.response?.status || error.code,
        details: {
          url,
          response: error.response?.data,
          config: error.config,
        },
        originalError: error,
      }
    )
  }

  /**
   * MCP连接错误处理
   */
  handleMCPError(error: any): AppError {
    return this.createError(
      ErrorType.MCP_CONNECTION,
      error.message || 'MCP connection failed',
      'MCP服务连接失败，请检查服务状态',
      ErrorSeverity.HIGH,
      {
        details: error,
        originalError: error,
        retryable: true,
      }
    )
  }

  /**
   * DeepSeek API错误处理
   */
  handleDeepSeekError(error: any): AppError {
    let userMessage = 'DeepSeek API调用失败'
    let severity = ErrorSeverity.MEDIUM

    if (error.response?.status === 401) {
      userMessage = 'DeepSeek API密钥无效，请检查配置'
      severity = ErrorSeverity.HIGH
    } else if (error.response?.status === 429) {
      userMessage = 'DeepSeek API调用频率超限，请稍后重试'
    } else if (error.response?.status === 402) {
      userMessage = 'DeepSeek API余额不足，请充值后重试'
      severity = ErrorSeverity.HIGH
    }

    return this.createError(
      ErrorType.DEEPSEEK_API,
      error.message || 'DeepSeek API error',
      userMessage,
      severity,
      {
        code: error.response?.status,
        details: error.response?.data,
        originalError: error,
      }
    )
  }

  /**
   * 文件系统错误处理
   */
  handleFileSystemError(error: any, operation?: string): AppError {
    let userMessage = '文件操作失败'

    if (operation) {
      userMessage = `${operation}失败`
    }

    if (error.code === 'ENOENT') {
      userMessage = '文件或目录不存在'
    } else if (error.code === 'EACCES') {
      userMessage = '文件访问权限不足'
    } else if (error.code === 'ENOSPC') {
      userMessage = '磁盘空间不足'
    }

    return this.createError(
      ErrorType.FILE_SYSTEM,
      error.message || 'File system error',
      userMessage,
      ErrorSeverity.MEDIUM,
      {
        code: error.code,
        details: { operation, path: error.path },
        originalError: error,
      }
    )
  }

  /**
   * 表单验证错误处理
   */
  handleValidationError(errors: Record<string, string[]>): AppError {
    const firstError = Object.values(errors)[0]?.[0] || '输入数据无效'

    return this.createError(
      ErrorType.VALIDATION,
      'Validation failed',
      firstError,
      ErrorSeverity.LOW,
      {
        details: errors,
        retryable: false,
      }
    )
  }

  /**
   * 获取错误历史
   */
  getErrorHistory(limit?: number): AppError[] {
    return limit ? this.errorHistory.slice(-limit) : [...this.errorHistory]
  }

  /**
   * 清除错误历史
   */
  clearErrorHistory(): void {
    this.errorHistory = []
    logger.info('Error history cleared')
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {}

    this.errorHistory.forEach(error => {
      stats[error.type] = (stats[error.type] || 0) + 1
    })

    return stats
  }

  private isAppError(error: any): error is AppError {
    return (
      error &&
      typeof error === 'object' &&
      'type' in error &&
      'severity' in error
    )
  }

  private convertToAppError(error: Error, context?: string): AppError {
    return this.createError(
      ErrorType.UNKNOWN,
      error.message || 'Unknown error occurred',
      '发生未知错误，请稍后重试',
      ErrorSeverity.MEDIUM,
      {
        context,
        originalError: error,
      }
    )
  }

  private isRetryable(type: ErrorType): boolean {
    const retryableTypes = [
      ErrorType.NETWORK,
      ErrorType.TIMEOUT,
      ErrorType.MCP_CONNECTION,
    ]
    return retryableTypes.includes(type)
  }

  private addToHistory(error: AppError): void {
    this.errorHistory.push(error)

    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize)
    }
  }

  private logError(error: AppError): void {
    const logData = {
      type: error.type,
      severity: error.severity,
      code: error.code,
      details: error.details,
      context: error.context,
    }

    switch (error.severity) {
      case ErrorSeverity.LOW:
        logger.info(error.message, logData, error.context)
        break
      case ErrorSeverity.MEDIUM:
        logger.warn(error.message, logData, error.context)
        break
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        logger.error(error.message, error.originalError, logData, error.context)
        break
    }
  }

  private showUserNotification(error: AppError): void {
    const options = {
      duration: this.getNotificationDuration(error.severity),
      action: error.retryable
        ? {
            label: '重试',
            onClick: () => {
              // 重试逻辑由调用方处理
            },
          }
        : undefined,
    }

    switch (error.severity) {
      case ErrorSeverity.LOW:
        toast.info(error.userMessage, options)
        break
      case ErrorSeverity.MEDIUM:
        toast.warning(error.userMessage, options)
        break
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        toast.error(error.userMessage, options)
        break
    }
  }

  private getNotificationDuration(severity: ErrorSeverity): number {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 3000
      case ErrorSeverity.MEDIUM:
        return 5000
      case ErrorSeverity.HIGH:
        return 8000
      case ErrorSeverity.CRITICAL:
        return 0 // 不自动关闭
      default:
        return 5000
    }
  }

  private async reportError(error: AppError): Promise<void> {
    // 这里可以实现错误上报逻辑
    // 例如发送到错误监控服务
    if (error.severity === ErrorSeverity.CRITICAL) {
      logger.info('Critical error reported', { error })
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 创建全局错误处理器实例
export const errorHandler = new ErrorHandler()

// 导出便捷方法
export const handleError = (error: Error | AppError, context?: string) =>
  errorHandler.handleError(error, context)

export const withRetry = <T>(
  operation: () => Promise<T>,
  retryConfig?: Partial<RetryConfig>,
  context?: string
) => errorHandler.withRetry(operation, retryConfig, context)

export default errorHandler
