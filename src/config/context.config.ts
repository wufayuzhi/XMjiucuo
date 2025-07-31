/**
 * 上下文管理页面配置
 * 管理上下文回顾、配置等数据
 */

// 回顾内容类型选项
export const getReviewContentTypes = () => {
  return [
    {
      id: 'constraints',
      label: '包含约束条件',
      description: '回顾项目的核心约束和限制条件',
      enabled: true
    },
    {
      id: 'requirements',
      label: '包含需求变更',
      description: '回顾需求文档的变更历史',
      enabled: true
    },
    {
      id: 'decisions',
      label: '包含决策记录',
      description: '回顾重要的技术和业务决策',
      enabled: false
    },
    {
      id: 'issues',
      label: '包含问题记录',
      description: '回顾已解决和未解决的问题',
      enabled: false
    },
    {
      id: 'milestones',
      label: '包含里程碑',
      description: '回顾项目的重要节点和成就',
      enabled: true
    }
  ]
}

// 回顾时间范围选项
export const getReviewTimeRangeOptions = () => {
  return [
    { value: 'last_day', label: '最近1天' },
    { value: 'last_week', label: '最近1周' },
    { value: 'last_month', label: '最近1月' },
    { value: 'last_quarter', label: '最近3月' },
    { value: 'last_year', label: '最近1年' },
    { value: 'all_time', label: '全部时间' },
    { value: 'custom', label: '自定义范围' }
  ]
}

// 回顾深度选项
export const getReviewDepthOptions = () => {
  return [
    { value: 'summary', label: '摘要级别', description: '仅包含关键信息摘要' },
    { value: 'detailed', label: '详细级别', description: '包含详细的变更记录' },
    { value: 'comprehensive', label: '全面级别', description: '包含所有相关信息和上下文' }
  ]
}

// 输出格式选项
export const getOutputFormatOptions = () => {
  return [
    { value: 'markdown', label: 'Markdown', icon: 'FileText' },
    { value: 'json', label: 'JSON', icon: 'Code' },
    { value: 'html', label: 'HTML', icon: 'Globe' },
    { value: 'pdf', label: 'PDF', icon: 'Download' }
  ]
}

// 默认回顾配置
export const getDefaultReviewConfig = () => {
  return {
    includeConstraints: true,
    includeRequirements: true,
    includeDecisions: false,
    includeIssues: false,
    includeMilestones: true,
    timeRange: 'last_month',
    depth: 'detailed',
    outputFormat: 'markdown',
    maxItems: 50,
    sortBy: 'date_desc',
    groupBy: 'type',
    includeMetadata: true
  }
}

// 上下文状态类型
export const getContextStatusTypes = () => {
  return [
    {
      id: 'active',
      label: '活跃',
      description: '正在活跃使用的上下文',
      color: 'green',
      icon: 'CheckCircle'
    },
    {
      id: 'stale',
      label: '过期',
      description: '长时间未更新的上下文',
      color: 'yellow',
      icon: 'AlertTriangle'
    },
    {
      id: 'archived',
      label: '已归档',
      description: '已归档的历史上下文',
      color: 'gray',
      icon: 'Archive'
    },
    {
      id: 'corrupted',
      label: '损坏',
      description: '数据不完整或损坏的上下文',
      color: 'red',
      icon: 'XCircle'
    }
  ]
}

// 默认上下文项目
export const getDefaultContextItems = () => {
  return [
    {
      id: 1,
      title: '项目核心约束条件',
      type: 'constraint',
      status: 'active',
      lastUpdated: '2024-01-15 14:30',
      size: '2.1KB',
      priority: 'high',
      description: '定义项目的核心约束和限制条件',
      tags: ['约束', '核心', '重要']
    },
    {
      id: 2,
      title: '需求变更记录 v2.1',
      type: 'requirement',
      status: 'active',
      lastUpdated: '2024-01-14 16:45',
      size: '5.3KB',
      priority: 'high',
      description: '记录需求文档的变更历史和影响分析',
      tags: ['需求', '变更', '版本']
    },
    {
      id: 3,
      title: '技术架构决策记录',
      type: 'decision',
      status: 'stale',
      lastUpdated: '2024-01-10 09:20',
      size: '3.7KB',
      priority: 'medium',
      description: '记录重要的技术架构决策和理由',
      tags: ['架构', '决策', '技术']
    }
  ]
}

