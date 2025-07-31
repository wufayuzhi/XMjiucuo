<template>
  <!-- 侧边栏导航 -->
  <aside
    class="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-50 transition-transform duration-300"
    :class="{ '-translate-x-full lg:translate-x-0': !sidebarOpen }"
  >
    <!-- Logo和标题 -->
    <div class="flex items-center px-6 py-4 border-b border-gray-200">
      <Zap class="w-8 h-8 text-blue-600 mr-3" />
      <div>
        <h1 class="text-lg font-bold text-gray-900">{{ appInfo.name }}</h1>
        <p class="text-xs text-gray-500">{{ appInfo.subtitle }}</p>
      </div>
    </div>

    <!-- 状态指示器 -->
    <div class="px-6 py-3 border-b border-gray-200">
      <div class="space-y-2">
        <div 
          v-for="indicator in statusIndicators" 
          :key="indicator.id"
          class="flex items-center justify-between"
        >
          <div class="flex items-center space-x-2">
            <div 
              :class="[
                'w-2 h-2 rounded-full',
                `bg-${indicator.color}-500`,
                { 'animate-pulse': indicator.animated }
              ]" 
            />
            <span class="text-xs text-gray-600">{{ indicator.label }}</span>
          </div>
          <span 
            :class="[
              'text-xs font-medium',
              `text-${indicator.color}-600`
            ]"
          >
            {{ indicator.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- 主导航菜单 -->
    <nav class="flex-1 px-4 py-4">
      <div class="space-y-1">
        <router-link
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group"
          :class="
            isActive(item.path)
              ? 'bg-blue-100 text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          "
        >
          <component
            :is="item.icon"
            class="w-5 h-5 mr-3 transition-colors"
            :class="
              isActive(item.path)
                ? 'text-blue-600'
                : 'text-gray-400 group-hover:text-gray-600'
            "
          />
          {{ item.name }}
          <ChevronRight
            v-if="isActive(item.path)"
            class="w-4 h-4 ml-auto text-blue-600"
          />
        </router-link>
      </div>
    </nav>

    <!-- 底部操作区 -->
    <div class="px-4 py-4 border-t border-gray-200">
      <div class="space-y-2">
        <!-- 通知按钮 -->
        <button
          @click="showNotifications = !showNotifications"
          class="notification-button w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Bell class="w-4 h-4 mr-3" />
          {{ bottomActions.find(a => a.id === 'notifications')?.label || '通知中心' }}
          <span
            v-if="unreadCount > 0"
            class="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
          >
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>

        <!-- 设置按钮 -->
        <router-link
          :to="bottomActions.find(a => a.id === 'settings')?.path || '/system'"
          class="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Settings class="w-4 h-4 mr-3" />
          {{ bottomActions.find(a => a.id === 'settings')?.label || '系统设置' }}
        </router-link>
      </div>
    </div>
  </aside>

  <!-- 移动端遮罩层 -->
  <div
    v-if="sidebarOpen"
    @click="sidebarOpen = false"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
  />

  <!-- 顶部工具栏 -->
  <header
    class="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 z-30"
  >
    <div class="flex items-center justify-between h-full px-6">
      <!-- 移动端菜单按钮 -->
      <button
        @click="sidebarOpen = !sidebarOpen"
        class="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
      >
        <Menu class="w-5 h-5" />
      </button>

      <!-- 页面标题 -->
      <div class="flex-1 lg:flex-none">
        <h2 class="text-lg font-semibold text-gray-900">
          {{ currentPageTitle }}
        </h2>
      </div>

      <!-- 右侧操作区 -->
      <div class="flex items-center space-x-3">
        <!-- 快速操作按钮 -->
        <button
          v-for="action in toolbarActions"
          :key="action.id"
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          :title="action.label"
        >
          <Search v-if="action.icon === 'Search'" class="w-5 h-5" />
          <HelpCircle v-else-if="action.icon === 'HelpCircle'" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>

  <!-- 通知面板 -->
  <div
    v-if="showNotifications"
    class="absolute right-4 top-16 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
  >
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">通知</h3>
        <button
          @click="markAllAsRead"
          class="text-sm text-blue-600 hover:text-blue-800"
        >
          全部已读
        </button>
      </div>
    </div>

    <div class="max-h-96 overflow-y-auto">
      <div
        v-if="notifications.length === 0"
        class="p-4 text-center text-gray-500"
      >
        暂无通知
      </div>
      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="p-4 hover:bg-gray-50 cursor-pointer"
          :class="{ 'bg-blue-50': !notification.read }"
          @click="markAsRead(notification.id)"
        >
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <component
                :is="getNotificationIcon(notification.type)"
                class="w-5 h-5"
                :class="getNotificationIconClass(notification.type)"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">
                {{ notification.title }}
              </p>
              <p class="text-sm text-gray-600 mt-1">
                {{ notification.message }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                {{ notification.timestamp }}
              </p>
            </div>
            <div
              v-if="!notification.read"
              class="w-2 h-2 bg-blue-500 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Zap,
  Bell,
  Settings,
  Menu,
  ChevronRight,
  Search,
  HelpCircle,
} from 'lucide-vue-next'
import {
  appInfo,
  statusIndicators,
  navigationItems,
  bottomActions,
  toolbarActions,
  getDefaultNotifications,
  getPageTitle,
  isPathActive,
  getNotificationIcon,
  getNotificationIconClass,
  getNotificationBgClass
} from '@/config/navigation.config'

const route = useRoute()
const sidebarOpen = ref(true)
const showNotifications = ref(false)

// 计算当前页面标题
const currentPageTitle = computed(() => {
  return getPageTitle(route.path)
})

// 通知数据
const notifications = reactive(getDefaultNotifications())

// 计算未读通知数量
const unreadCount = computed(() => {
  return notifications.filter(n => !n.read).length
})

// 方法
const isActive = (path: string) => {
  return isPathActive(route.path, path)
}

const markAsRead = (id: number) => {
  const notification = notifications.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

const markAllAsRead = () => {
  notifications.forEach(n => (n.read = true))
}

// 点击外部关闭通知面板
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (
    !target.closest('.notification-panel') &&
    !target.closest('.notification-button')
  ) {
    showNotifications.value = false
  }
}

// 监听点击事件
if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>

<style scoped>
.notification-panel {
  /* 用于点击外部关闭的类名 */
}

.notification-button {
  /* 用于点击外部关闭的类名 */
}
</style>
