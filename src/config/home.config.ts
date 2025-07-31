/**
 * 首页配置文件
 * 用于管理首页的文本内容和跳转配置
 */

// 首页文本配置
export const homeTexts = {
  loading: '正在跳转到项目仪表板...',
  title: 'TraeIDE项目偏离预防系统',
  subtitle: '智能项目管理与偏离预警平台'
}

// 跳转配置
export const redirectConfig = {
  targetRoute: '/dashboard',
  delay: 1000 // 延迟时间（毫秒）
}

// 加载动画配置
export const loadingConfig = {
  spinnerClass: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4',
  containerClass: 'flex items-center justify-center h-screen',
  textClass: 'text-gray-600'
}