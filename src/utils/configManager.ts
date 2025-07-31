/**
 * 配置管理工具
 * 用于在前端动态加载和管理配置
 */

import { getConfig } from '../../config/app.config.js'

// 配置缓存
let configCache: any = null
let lastLoadTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

/**
 * 获取完整配置（带缓存）
 */
export const getAppConfig = () => {
  const now = Date.now()
  
  // 如果缓存有效，直接返回
  if (configCache && (now - lastLoadTime) < CACHE_DURATION) {
    return configCache
  }
  
  try {
    configCache = getConfig()
    lastLoadTime = now
    return configCache
  } catch (error) {
    console.error('加载配置失败:', error)
    // 返回默认配置
    return getDefaultConfig()
  }
}

/**
 * 获取默认配置（当配置文件加载失败时使用）
 */
const getDefaultConfig = () => {
  return {
    server: {
      mcp: {
        defaultPort: parseInt(getEnvVar('MCP_WEB_PORT', '3001')),
        host: getEnvVar('MCP_HOST', 'localhost'),
        protocol: 'ws'
      },
      web: {
        defaultPort: parseInt(getEnvVar('WEB_PORT', '9001')),
        host: getEnvVar('WEB_HOST', 'localhost')
      },
      timeout: {
        connection: 10000,
        request: 30000,
        heartbeat: 30000
      }
    },
    api: {
      keyFormats: {
        openai: /^sk-[a-zA-Z0-9]{48}$/,
        deepseek: /^sk-[a-zA-Z0-9]{32,}$/,
        openrouter: /^sk-or-v1-[a-zA-Z0-9]{64}$/,
        anthropic: /^sk-ant-[a-zA-Z0-9\-_]{95,}$/,
        moonshot: /^sk-[a-zA-Z0-9]{48,}$/
      },
      endpoints: {
        openrouter: 'https://openrouter.ai/api/v1/chat/completions',
        deepseek: 'https://api.deepseek.com/v1/chat/completions',
        openai: 'https://api.openai.com/v1/chat/completions'
      },
      models: {
        default: 'gpt-3.5-turbo',
        maxTokens: 4096,
        temperature: 0.7
      }
    },
    system: {
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      theme: 'light',
      performance: {
        maxConcurrentTasks: 5,
        cacheSize: 512,
        maxLogEntries: 20
      }
    },
    paths: {
      project: process.cwd ? process.cwd() : '/'
    },
    monitoring: {
      deviation: {
        sensitivity: 75,
        autoCorrection: false,
        realTimeMonitoring: true
      },
      healthCheck: {
        interval: 30000,
        timeout: 5000,
        retryCount: 3
      }
    },
    development: {
      logLevel: 'info',
      enableMetrics: true,
      autoSave: true
    }
  }
}

/**
 * 清除配置缓存
 */
export const clearConfigCache = () => {
  configCache = null
  lastLoadTime = 0
}

/**
 * 获取特定配置节
 */
export const getServerConfig = () => getAppConfig().server
export const getApiConfig = () => getAppConfig().api
export const getSystemConfig = () => getAppConfig().system
export const getPathsConfig = () => getAppConfig().paths
export const getMonitoringConfig = () => getAppConfig().monitoring
export const getDevelopmentConfig = () => getAppConfig().development

/**
 * 验证配置的有效性
 */
export const validateConfig = (config: any): string[] => {
  const errors: string[] = []
  
  // 验证服务器配置
  if (!config.server) {
    errors.push('缺少服务器配置')
  } else {
    if (!config.server.mcp?.defaultPort || config.server.mcp.defaultPort <= 0) {
      errors.push('MCP服务器端口配置无效')
    }
    if (!config.server.web?.defaultPort || config.server.web.defaultPort <= 0) {
      errors.push('Web服务器端口配置无效')
    }
  }
  
  // 验证API配置
  if (!config.api?.endpoints) {
    errors.push('缺少API端点配置')
  }
  
  // 验证系统配置
  if (!config.system) {
    errors.push('缺少系统配置')
  }
  
  return errors
}

/**
 * 获取环境变量值（浏览器环境兼容）
 */
export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  // 在浏览器环境中，我们无法直接访问process.env
  // 这里可以从其他地方获取配置，比如window对象或配置文件
  if (typeof window !== 'undefined' && (window as any).APP_CONFIG) {
    return (window as any).APP_CONFIG[key] || defaultValue
  }
  
  // Node.js环境
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue
  }
  
  return defaultValue
}

/**
 * 动态更新配置
 */
export const updateConfig = (path: string, value: any) => {
  if (!configCache) {
    configCache = getAppConfig()
  }
  
  const keys = path.split('.')
  let current = configCache
  
  // 导航到目标对象
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {}
    }
    current = current[keys[i]]
  }
  
  // 设置值
  current[keys[keys.length - 1]] = value
  
  console.log(`配置已更新: ${path} = ${value}`)
}

/**
 * 获取配置的字符串表示（用于调试）
 */
export const getConfigString = (): string => {
  try {
    return JSON.stringify(getAppConfig(), null, 2)
  } catch (error) {
    return `配置序列化失败: ${error}`
  }
}

/**
 * 检查配置是否已加载
 */
export const isConfigLoaded = (): boolean => {
  return configCache !== null
}

/**
 * 重新加载配置
 */
export const reloadConfig = () => {
  clearConfigCache()
  return getAppConfig()
}