/**
 * 应用配置文件 - 统一管理所有硬编码参数
 * 用于替换项目中的硬编码数据、占位数据、虚假数据
 */

// 从环境变量获取配置，提供默认值
const getEnvConfig = () => {
  return {
    // 服务器配置
    server: {
      // MCP服务器端口配置
      mcp: {
        defaultPort: parseInt(process.env.MCP_WEB_PORT) || 3001,
        portRange: {
          start: parseInt(process.env.MCP_PORT_RANGE_START) || 3001,
          end: parseInt(process.env.MCP_PORT_RANGE_END) || 3050
        },
        host: process.env.MCP_HOST || 'localhost',
        protocol: process.env.MCP_PROTOCOL || 'ws'
      },
      // Web应用端口配置
      web: {
        defaultPort: parseInt(process.env.WEB_PORT) || 9001,
        portRange: {
          start: parseInt(process.env.WEB_PORT_RANGE_START) || 9001,
          end: parseInt(process.env.WEB_PORT_RANGE_END) || 9010
        },
        host: process.env.WEB_HOST || 'localhost'
      },
      // 超时配置
      timeout: {
        connection: parseInt(process.env.CONNECTION_TIMEOUT) || 10000,
        request: parseInt(process.env.REQUEST_TIMEOUT) || 30000,
        heartbeat: parseInt(process.env.HEARTBEAT_INTERVAL) || 30000
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
        openrouter: process.env.OPENROUTER_ENDPOINT || 'https://openrouter.ai/api/v1/chat/completions',
        deepseek: process.env.DEEPSEEK_ENDPOINT || 'https://api.deepseek.com/v1/chat/completions',
        openai: process.env.OPENAI_ENDPOINT || 'https://api.openai.com/v1/chat/completions'
      },
      // 默认模型配置
      models: {
        default: process.env.DEFAULT_MODEL || 'gpt-3.5-turbo',
        maxTokens: parseInt(process.env.MAX_TOKENS) || 4096,
        temperature: parseFloat(process.env.TEMPERATURE) || 0.7
      }
    },

    // 系统配置
    system: {
      // 语言和地区
      language: process.env.SYSTEM_LANGUAGE || 'zh-CN',
      timezone: process.env.SYSTEM_TIMEZONE || 'Asia/Shanghai',
      theme: process.env.SYSTEM_THEME || 'light',
      
      // 性能配置
      performance: {
        maxConcurrentTasks: parseInt(process.env.MAX_CONCURRENT_TASKS) || 5,
        cacheSize: parseInt(process.env.CACHE_SIZE) || 512,
        maxLogEntries: parseInt(process.env.MAX_LOG_ENTRIES) || 20
      },
      
      // 数据保留配置
      retention: {
        sessionDays: parseInt(process.env.SESSION_RETENTION_DAYS) || 90,
        logDays: parseInt(process.env.LOG_RETENTION_DAYS) || 30,
        snapshotInterval: parseInt(process.env.SNAPSHOT_INTERVAL) || 5
      }
    },

    // 文件和路径配置
    paths: {
      // 项目路径
      project: process.env.TRAEIDE_PROJECT_PATH || process.cwd(),
      
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
        sensitivity: parseInt(process.env.DEVIATION_SENSITIVITY) || 75,
        autoCorrection: process.env.ENABLE_AUTO_CORRECTION === 'true',
        realTimeMonitoring: process.env.ENABLE_REAL_TIME_MONITORING !== 'false'
      },
      
      // 健康检查配置
      healthCheck: {
        interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
        timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000,
        retryCount: parseInt(process.env.HEALTH_CHECK_RETRY) || 3
      }
    },

    // 通知配置
    notifications: {
      enabled: process.env.ENABLE_NOTIFICATIONS !== 'false',
      types: {
        deviation: process.env.NOTIFY_DEVIATION !== 'false',
        requirements: process.env.NOTIFY_REQUIREMENTS !== 'false',
        updates: process.env.NOTIFY_UPDATES === 'true'
      },
      methods: (process.env.NOTIFICATION_METHODS || 'browser,sound').split(',')
    },

    // 开发和调试配置
    development: {
      logLevel: process.env.LOG_LEVEL || 'info',
      enableMetrics: process.env.ENABLE_METRICS !== 'false',
      autoSave: process.env.AUTO_SAVE !== 'false',
      enableDebug: process.env.NODE_ENV === 'development'
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
const getServerConfig = () => getConfig().server
const getApiConfig = () => getConfig().api
const getSystemConfig = () => getConfig().system
const getPathsConfig = () => getConfig().paths
const getMonitoringConfig = () => getConfig().monitoring
const getNotificationConfig = () => getConfig().notifications
const getDevelopmentConfig = () => getConfig().development

// 导出配置
module.exports = {
  getConfig,
  getServerConfig,
  getApiConfig,
  getSystemConfig,
  getPathsConfig,
  getMonitoringConfig,
  getNotificationConfig,
  getDevelopmentConfig,
  validateConfig
}