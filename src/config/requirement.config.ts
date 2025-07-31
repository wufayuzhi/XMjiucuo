/**
 * 需求管理配置文件
 * 用于管理需求管理页面的静态数据和配置参数
 */

// 页面文本配置
export const pageTexts = {
  title: '需求管理',
  subtitle: '核心需求定义、新需求评估、需求变更追踪',
  sections: {
    coreRequirements: {
      title: '核心需求定义',
      addButton: '添加需求',
      configButton: '配置',
      editButton: '编辑',
      deleteButton: '删除',
      correlation: '关联度',
      correlationAssessment: '关联度评估',
      configPanel: {
        title: '需求配置参数',
        correlationThreshold: '关联度预警阈值 (%)',
        priorityStrategy: '优先级策略'
      }
    },
    newRequirementEvaluation: {
      title: '新需求评估',
      configButton: '配置',
      intelligentAnalysis: '智能需求分析',
      autoMode: '自动模式',
      manualMode: '手动模式',
      inputPlaceholder: '请描述新需求的功能和目标...',
      evaluateButton: '评估需求',
      runAnalysisButton: '运行智能分析',
      evaluationResult: {
        title: '评估结果',
        score: '综合评分',
        businessValue: '业务价值',
        feasibility: '可行性',
        cost: '成本估算',
        risk: '风险评估',
        recommendedPriority: '建议优先级',
        recommendation: '建议'
      },
      configPanel: {
        title: '评估配置参数',
        businessWeight: '业务价值权重 (%)',
        feasibilityWeight: '可行性权重 (%)'
      }
    },
    conflictDetection: {
      title: '需求冲突检测',
      subtitle: '自动检测需求间的潜在冲突和矛盾',
      configButton: '配置',
      severity: '严重程度',
      conflictWith: '冲突对象',
      configPanel: {
        title: '冲突检测配置',
        sensitivity: '检测敏感度',
        resolutionStrategy: '解决策略'
      }
    }
  }
}

// 优先级策略选项
export const priorityStrategyOptions = [
  { value: 'business', label: '业务价值优先' },
  { value: 'technical', label: '技术难度优先' },
  { value: 'timeline', label: '时间紧急度优先' },
  { value: 'balanced', label: '平衡策略' }
]

// 检测敏感度选项
export const sensitivityOptions = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' }
]

// 解决策略选项
export const resolutionStrategyOptions = [
  { value: 'manual', label: '手动解决' },
  { value: 'auto', label: '自动解决' },
  { value: 'suggest', label: '建议解决' }
]

// 默认核心需求数据
export const getDefaultCoreRequirements = () => [
  {
    id: 1,
    title: '上下文管理模块',
    description: '实现项目上下文的自动捕获、存储和恢复功能，确保开发过程的连续性',
    priority: 'high',
    correlation: 95,
    expanded: false,
    children: [
      {
        id: 11,
        title: '自动快照',
        description: '定时自动保存项目状态快照',
        correlation: 90,
      },
      {
        id: 12,
        title: '智能恢复',
        description: '基于历史数据智能恢复项目状态',
        correlation: 85,
      },
    ],
  },
  {
    id: 2,
    title: '需求管理模块',
    description: '提供需求定义、跟踪、变更管理等功能，确保项目需求的清晰性和可追溯性',
    priority: 'high',
    correlation: 88,
    expanded: false,
    children: [
      {
        id: 21,
        title: '需求定义',
        description: '结构化需求定义和文档化',
        correlation: 92,
      },
      {
        id: 22,
        title: '变更追踪',
        description: '需求变更历史记录和影响分析',
        correlation: 80,
      },
    ],
  },
  {
    id: 3,
    title: '历史文档中心',
    description: '集中管理项目相关的所有文档，提供版本控制和搜索功能',
    priority: 'medium',
    correlation: 75,
    expanded: false,
    children: [
      {
        id: 31,
        title: '文档版本控制',
        description: '文档版本管理和比较功能',
        correlation: 78,
      },
      {
        id: 32,
        title: '智能搜索',
        description: '基于内容的智能文档搜索',
        correlation: 72,
      },
    ],
  },
  {
    id: 4,
    title: 'Claude-4-Sonnet集成',
    description: '深度集成Claude-4-Sonnet，提供智能分析和建议',
    priority: 'medium',
    correlation: 82,
    expanded: false,
    children: [
      {
        id: 41,
        title: '提示词优化',
        description: 'Claude提示词模板和优化',
        correlation: 75,
      },
      {
        id: 42,
        title: '分阶段处理',
        description: '长上下文分阶段处理机制',
        correlation: 70,
      },
    ],
  },
]

// 默认冲突检测数据
export const getDefaultConflicts = () => [
  {
    id: 1,
    title: '实时通信与性能要求冲突',
    description: '实时WebSocket通信可能影响系统性能，与<200MB内存限制存在冲突',
    severity: '高',
    conflictWith: '性能优化需求',
  },
  {
    id: 2,
    title: '功能复杂度与用户体验冲突',
    description: '过多的配置参数可能影响用户体验的简洁性',
    severity: '中',
    conflictWith: '界面简化需求',
  },
]

// 默认配置参数
export const getDefaultRequirementConfig = () => ({
  correlationThreshold: 60,
  priorityStrategy: 'balanced',
})

export const getDefaultEvaluationConfig = () => ({
  businessWeight: 40,
  feasibilityWeight: 30,
})

export const getDefaultConflictConfig = () => ({
  sensitivity: 'medium',
  resolutionStrategy: 'manual',
})

// 默认新需求数据
export const getDefaultNewRequirement = () => ({
  description: '',
})

// 工具函数
export const getRequirementBorderStyle = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'border-red-200 bg-red-50'
    case 'medium':
      return 'border-yellow-200 bg-yellow-50'
    case 'low':
      return 'border-green-200 bg-green-50'
    default:
      return 'border-gray-200 bg-gray-50'
  }
}

export const getPriorityStyle = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getPriorityText = (priority: string): string => {
  switch (priority) {
    case 'high':
      return '高优先级'
    case 'medium':
      return '中优先级'
    case 'low':
      return '低优先级'
    default:
      return '未设置'
  }
}

export const getCorrelationColor = (correlation: number): string => {
  if (correlation >= 80) return 'bg-green-500'
  if (correlation >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  return 'text-red-500'
}

export const getPriorityRecommendationStyle = (priority: string): string => {
  switch (priority) {
    case '高等':
      return 'bg-red-100 text-red-800'
    case '中等':
      return 'bg-yellow-100 text-yellow-800'
    case '低等':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// 分析进度配置
export const getDefaultAnalysisProgress = () => ({
  show: false,
  progress: 0,
  stage: '准备分析...'
})

// 分析配置
export const getDefaultAnalysisConfig = () => ({
  maxRequirements: 5,
  minCorrelation: 60,
  includeSubRequirements: true,
  analysisDepth: 'detailed'
})

// 优先级映射
export const priorityMap = {
  high: '高等',
  medium: '中等',
  low: '低等'
}

// 严重程度映射
export const severityMap = {
  high: '高',
  medium: '中',
  low: '低'
}