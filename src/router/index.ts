import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import RequirementManagementPage from '../pages/RequirementManagementPage.vue'
import ContextManagementPage from '../pages/ContextManagementPage.vue'
import DocumentCenterPage from '../pages/DocumentCenterPage.vue'
import SessionReviewPage from '../pages/SessionReviewPage.vue'
import DeepSeekIntegrationPage from '../pages/DeepSeekIntegrationPage.vue'
import SystemConfigPage from '../pages/SystemConfigPage.vue'
import MCPDemo from '../pages/MCPDemo.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: {
      title: 'TraeIDE项目偏离预防',
      description: '项目偏离预防和智能纠正系统首页'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: {
      title: '项目仪表板',
      description: '项目概览、上下文状态监控、偏离预警展示'
    }
  },
  {
    path: '/requirements',
    name: 'RequirementManagement',
    component: RequirementManagementPage,
    meta: {
      title: '需求管理',
      description: '核心需求定义、新需求评估、需求变更追踪'
    }
  },
  {
    path: '/context',
    name: 'ContextManagement',
    component: ContextManagementPage,
    meta: {
      title: '上下文管理',
      description: '项目上下文信息管理和历史记录'
    }
  },
  {
    path: '/documents',
    name: 'DocumentCenter',
    component: DocumentCenterPage,
    meta: {
      title: '文档中心',
      description: '技术文档管理和知识库'
    }
  },
  {
    path: '/sessions',
    name: 'SessionReview',
    component: SessionReviewPage,
    meta: {
      title: '会话回溯',
      description: '历史会话记录和分析'
    }
  },
  {
    path: '/deepseek',
    name: 'DeepSeekIntegration',
    component: DeepSeekIntegrationPage,
    meta: {
      title: 'DeepSeek集成',
      description: 'AI助手集成和智能分析'
    }
  },
  {
    path: '/system',
    name: 'SystemConfig',
    component: SystemConfigPage,
    meta: {
      title: '系统配置',
      description: '系统设置和配置管理'
    }
  },
  {
    path: '/mcp-demo',
    name: 'MCPDemo',
    component: MCPDemo,
    meta: {
      title: 'MCP优化方案演示',
      description: '展示服务器端自动端口分配和客户端自动发现功能'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} - TraeIDE MCP`
  }
  next()
})

export default router