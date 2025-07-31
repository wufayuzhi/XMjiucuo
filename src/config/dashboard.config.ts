// Dashboard页面配置文件

// 项目信息类型定义
export interface ProjectInfo {
  name: string
  createTime: string
  lastUpdate: string
  currentPhase: string
  activeDevelopers: number
}

// 核心需求类型定义
export interface CoreRequirement {
  id: number
  name: string
  progress: number
}

// 预警信息类型定义
export interface Alert {
  id: number
  title: string
  description: string
  level: 'low' | 'medium' | 'high'
  time: string
  correlation: number
}

// 上下文状态类型定义
export interface ContextStatus {
  lastSnapshot: {
    time: string
    fileCount: number
    lineCount: number
  }
  integrity: {
    coreConstraints: 'complete' | 'partial' | 'missing'
    dependencies: 'complete' | 'partial' | 'missing'
    variableDefinitions: 'complete' | 'partial' | 'missing'
  }
  recovery: {
    suggestion: string
    action: string
  }
}

// 配置参数类型定义
export interface DashboardConfig {
  snapshotFrequency: number
  refreshInterval: number
}

export interface AlertConfig {
  correlationThreshold: number
  sensitivity: 'low' | 'medium' | 'high'
}

export interface ContextConfig {
  checkFrequency: number
  autoRecover: 'enabled' | 'disabled'
  retentionDays: number
}

// 敏感度选项
export const getSensitivityOptions = () => [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' }
]

// 页面文本配置
export const pageTexts = {
  title: '项目仪表板',
  subtitle: '实时监控项目状态和偏离情况',
  sections: {
    projectOverview: {
      title: '项目概览',
      configButton: '参数配置'
    },
    deviationAlert: {
      title: '偏离预警',
      configButton: '阈值设置'
    },
    contextStatus: {
      title: '上下文状态',
      configButton: '状态配置'
    }
  }
}

// 默认项目信息
export const getDefaultProjectInfo = (): ProjectInfo => ({
  name: 'XMjiucuo项目',
  createTime: '2024-01-15',
  lastUpdate: '2024-01-20 14:30',
  currentPhase: '开发阶段',
  activeDevelopers: 3
})

// 默认核心需求
export const getDefaultCoreRequirements = (): CoreRequirement[] => [
  { id: 1, name: 'MCP服务集成', progress: 85 },
  { id: 2, name: 'DeepSeek API对接', progress: 92 },
  { id: 3, name: '上下文管理系统', progress: 78 },
  { id: 4, name: '偏离检测算法', progress: 65 },
  { id: 5, name: '用户界面优化', progress: 88 }
]

// 默认预警信息
export const getDefaultAlerts = (): Alert[] => [
  {
    id: 1,
    title: '依赖关系偏离',
    description: '检测到部分模块依赖关系与预期不符',
    level: 'medium',
    time: '2分钟前',
    correlation: 75
  },
  {
    id: 2,
    title: 'API调用异常',
    description: 'DeepSeek API响应时间超出预期阈值',
    level: 'low',
    time: '5分钟前',
    correlation: 45
  }
]

// 默认上下文状态
export const getDefaultContextStatus = (): ContextStatus => ({
  lastSnapshot: {
    time: '14:25:30',
    fileCount: 42,
    lineCount: 3567
  },
  integrity: {
    coreConstraints: 'complete',
    dependencies: 'partial',
    variableDefinitions: 'complete'
  },
  recovery: {
    suggestion: '更新依赖关系映射',
    action: '执行快速恢复'
  }
})

// 默认配置参数
export const getDefaultConfig = (): DashboardConfig => ({
  snapshotFrequency: 5,
  refreshInterval: 30
})

export const getDefaultAlertConfig = (): AlertConfig => ({
  correlationThreshold: 70,
  sensitivity: 'medium'
})

export const getDefaultContextConfig = (): ContextConfig => ({
  checkFrequency: 10,
  autoRecover: 'enabled',
  retentionDays: 30
})

// 工具函数
export const getProgressColor = (progress: number): string => {
  if (progress >= 90) return 'bg-green-500'
  if (progress >= 70) return 'bg-blue-500'
  if (progress >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

export const getAlertStyle = (level: Alert['level']): string => {
  switch (level) {
    case 'high':
      return 'border-red-500 bg-red-50'
    case 'medium':
      return 'border-yellow-500 bg-yellow-50'
    case 'low':
      return 'border-blue-500 bg-blue-50'
    default:
      return 'border-gray-500 bg-gray-50'
  }
}

export const getAlertTextColor = (level: Alert['level']): string => {
  switch (level) {
    case 'high':
      return 'text-red-800'
    case 'medium':
      return 'text-yellow-800'
    case 'low':
      return 'text-blue-800'
    default:
      return 'text-gray-800'
  }
}

// 完整性状态图标和样式
export const getIntegrityIcon = (status: string) => {
  switch (status) {
    case 'complete':
      return 'CheckCircle'
    case 'partial':
      return 'AlertCircle'
    case 'missing':
      return 'XCircle'
    default:
      return 'HelpCircle'
  }
}

export const getIntegrityStyle = (status: string): string => {
  switch (status) {
    case 'complete':
      return 'text-green-600'
    case 'partial':
      return 'text-yellow-600'
    case 'missing':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export const getIntegrityText = (status: string): string => {
  switch (status) {
    case 'complete':
      return '完整'
    case 'partial':
      return '部分缺失'
    case 'missing':
      return '缺失'
    default:
      return '未知'
  }
}