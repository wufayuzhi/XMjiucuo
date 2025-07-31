/**
 * 文档中心页面配置
 * 管理文档检索、显示等配置数据
 */

// 每页显示数量选项
export const getPageSizeOptions = () => {
  return [
    { value: 10, label: '10条' },
    { value: 20, label: '20条' },
    { value: 50, label: '50条' },
    { value: 100, label: '100条' }
  ]
}

// 文档类型选项
export const getDocumentTypeOptions = () => {
  return [
    { value: 'all', label: '全部类型' },
    { value: 'requirement', label: '需求文档' },
    { value: 'design', label: '设计文档' },
    { value: 'api', label: 'API文档' },
    { value: 'user', label: '用户手册' },
    { value: 'technical', label: '技术文档' },
    { value: 'meeting', label: '会议记录' }
  ]
}

// 排序选项
export const getSortOptions = () => {
  return [
    { value: 'date_desc', label: '最新优先' },
    { value: 'date_asc', label: '最旧优先' },
    { value: 'relevance', label: '相关性' },
    { value: 'name_asc', label: '名称A-Z' },
    { value: 'name_desc', label: '名称Z-A' },
    { value: 'size_desc', label: '大小降序' },
    { value: 'size_asc', label: '大小升序' }
  ]
}

// 检索精度选项
export const getSearchPrecisionOptions = () => {
  return [
    { value: 0.3, label: '模糊匹配' },
    { value: 0.5, label: '一般精度' },
    { value: 0.7, label: '高精度' },
    { value: 0.9, label: '精确匹配' }
  ]
}

// 检索范围选项
export const getSearchScopeOptions = () => {
  return [
    { value: 'title', label: '仅标题' },
    { value: 'content', label: '仅内容' },
    { value: 'both', label: '标题和内容' },
    { value: 'metadata', label: '包含元数据' }
  ]
}

// 时间范围选项
export const getTimeRangeOptions = () => {
  return [
    { value: 'all', label: '全部时间' },
    { value: 'today', label: '今天' },
    { value: 'week', label: '最近一周' },
    { value: 'month', label: '最近一月' },
    { value: 'quarter', label: '最近三月' },
    { value: 'year', label: '最近一年' },
    { value: 'custom', label: '自定义范围' }
  ]
}

// 默认检索配置
export const getDefaultSearchConfig = () => {
  return {
    precision: 0.7,
    scope: 'both',
    timeRange: 'all',
    includeArchived: false,
    maxResults: 50,
    enableHighlight: true,
    caseSensitive: false
  }
}

// 默认显示配置
export const getDefaultDisplayConfig = () => {
  return {
    pageSize: 20,
    sortBy: 'date_desc',
    showPreview: true,
    showMetadata: true,
    showThumbnails: true,
    compactMode: false
  }
}

// 默认过滤配置
export const getDefaultFilterConfig = () => {
  return {
    documentType: 'all',
    author: '',
    tags: [],
    minSize: 0,
    maxSize: 0,
    hasAttachments: false
  }
}

// 文档状态选项
export const getDocumentStatusOptions = () => {
  return [
    { value: 'all', label: '全部状态' },
    { value: 'draft', label: '草稿' },
    { value: 'review', label: '审核中' },
    { value: 'approved', label: '已批准' },
    { value: 'published', label: '已发布' },
    { value: 'archived', label: '已归档' }
  ]
}

// 文档优先级选项
export const getDocumentPriorityOptions = () => {
  return [
    { value: 'all', label: '全部优先级' },
    { value: 'low', label: '低' },
    { value: 'normal', label: '普通' },
    { value: 'high', label: '高' },
    { value: 'urgent', label: '紧急' }
  ]
}

