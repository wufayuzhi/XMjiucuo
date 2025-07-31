/**
 * 导航配置文件
 * 用于管理导航菜单项、文本内容和通知配置
 */

import {
  LayoutDashboard,
  Database,
  FileText,
  History,
  MessageSquare,
  Bot,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-vue-next'

// 应用信息配置
export const appInfo = {
  name: 'TraeIDE项目偏离预防',
  subtitle: 'MCP产品',
  version: '1.0.0'
}

// 状态指示器配置
export const statusIndicators = [
  {
    id: 'mcp',
    label: 'MCP已连接',
    status: '正常',
    color: 'green',
    animated: true
  },
  {
    id: 'deepseek',
    label: 'DeepSeek在线',
    status: '活跃',
    color: 'blue',
    animated: false
  }
]

// 导航菜单项配置
export const navigationItems = [
  {
    name: '首页',
    path: '/',
    icon: LayoutDashboard,
    description: '项目概览和快速访问'
  },
  {
    name: '项目仪表板',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: '项目状态监控和数据分析'
  },
  {
    name: '需求管理',
    path: '/requirements',
    icon: FileText,
    description: '需求文档管理和跟踪'
  },
  {
    name: '上下文管理',
    path: '/context',
    icon: Database,
    description: '项目上下文和环境管理'
  },
  {
    name: '文档中心',
    path: '/documents',
    icon: History,
    description: '技术文档和知识库'
  },
  {
    name: '会话回溯',
    path: '/sessions',
    icon: MessageSquare,
    description: '历史会话记录和分析'
  },
  {
    name: 'DeepSeek集成',
    path: '/deepseek',
    icon: Bot,
    description: 'AI助手和智能分析'
  },
  {
    name: 'MCP演示',
    path: '/mcp-demo',
    icon: Settings,
    description: 'MCP功能演示和测试'
  }
]

// 底部操作按钮配置
export const bottomActions = [
  {
    id: 'notifications',
    label: '通知中心',
    icon: 'Bell',
    action: 'toggleNotifications'
  },
  {
    id: 'settings',
    label: '系统设置',
    icon: 'Settings',
    path: '/system'
  }
]

// 顶部工具栏按钮配置
export const toolbarActions = [
  {
    id: 'search',
    label: '快速搜索',
    icon: 'Search',
    action: 'openSearch'
  },
  {
    id: 'help',
    label: '帮助',
    icon: 'HelpCircle',
    action: 'openHelp'
  }
]

// 通知类型配置
export const notificationTypes = {
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-yellow-600',
    bgClass: 'bg-yellow-50'
  },
  success: {
    icon: CheckCircle,
    iconClass: 'text-green-600',
    bgClass: 'bg-green-50'
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-600',
    bgClass: 'bg-blue-50'
  },
  error: {
    icon: AlertTriangle,
    iconClass: 'text-red-600',
    bgClass: 'bg-red-50'
  }
}

// 默认通知数据（示例数据，实际使用时应从API获取）
export const getDefaultNotifications = () => [
  {
    id: 1,
    type: 'warning',
    title: '项目偏离预警',
    message: '检测到当前开发方向与核心需求存在偏离，建议及时调整',
    timestamp: '5分钟前',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    title: '上下文快照已保存',
    message: '系统已自动保存当前项目上下文快照',
    timestamp: '15分钟前',
    read: false,
  },
  {
    id: 3,
    type: 'success',
    title: 'MCP服务连接成功',
    message: 'MCP服务已成功连接，所有功能正常运行',
    timestamp: '1小时前',
    read: true,
  }
]

// 页面标题映射
export const pageTitleMap: Record<string, string> = {
  '/': '首页',
  '/dashboard': '项目仪表板',
  '/requirements': '需求管理',
  '/context': '上下文管理',
  '/documents': '文档中心',
  '/sessions': '会话回溯',
  '/deepseek': 'DeepSeek集成',
  '/mcp-demo': 'MCP演示',
  '/system': '系统设置'
}

// 获取页面标题
export const getPageTitle = (path: string): string => {
  return pageTitleMap[path] || '项目仪表板'
}

// 检查路径是否激活
export const isPathActive = (currentPath: string, targetPath: string): boolean => {
  if (targetPath === '/') {
    return currentPath === '/'
  }
  return currentPath.startsWith(targetPath)
}

// 获取通知图标组件
export const getNotificationIcon = (type: string) => {
  return notificationTypes[type as keyof typeof notificationTypes]?.icon || Info
}

// 获取通知图标样式类
export const getNotificationIconClass = (type: string): string => {
  return notificationTypes[type as keyof typeof notificationTypes]?.iconClass || 'text-gray-600'
}

// 获取通知背景样式类
export const getNotificationBgClass = (type: string): string => {
  return notificationTypes[type as keyof typeof notificationTypes]?.bgClass || 'bg-gray-50'
}