// 排序选项
export const getSortOptions = () => {
  return [
    { value: 'date_desc', label: '最新优先' },
    { value: 'date_asc', label: '最旧优先' },
    { value: 'priority_desc', label: '优先级高到低' },
    { value: 'priority_asc', label: '优先级低到高' },
    { value: 'size_desc', label: '大小降序' },
    { value: 'size_asc', label: '大小升序' },
    { value: 'name_asc', label: '名称A-Z' },
    { value: 'name_desc', label: '名称Z-A' }
  ]
}

// 分组选项
export const getGroupByOptions = () => {
  return [
    { value: 'none', label: '不分组' },
    { value: 'type', label: '按类型分组' },
    { value: 'status', label: '按状态分组' },
    { value: 'priority', label: '按优先级分组' },
    { value: 'date', label: '按日期分组' }
  ]
}

// 优先级选项
export const getPriorityOptions = () => {
  return [
    { value: 'low', label: '低', color: 'gray' },
    { value: 'medium', label: '中', color: 'blue' },
    { value: 'high', label: '高', color: 'orange' },
    { value: 'critical', label: '紧急', color: 'red' }
  ]
}

// 页面文本配置
export const pageTexts = {
  title: '上下文管理',
  subtitle: '智能回顾、版本控制、状态监控',
  sections: {
    contextReview: {
      title: '上下文回顾',
      description: '智能分析项目历史，生成结构化回顾报告',
      generateButton: '生成回顾报告',
      configButton: '回顾配置'
    },
    contextItems: {
      title: '上下文项目',
      description: '管理和监控项目的上下文信息',
      addButton: '添加项目',
      filterButton: '筛选',
      sortButton: '排序'
    },
    reviewConfig: {
      title: '回顾配置参数',
      contentType: '回顾内容类型',
      timeRange: '时间范围',
      depth: '回顾深度',
      outputFormat: '输出格式',
      maxItems: '最大项目数',
      sortBy: '排序方式',
      groupBy: '分组方式',
      includeMetadata: '包含元数据'
    }
  },
  filters: {
    all: '全部',
    active: '活跃',
    stale: '过期',
    archived: '已归档',
    corrupted: '损坏'
  },
  actions: {
    view: '查看',
    edit: '编辑',
    delete: '删除',
    archive: '归档',
    restore: '恢复',
    export: '导出',
    refresh: '刷新'
  },
  buttons: {
    generate: '生成',
    save: '保存',
    cancel: '取消',
    reset: '重置',
    apply: '应用',
    close: '关闭'
  },
  status: {
    generating: '正在生成回顾报告...',
    success: '回顾报告生成成功',
    error: '生成失败，请重试',
    empty: '暂无上下文项目'
  }
}

// 获取状态样式
export const getStatusStyle = (status: string) => {
  const styles = {
    active: 'bg-green-100 text-green-800',
    stale: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800',
    corrupted: 'bg-red-100 text-red-800'
  }
  return styles[status] || styles.active
}

// 获取优先级样式
export const getPriorityStyle = (priority: string) => {
  const styles = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    critical: 'bg-red-100 text-red-600'
  }
  return styles[priority] || styles.medium
}

// 获取类型图标
export const getTypeIcon = (type: string) => {
  const icons = {
    constraint: 'Lock',
    requirement: 'FileText',
    decision: 'GitBranch',
    issue: 'AlertCircle',
    milestone: 'Flag',
    default: 'File'
  }
  return icons[type] || icons.default
}

// 格式化文件大小
export const formatFileSize = (sizeStr: string): string => {
  // 如果已经是格式化的字符串，直接返回
  if (typeof sizeStr === 'string' && sizeStr.includes('B')) {
    return sizeStr
  }
  
  const bytes = parseFloat(sizeStr)
  if (isNaN(bytes) || bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// 格式化日期
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}