/**
 * 前端应用配置文件 - 重新导出根目录配置
 * 用于前端组件访问统一的配置管理
 */

// 从环境变量获取配置，提供默认值
const getEnvConfig = () => {
  return {
    // 服务器配置
    server: {
      // MCP服务器端口配置
      mcp: {
        defaultPort: 3001,
        portRange: {
          start: 3001,
          end: 3050
        },
        host: 'localhost',
        protocol: 'ws'
      },
      // Web应用端口配置
      web: {
        defaultPort: 9001,
        portRange: {
          start: 9001,
          end: 9010
        },
        host: 'localhost'
      },
      // 超时配置
      timeout: {
        connection: 10000,
        request: 30000,
        heartbeat: 30000
      }
    },

    // API配置
    api: {
      // 支持的API密钥格式
      keyFormats: {
        openai: /^sk-[a-zA-Z0-9]{48,}$/,
        deepseek: /^sk-[a-zA-Z0-9]{48,}$/,
        openrouter: /^sk-or-v[0-9]+-[a-zA-Z0-9]{48,}$/,
        anthropic: /^sk-ant-[a-zA-Z0-9]{48,}$/,
        moonshot: /^sk-or-v1-[a-zA-Z0-9]{48,}$/
      },
      // API端点
      endpoints: {
        openrouter: 'https://openrouter.ai/api/v1/chat/completions',
        deepseek: 'https://api.deepseek.com/v1/chat/completions',
        openai: 'https://api.openai.com/v1/chat/completions'
      },
      // 默认模型配置
      models: {
        default: 'gpt-3.5-turbo',
        maxTokens: 4096,
        temperature: 0.7
      }
    },

    // 系统配置
    system: {
      // 语言和地区
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      theme: 'light',
      
      // 性能配置
      performance: {
        maxConcurrentTasks: 5,
        cacheSize: 512,
        maxLogEntries: 20
      },
      
      // 数据保留配置
      retention: {
        sessionDays: 90,
        logDays: 30,
        snapshotInterval: 5
      }
    },

    // 文件和路径配置
    paths: {
      // 项目路径
      project: typeof process !== 'undefined' ? process.cwd() : '/',
      
      // 配置文件路径
      config: {
        trae: '.trae',
        documents: '.trae/documents',
        requirements: '.trae/requirements.md',
        port: '.mcp-port.json',
        status: '.mcp-status.json'
      },
      
      // 文档扫描路径
      documents: {
        allowed: ['.trae/documents', 'docs', 'README.md', 'package.json'],
        extensions: ['.md', '.txt', '.json', '.ts', '.vue', '.js']
      }
    },

    // 监控和分析配置
    monitoring: {
      // 偏离检测配置
      deviation: {
        sensitivity: 75,
        autoCorrection: false,
        realTimeMonitoring: true
      },
      
      // 健康检查配置
      healthCheck: {
        interval: 30000,
        timeout: 5000,
        retryCount: 3
      }
    },

    // 通知配置
    notifications: {
      enabled: true,
      types: {
        deviation: true,
        requirements: true,
        updates: false
      },
      methods: ['browser', 'sound']
    },

    // 开发和调试配置
    development: {
      logLevel: 'info',
      enableMetrics: true,
      autoSave: true,
      enableDebug: false
    }
  }
}

// 验证配置的有效性
const validateConfig = (config) => {
  const errors = []
  
  // 验证端口范围
  if (config.server.mcp.portRange.start >= config.server.mcp.portRange.end) {
    errors.push('MCP端口范围配置无效')
  }
  
  if (config.server.web.portRange.start >= config.server.web.portRange.end) {
    errors.push('Web端口范围配置无效')
  }
  
  // 验证超时配置
  if (config.server.timeout.connection <= 0 || config.server.timeout.request <= 0) {
    errors.push('超时配置必须大于0')
  }
  
  // 验证性能配置
  if (config.system.performance.maxConcurrentTasks <= 0) {
    errors.push('最大并发任务数必须大于0')
  }
  
  if (errors.length > 0) {
    throw new Error(`配置验证失败: ${errors.join(', ')}`)
  }
  
  return true
}

// 获取完整配置
const getConfig = () => {
  const config = getEnvConfig()
  validateConfig(config)
  return config
}

// 获取特定配置节
export const getServerConfig = () => getConfig().server
export const getApiConfig = () => getConfig().api
export const getSystemConfig = () => getConfig().system
export const getPathsConfig = () => getConfig().paths
export const getMonitoringConfig = () => getConfig().monitoring
export const getNotificationConfig = () => getConfig().notifications
export const getDevelopmentConfig = () => getConfig().development
export { getConfig, validateConfig }