/**
 * 系统配置页面配置
 * 管理系统设置、用户偏好等配置数据
 */

// 配置标签页
export const getConfigTabs = () => {
  return [
    { id: 'global', name: '全局配置', icon: 'Settings' },
    { id: 'user', name: '用户偏好', icon: 'User' },
    { id: 'monitoring', name: '系统监控', icon: 'Activity' }
  ]
}

// 时间间隔选项
export const getTimeIntervalOptions = () => {
  return [
    { value: '1', label: '1分钟' },
    { value: '5', label: '5分钟' },
    { value: '10', label: '10分钟' },
    { value: '30', label: '30分钟' },
    { value: '60', label: '1小时' }
  ]
}

// 默认页面选项
export const getDefaultPageOptions = () => {
  return [
    { value: 'dashboard', label: '项目仪表板' },
    { value: 'context', label: '上下文管理' },
    { value: 'requirements', label: '需求管理' },
    { value: 'documents', label: '历史文档中心' }
  ]
}

// 侧边栏位置选项
export const getSidebarPositionOptions = () => {
  return [
    { value: 'left', label: '左侧' },
    { value: 'right', label: '右侧' }
  ]
}

// 页面密度选项
export const getDensityOptions = () => {
  return [
    { value: 'compact', label: '紧凑' },
    { value: 'normal', label: '正常' },
    { value: 'comfortable', label: '舒适' }
  ]
}

// 通知类型配置
export const getNotificationTypes = () => {
  return [
    {
      id: 'deviation',
      title: '偏离预警',
      description: '项目偏离核心目标时通知',
      enabled: true
    },
    {
      id: 'requirements',
      title: '需求变更',
      description: '需求文档发生变化时通知',
      enabled: true
    },
    {
      id: 'system',
      title: '系统状态',
      description: '系统运行状态异常时通知',
      enabled: false
    },
    {
      id: 'updates',
      title: '更新提醒',
      description: '有新版本或更新时通知',
      enabled: false
    }
  ]
}

// 默认全局配置
export const getDefaultGlobalConfig = () => {
  return {
    serverPort: parseInt(process.env.MCP_WEB_PORT || '3001'),
    maxConnections: 100,
    timeout: 30,
    enableSSL: false,
    logLevel: 'info',
    enableMetrics: true,
    autoBackup: true,
    backupInterval: 24
  }
}

// 默认MCP配置
export const getDefaultMcpConfig = () => {
  return {
    enableRealTimeMonitoring: true,
    enableAutoCorrection: false,
    enableNotifications: true,
    deviationSensitivity: 75,
    checkInterval: 5,
    dataRetentionDays: 30
  }
}

// 默认用户偏好
export const getDefaultUserPreferences = () => {
  return {
    defaultPage: 'dashboard',
    sidebarPosition: 'left',
    density: 'normal',
    showTooltips: true,
    showAnimations: true,
    showShortcuts: true,
    notifications: {
      deviation: true,
      requirements: true,
      system: false,
      updates: false
    }
  }
}

// 默认系统状态
export const getDefaultSystemStatus = () => {
  return {
    cpu: 45,
    memory: 62,
    disk: 78,
    network: 23,
    uptime: '2天 14小时 32分钟',
    lastCheck: '刚刚'
  }
}

// 默认系统日志
export const getDefaultSystemLogs = () => {
  return [
    { id: 1, timestamp: '14:30:25', level: 'info', message: '系统启动完成' },
    { id: 2, timestamp: '14:28:10', level: 'warn', message: '内存使用率较高' },
    { id: 3, timestamp: '14:27:45', level: 'error', message: '连接超时' },
    { id: 4, timestamp: '14:26:30', level: 'info', message: 'MCP服务器已连接' },
    { id: 5, timestamp: '14:26:15', level: 'info', message: '用户配置已更新' }
  ]
}

// 默认性能指标
export const getDefaultPerformanceMetrics = () => {
  return {
    responseTime: 245,
    throughput: 1250,
    errorRate: 0.02,
    activeConnections: 15
  }
}

// 日志级别选项
export const getLogLevelOptions = () => {
  return [
    { value: 'error', label: '错误' },
    { value: 'warn', label: '警告' },
    { value: 'info', label: '信息' },
    { value: 'debug', label: '调试' }
  ]
}

