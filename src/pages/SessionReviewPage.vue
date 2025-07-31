<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">会话回溯</h1>
      <p class="text-gray-600">会话历史记录、关键决策点标记、快速回溯</p>
    </div>

    <!-- 控制面板 -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 flex items-center">
          <Clock class="w-5 h-5 mr-2 text-blue-600" />
          会话控制
        </h2>
        <div class="flex space-x-2">
          <button
            @click="showSessionConfig = !showSessionConfig"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm flex items-center"
          >
            <Settings class="w-4 h-4 mr-1" />
            配置
          </button>
          <button
            @click="exportSessions"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center"
          >
            <Download class="w-4 h-4 mr-1" />
            导出
          </button>
        </div>
      </div>

      <!-- 时间范围选择 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >时间范围</label
          >
          <select
            v-model="timeRange"
            @change="filterSessions"
            class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="today">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="all">全部</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >会话类型</label
          >
          <select
            v-model="sessionType"
            @change="filterSessions"
            class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">全部类型</option>
            <option value="requirement">需求讨论</option>
            <option value="design">设计评审</option>
            <option value="development">开发协作</option>
            <option value="testing">测试验证</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >决策标记</label
          >
          <select
            v-model="decisionFilter"
            @change="filterSessions"
            class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">全部会话</option>
            <option value="hasDecisions">包含决策</option>
            <option value="critical">关键决策</option>
            <option value="pending">待定决策</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >排序方式</label
          >
          <select
            v-model="sortBy"
            @change="sortSessions"
            class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="time">时间顺序</option>
            <option value="importance">重要性</option>
            <option value="decisions">决策数量</option>
            <option value="duration">会话时长</option>
          </select>
        </div>
      </div>

      <!-- 会话配置面板 -->
      <div v-if="showSessionConfig" class="p-4 bg-gray-50 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-3">会话配置参数</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs text-gray-600 mb-1"
              >自动保存间隔 (分钟)</label
            >
            <input
              v-model="sessionConfig.autoSaveInterval"
              type="number"
              min="1"
              max="60"
              class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1"
              >决策点检测敏感度</label
            >
            <input
              v-model="sessionConfig.decisionSensitivity"
              type="range"
              min="0"
              max="100"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>低</span>
              <span>{{ sessionConfig.decisionSensitivity }}%</span>
              <span>高</span>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1"
              >会话保留期限 (天)</label
            >
            <select
              v-model="sessionConfig.retentionDays"
              class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="30">30天</option>
              <option value="90">90天</option>
              <option value="180">180天</option>
              <option value="365">1年</option>
              <option value="-1">永久保留</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- 会话列表 -->
      <div class="xl:col-span-1">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <MessageSquare class="w-5 h-5 mr-2 text-purple-600" />
              会话列表
              <span class="ml-2 text-sm text-gray-500"
                >({{ filteredSessions.length }})</span
              >
            </h2>
            <button
              @click="createNewSession"
              class="text-purple-600 hover:text-purple-800 text-sm flex items-center"
            >
              <Plus class="w-4 h-4 mr-1" />
              新建
            </button>
          </div>

          <!-- 会话项目 -->
          <div class="space-y-3 max-h-96 overflow-y-auto">
            <div
              v-for="session in filteredSessions"
              :key="session.id"
              class="p-3 border rounded-lg cursor-pointer transition-colors"
              :class="{
                'bg-blue-50 border-blue-200':
                  selectedSession?.id === session.id,
                'hover:bg-gray-50': selectedSession?.id !== session.id,
              }"
              @click="selectSession(session)"
            >
              <!-- 会话头部 -->
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <component
                    :is="getSessionIcon(session.type)"
                    class="w-4 h-4 text-blue-600"
                  />
                  <span class="font-medium text-sm text-gray-900">{{
                    session.title
                  }}</span>
                </div>
                <div class="flex items-center space-x-1">
                  <span
                    v-if="session.hasDecisions"
                    class="w-2 h-2 bg-red-500 rounded-full"
                    title="包含决策点"
                  />
                  <span
                    v-if="session.isActive"
                    class="w-2 h-2 bg-green-500 rounded-full"
                    title="活跃会话"
                  />
                </div>
              </div>

              <!-- 会话信息 -->
              <div class="text-xs text-gray-500 space-y-1">
                <div class="flex items-center justify-between">
                  <span>{{ session.startTime }}</span>
                  <span>{{ session.duration }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>{{ session.messageCount }} 条消息</span>
                  <span v-if="session.decisionCount > 0" class="text-red-600">
                    {{ session.decisionCount }} 个决策
                  </span>
                </div>
              </div>

              <!-- 会话摘要 -->
              <p class="text-xs text-gray-600 mt-2 line-clamp-2">
                {{ session.summary }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 会话详情和时间线 -->
      <div class="xl:col-span-2">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div v-if="selectedSession" class="">
            <!-- 会话头部信息 -->
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2
                  class="text-xl font-semibold text-gray-900 flex items-center"
                >
                  <component
                    :is="getSessionIcon(selectedSession.type)"
                    class="w-5 h-5 mr-2 text-blue-600"
                  />
                  {{ selectedSession.title }}
                </h2>
                <div
                  class="flex items-center space-x-4 text-sm text-gray-500 mt-1"
                >
                  <span>开始时间: {{ selectedSession.startTime }}</span>
                  <span>持续时间: {{ selectedSession.duration }}</span>
                  <span
                    >参与者: {{ selectedSession.participants.join(', ') }}</span
                  >
                </div>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="markDecisionPoint"
                  class="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 flex items-center"
                >
                  <Flag class="w-4 h-4 mr-1" />
                  标记决策
                </button>
                <button
                  @click="quickRevert"
                  class="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 flex items-center"
                >
                  <RotateCcw class="w-4 h-4 mr-1" />
                  快速回溯
                </button>
              </div>
            </div>

            <!-- 时间线视图 -->
            <div class="relative">
              <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

              <div class="space-y-6">
                <div
                  v-for="(event, index) in selectedSession.timeline"
                  :key="index"
                  class="relative flex items-start"
                >
                  <!-- 时间线节点 -->
                  <div
                    class="absolute left-2 w-4 h-4 rounded-full border-2 border-white z-10"
                    :class="getEventNodeClass(event.type)"
                  />

                  <!-- 事件内容 -->
                  <div class="ml-10 flex-1">
                    <div class="bg-gray-50 rounded-lg p-4">
                      <!-- 事件头部 -->
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-2">
                          <component
                            :is="getEventIcon(event.type)"
                            class="w-4 h-4 text-gray-600"
                          />
                          <span class="font-medium text-sm text-gray-900">{{
                            event.title
                          }}</span>
                          <span
                            v-if="event.isDecision"
                            class="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs"
                          >
                            决策点
                          </span>
                        </div>
                        <span class="text-xs text-gray-500">{{
                          event.timestamp
                        }}</span>
                      </div>

                      <!-- 事件内容 -->
                      <div class="text-sm text-gray-700 mb-3">
                        {{ event.content }}
                      </div>

                      <!-- 决策信息 -->
                      <div
                        v-if="event.decision"
                        class="bg-white border border-red-200 rounded p-3 mb-3"
                      >
                        <h4
                          class="text-sm font-medium text-red-800 mb-2 flex items-center"
                        >
                          <AlertTriangle class="w-4 h-4 mr-1" />
                          决策记录
                        </h4>
                        <div class="space-y-2 text-sm">
                          <div>
                            <span class="font-medium">决策内容:</span>
                            {{ event.decision.content }}
                          </div>
                          <div>
                            <span class="font-medium">决策者:</span>
                            {{ event.decision.maker }}
                          </div>
                          <div>
                            <span class="font-medium">影响范围:</span>
                            {{ event.decision.impact }}
                          </div>
                          <div v-if="event.decision.alternatives" class="">
                            <span class="font-medium">备选方案:</span>
                            <ul class="list-disc list-inside ml-4 mt-1">
                              <li
                                v-for="alt in event.decision.alternatives"
                                :key="alt"
                              >
                                {{ alt }}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <!-- 相关文件和链接 -->
                      <div
                        v-if="event.attachments && event.attachments.length > 0"
                        class="flex flex-wrap gap-2 mb-3"
                      >
                        <span
                          v-for="attachment in event.attachments"
                          :key="attachment.name"
                          class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                        >
                          <Paperclip class="w-3 h-3 mr-1" />
                          {{ attachment.name }}
                        </span>
                      </div>

                      <!-- 操作按钮 -->
                      <div class="flex items-center space-x-3 text-xs">
                        <button
                          @click="revertToPoint(event.id)"
                          class="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <RotateCcw class="w-3 h-3 mr-1" />
                          回溯到此点
                        </button>
                        <button
                          @click="copyEventContent(event)"
                          class="text-gray-600 hover:text-gray-800 flex items-center"
                        >
                          <Copy class="w-3 h-3 mr-1" />
                          复制内容
                        </button>
                        <button
                          v-if="!event.isDecision"
                          @click="markAsDecision(event.id)"
                          class="text-red-600 hover:text-red-800 flex items-center"
                        >
                          <Flag class="w-3 h-3 mr-1" />
                          标记为决策
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="text-center py-12">
            <MessageSquare class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">选择一个会话</h3>
            <p class="text-gray-500">
              从左侧列表中选择一个会话来查看详细的时间线和决策记录
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  Clock,
  Settings,
  Download,
  MessageSquare,
  Plus,
  Flag,
  RotateCcw,
  AlertTriangle,
  Paperclip,
  Copy,
  FileText,
  Code,
  TestTube,
  Layers,
  BookOpen,
} from 'lucide-vue-next'

// 响应式数据
const showSessionConfig = ref(false)
const timeRange = ref('week')
const sessionType = ref('')
const decisionFilter = ref('')
const sortBy = ref('time')
const selectedSession = ref(null)

// 会话配置
const sessionConfig = reactive({
  autoSaveInterval: 5,
  decisionSensitivity: 70,
  retentionDays: 90,
})

// 会话数据
const allSessions = reactive([
  {
    id: 1,
    title: 'MCP协议集成方案讨论',
    type: 'design',
    startTime: '2024-01-20 09:00',
    duration: '2小时15分',
    messageCount: 45,
    decisionCount: 3,
    hasDecisions: true,
    isActive: false,
    summary: '讨论了MCP协议在TraeIDE中的集成方案，确定了客户端-服务端架构',
    participants: ['产品经理', '技术架构师', '前端开发'],
    timeline: [
      {
        id: 1,
        type: 'message',
        title: '会话开始',
        content: '开始讨论MCP协议集成方案，参与者包括产品、架构和前端团队',
        timestamp: '09:00',
        isDecision: false,
      },
      {
        id: 2,
        type: 'decision',
        title: '架构方案确定',
        content: '经过讨论，确定采用客户端-服务端分离的架构模式',
        timestamp: '09:45',
        isDecision: true,
        decision: {
          content: '采用客户端-服务端分离架构，TraeIDE作为MCP客户端',
          maker: '技术架构师',
          impact: '影响整体技术架构设计',
          alternatives: ['单体架构', '微服务架构', '插件架构'],
        },
        attachments: [
          { name: 'MCP架构图.png', type: 'image' },
          { name: '技术方案.md', type: 'document' },
        ],
      },
      {
        id: 3,
        type: 'message',
        title: '接口设计讨论',
        content: '讨论了MCP协议的具体接口设计和数据格式',
        timestamp: '10:30',
        isDecision: false,
      },
      {
        id: 4,
        type: 'decision',
        title: '数据格式标准化',
        content: '确定使用JSON-RPC 2.0作为通信协议',
        timestamp: '11:00',
        isDecision: true,
        decision: {
          content: '统一使用JSON-RPC 2.0协议进行客户端和服务端通信',
          maker: '技术架构师',
          impact: '影响所有接口设计和实现',
          alternatives: ['REST API', 'GraphQL', 'gRPC'],
        },
      },
    ],
  },
  {
    id: 2,
    title: '需求评估算法优化',
    type: 'requirement',
    startTime: '2024-01-19 14:00',
    duration: '1小时30分',
    messageCount: 28,
    decisionCount: 2,
    hasDecisions: true,
    isActive: false,
    summary: '优化需求与核心目标的关联度评估算法，提高评估准确性',
    participants: ['产品经理', '算法工程师'],
    timeline: [
      {
        id: 1,
        type: 'message',
        title: '算法现状分析',
        content: '分析当前需求评估算法的准确率和性能表现',
        timestamp: '14:00',
        isDecision: false,
      },
      {
        id: 2,
        type: 'decision',
        title: '算法优化方向',
        content: '决定引入机器学习模型提高评估准确性',
        timestamp: '14:45',
        isDecision: true,
        decision: {
          content: '采用基于历史数据的机器学习模型进行需求关联度评估',
          maker: '算法工程师',
          impact: '提高需求评估准确率至85%以上',
          alternatives: ['规则引擎', '专家系统', '深度学习'],
        },
      },
    ],
  },
  {
    id: 3,
    title: 'UI组件设计评审',
    type: 'design',
    startTime: '2024-01-18 16:00',
    duration: '45分钟',
    messageCount: 15,
    decisionCount: 1,
    hasDecisions: true,
    isActive: false,
    summary: '评审主要UI组件的设计方案，确定视觉风格和交互模式',
    participants: ['UI设计师', '前端开发', '产品经理'],
    timeline: [
      {
        id: 1,
        type: 'message',
        title: '设计方案展示',
        content: 'UI设计师展示了主要页面的设计方案和组件库',
        timestamp: '16:00',
        isDecision: false,
      },
      {
        id: 2,
        type: 'decision',
        title: '设计风格确定',
        content: '确定采用现代简约风格，使用蓝色作为主色调',
        timestamp: '16:30',
        isDecision: true,
        decision: {
          content: '采用现代简约设计风格，主色调为蓝色系',
          maker: 'UI设计师',
          impact: '影响所有页面和组件的视觉设计',
          alternatives: ['扁平化设计', '拟物化设计', '新拟态设计'],
        },
      },
    ],
  },
])

const filteredSessions = ref([...allSessions])

// 方法
const filterSessions = () => {
  let filtered = [...allSessions]

  // 按时间范围过滤
  if (timeRange.value !== 'all') {
    // 这里可以实现具体的时间过滤逻辑
  }

  // 按会话类型过滤
  if (sessionType.value) {
    filtered = filtered.filter(session => session.type === sessionType.value)
  }

  // 按决策标记过滤
  if (decisionFilter.value === 'hasDecisions') {
    filtered = filtered.filter(session => session.hasDecisions)
  } else if (decisionFilter.value === 'critical') {
    filtered = filtered.filter(session => session.decisionCount >= 3)
  }

  filteredSessions.value = filtered
}

const sortSessions = () => {
  filteredSessions.value.sort((a, b) => {
    switch (sortBy.value) {
      case 'importance':
        return b.decisionCount - a.decisionCount
      case 'decisions':
        return b.decisionCount - a.decisionCount
      case 'duration':
        return b.messageCount - a.messageCount
      default:
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    }
  })
}

const selectSession = session => {
  selectedSession.value = session
}

const createNewSession = () => {
  console.log('创建新会话')
  // 实现新建会话逻辑
}

const markDecisionPoint = () => {
  console.log('标记决策点')
  // 实现决策点标记逻辑
}

const quickRevert = () => {
  console.log('快速回溯')
  // 实现快速回溯逻辑
}

const revertToPoint = (eventId: number) => {
  console.log('回溯到事件点:', eventId)
  // 实现回溯到特定事件点的逻辑
}

const copyEventContent = (_event: any) => {
  navigator.clipboard.writeText(_event.content)
  console.log('已复制事件内容')
}

const markAsDecision = (eventId: number) => {
  console.log('标记为决策点:', eventId)
  // 实现标记为决策点的逻辑
}

const exportSessions = () => {
  console.log('导出会话数据')
  // 实现会话数据导出逻辑
}

// 工具函数
const getSessionIcon = (type: string) => {
  switch (type) {
    case 'requirement':
      return BookOpen
    case 'design':
      return Layers
    case 'development':
      return Code
    case 'testing':
      return TestTube
    default:
      return MessageSquare
  }
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'decision':
      return Flag
    case 'message':
      return MessageSquare
    case 'file':
      return FileText
    default:
      return MessageSquare
  }
}

const getEventNodeClass = (type: string) => {
  switch (type) {
    case 'decision':
      return 'bg-red-500'
    case 'message':
      return 'bg-blue-500'
    case 'file':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