// 默认文档列表
export const getDefaultDocuments = () => {
  return [
    {
      id: 1,
      title: '项目需求规格说明书',
      type: 'requirement',
      author: '产品经理',
      date: '2024-01-15',
      size: '2.5MB',
      status: 'approved',
      priority: 'high',
      tags: ['需求', '规格', '核心'],
      preview: '本文档详细描述了项目的功能需求、非功能需求以及约束条件...',
      hasAttachments: true
    },
    {
      id: 2,
      title: '系统架构设计文档',
      type: 'design',
      author: '架构师',
      date: '2024-01-12',
      size: '1.8MB',
      status: 'review',
      priority: 'high',
      tags: ['架构', '设计', '技术'],
      preview: '系统采用微服务架构，包含用户服务、订单服务、支付服务...',
      hasAttachments: false
    },
    {
      id: 3,
      title: 'API接口文档',
      type: 'api',
      author: '后端开发',
      date: '2024-01-10',
      size: '950KB',
      status: 'published',
      priority: 'normal',
      tags: ['API', '接口', '开发'],
      preview: 'RESTful API设计规范，包含用户认证、数据操作等接口...',
      hasAttachments: true
    }
  ]
}

// 页面文本配置
export const pageTexts = {
  title: '历史文档中心',
  subtitle: '智能检索、版本管理、知识沉淀',
  search: {
    placeholder: '搜索文档标题、内容或标签...',
    button: '搜索',
    advanced: '高级搜索',
    clear: '清空'
  },
  filters: {
    title: '筛选条件',
    documentType: '文档类型',
    status: '状态',
    priority: '优先级',
    author: '作者',
    timeRange: '时间范围',
    tags: '标签',
    size: '文件大小'
  },
  display: {
    title: '显示设置',
    pageSize: '每页显示',
    sortBy: '排序方式',
    viewMode: '查看模式',
    showPreview: '显示预览',
    showMetadata: '显示元数据',
    compactMode: '紧凑模式'
  },
  searchConfig: {
    title: '检索配置参数',
    precision: '检索精度',
    scope: '检索范围',
    maxResults: '最大结果数',
    enableHighlight: '启用高亮',
    caseSensitive: '区分大小写',
    includeArchived: '包含已归档'
  },
  results: {
    total: '共找到 {count} 个结果',
    noResults: '未找到匹配的文档',
    loading: '正在搜索...',
    error: '搜索出错，请重试'
  },
  actions: {
    view: '查看',
    edit: '编辑',
    download: '下载',
    share: '分享',
    delete: '删除',
    archive: '归档',
    restore: '恢复',
    export: '导出',
    print: '打印'
  },
  buttons: {
    search: '搜索',
    reset: '重置',
    apply: '应用',
    cancel: '取消',
    save: '保存',
    close: '关闭'
  }
}

// 获取文档类型图标
export const getDocumentTypeIcon = (type: string) => {
  const icons = {
    requirement: 'FileText',
    design: 'Layers',
    api: 'Code',
    user: 'Users',
    technical: 'Settings',
    meeting: 'MessageSquare',
    default: 'File'
  }
  return icons[type] || icons.default
}

// 获取文档类型图标（别名）
export const getTypeIcon = getDocumentTypeIcon

// 获取文档类型样式
export const getTypeStyle = (type: string) => {
  const styles = {
    requirement: 'bg-blue-100 text-blue-800',
    design: 'bg-purple-100 text-purple-800',
    api: 'bg-green-100 text-green-800',
    user: 'bg-orange-100 text-orange-800',
    technical: 'bg-gray-100 text-gray-800',
    meeting: 'bg-yellow-100 text-yellow-800'
  }
  return styles[type] || 'bg-gray-100 text-gray-800'
}

// 获取文档状态样式
export const getDocumentStatusStyle = (status: string) => {
  const styles = {
    draft: 'bg-gray-100 text-gray-800',
    review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    published: 'bg-blue-100 text-blue-800',
    archived: 'bg-red-100 text-red-800'
  }
  return styles[status] || styles.draft
}

// 获取优先级样式
export const getDocumentPriorityStyle = (priority: string) => {
  const styles = {
    low: 'bg-gray-100 text-gray-600',
    normal: 'bg-blue-100 text-blue-600',
    high: 'bg-orange-100 text-orange-600',
    urgent: 'bg-red-100 text-red-600'
  }
  return styles[priority] || styles.normal
}

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}