// 数据保留期选项
export const getDataRetentionOptions = () => {
  return [
    { value: 7, label: '7天' },
    { value: 14, label: '14天' },
    { value: 30, label: '30天' },
    { value: 90, label: '90天' },
    { value: 365, label: '1年' }
  ]
}

// 敏感度选项
export const getSensitivityOptions = () => {
  return [
    { value: 25, label: '低' },
    { value: 50, label: '中等' },
    { value: 75, label: '高' },
    { value: 90, label: '极高' }
  ]
}

// 页面文本配置
export const pageTexts = {
  title: '系统配置',
  subtitle: '全局参数设置、用户偏好配置、系统监控',
  tabs: {
    global: '全局配置',
    user: '用户偏好',
    monitoring: '系统监控'
  },
  sections: {
    serverConfig: {
      title: '服务器配置',
      serverPort: '服务器端口',
      maxConnections: '最大连接数',
      timeout: '超时时间 (秒)',
      enableSSL: '启用SSL',
      logLevel: '日志级别',
      enableMetrics: '启用性能指标',
      autoBackup: '自动备份',
      backupInterval: '备份间隔 (小时)'
    },
    mcpConfig: {
      title: 'MCP配置',
      deviationSensitivity: '偏离检测敏感度',
      checkInterval: '检查间隔',
      dataRetentionDays: '数据保留期 (天)',
      enableRealTimeMonitoring: '实时监控',
      enableAutoCorrection: '自动纠正',
      enableNotifications: '通知提醒'
    },
    userPreferences: {
      title: '用户偏好',
      interfacePreferences: '界面偏好',
      defaultPage: '默认页面',
      sidebarPosition: '侧边栏位置',
      density: '页面密度',
      displayOptions: '显示选项',
      showTooltips: '显示工具提示',
      showAnimations: '启用动画效果',
      showShortcuts: '显示快捷键',
      notificationPreferences: '通知偏好'
    },
    systemMonitoring: {
      title: '系统监控',
      systemStatus: '系统状态',
      cpuUsage: 'CPU使用率',
      memoryUsage: '内存使用率',
      diskUsage: '磁盘使用率',
      networkUsage: '网络使用率',
      systemUptime: '系统运行时间',
      lastCheck: '最后检查',
      systemLogs: '系统日志',
      performanceMetrics: '性能指标',
      responseTime: '响应时间',
      throughput: '吞吐量',
      errorRate: '错误率',
      activeConnections: '活跃连接'
    }
  },
  buttons: {
    save: '保存配置',
    cancel: '取消',
    reset: '重置',
    test: '测试连接',
    export: '导出配置',
    import: '导入配置'
  }
}

// 获取日志级别样式
export const getLogLevelStyle = (level: string) => {
  const styles = {
    error: 'text-red-600 bg-red-50',
    warn: 'text-yellow-600 bg-yellow-50',
    info: 'text-blue-600 bg-blue-50',
    debug: 'text-gray-600 bg-gray-50'
  }
  return styles[level] || styles.info
}

// 获取系统状态颜色
export const getSystemStatusColor = (value: number) => {
  if (value < 50) return 'text-green-600'
  if (value < 80) return 'text-yellow-600'
  return 'text-red-600'
}

// 获取系统状态背景色
export const getSystemStatusBg = (value: number) => {
  if (value < 50) return 'bg-green-50 border-green-200'
  if (value < 80) return 'bg-yellow-50 border-yellow-200'
  return 'bg-red-50 border-red-200'
}

// 获取日志级别类名（简化版本）
export const getLogLevelClass = (level: string): string => {
  const styles = {
    error: 'text-red-400',
    warn: 'text-yellow-400',
    info: 'text-blue-400',
    debug: 'text-gray-400'
  }
  return styles[level] || 'text-green-400'
}

export const getMetricStyle = (status: string): string => {
  switch (status) {
    case 'excellent':
      return 'bg-green-500'
    case 'good':
      return 'bg-blue-500'
    case 'warning':
      return 'bg-yellow-500'
    case 'critical':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

export const getMetricBarClass = (status: string): string => {
  return getMetricStyle(status)
}