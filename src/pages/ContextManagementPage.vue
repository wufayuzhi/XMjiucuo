<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">上下文管理</h1>
      <p class="text-gray-600">快照创建与恢复、上下文压缩配置、历史回顾</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- 快照管理模块 -->
      <div class="xl:col-span-2">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <Camera class="w-5 h-5 mr-2 text-blue-600" />
              快照管理
            </h2>
            <div class="flex space-x-2">
              <button
                @click="createSnapshot"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center"
              >
                <Plus class="w-4 h-4 mr-1" />
                创建快照
              </button>
              <button
                @click="showSnapshotConfig = !showSnapshotConfig"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm flex items-center"
              >
                <Settings class="w-4 h-4 mr-1" />
                配置
              </button>
            </div>
          </div>

          <!-- 快照配置面板 -->
          <div v-if="showSnapshotConfig" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-3">快照配置参数</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs text-gray-600 mb-1"
                  >自动快照频率 (分钟)</label
                >
                <input
                  v-model="snapshotConfig.frequency"
                  type="number"
                  min="1"
                  max="120"
                  class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">保存策略</label>
                <select
                  v-model="snapshotConfig.strategy"
                  class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="all">保存所有</option>
                  <option value="important">仅重要节点</option>
                  <option value="manual">仅手动创建</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1"
                  >最大保留数量</label
                >
                <input
                  v-model="snapshotConfig.maxCount"
                  type="number"
                  min="5"
                  max="100"
                  class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          <!-- 时间线式快照列表 -->
          <div class="space-y-4">
            <div
              v-for="snapshot in snapshots"
              :key="snapshot.id"
              class="relative"
            >
              <!-- 时间线连接线 -->
              <div
                v-if="snapshot.id !== snapshots[snapshots.length - 1].id"
                class="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"
              />

              <div class="flex items-start space-x-4">
                <!-- 时间线节点 -->
                <div
                  class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                  :class="getSnapshotNodeStyle(snapshot.type)"
                >
                  <component
                    :is="getSnapshotIcon(snapshot.type)"
                    class="w-5 h-5"
                  />
                </div>

                <!-- 快照内容 -->
                <div class="flex-1 bg-gray-50 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-medium text-gray-900">
                      {{ snapshot.title }}
                    </h3>
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-500">{{
                        snapshot.time
                      }}</span>
                      <button
                        @click="restoreSnapshot(snapshot.id)"
                        class="text-xs text-blue-600 hover:text-blue-800"
                      >
                        恢复
                      </button>
                      <button
                        @click="deleteSnapshot(snapshot.id)"
                        class="text-xs text-red-600 hover:text-red-800"
                      >
                        删除
                      </button>
                    </div>
                  </div>

                  <p class="text-sm text-gray-600 mb-3">
                    {{ snapshot.description }}
                  </p>

                  <!-- 快照统计信息 -->
                  <div class="grid grid-cols-3 gap-4 text-xs">
                    <div class="text-center p-2 bg-white rounded">
                      <div class="font-medium text-gray-900">
                        {{ snapshot.stats.files }}
                      </div>
                      <div class="text-gray-500">文件数</div>
                    </div>
                    <div class="text-center p-2 bg-white rounded">
                      <div class="font-medium text-gray-900">
                        {{ snapshot.stats.lines }}
                      </div>
                      <div class="text-gray-500">代码行</div>
                    </div>
                    <div class="text-center p-2 bg-white rounded">
                      <div class="font-medium text-gray-900">
                        {{ snapshot.stats.size }}
                      </div>
                      <div class="text-gray-500">大小</div>
                    </div>
                  </div>

                  <!-- 缩略图预览 -->
                  <div v-if="snapshot.preview" class="mt-3">
                    <button
                      @click="showPreview(snapshot.id)"
                      class="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Eye class="w-3 h-3 mr-1" />
                      查看预览
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 上下文压缩模块 -->
      <div>
        <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <Layers class="w-5 h-5 mr-2 text-green-600" />
              上下文压缩
            </h2>
            <button
              @click="showCompressionConfig = !showCompressionConfig"
              class="text-sm text-green-600 hover:text-green-800 flex items-center"
            >
              <Settings class="w-4 h-4 mr-1" />
              配置
            </button>
          </div>

          <!-- 金字塔式信息分层展示 -->
          <div class="space-y-4">
            <!-- 第一层：核心需求 (300字) -->
            <div class="border-l-4 border-red-400 pl-4">
              <h3 class="text-sm font-medium text-red-800 mb-2">
                核心需求与约束 (300字)
              </h3>
              <div class="text-sm text-gray-700 bg-red-50 p-3 rounded">
                {{ compressionData.coreRequirements }}
              </div>
            </div>

            <!-- 第二层：功能模块关联图 -->
            <div class="border-l-4 border-yellow-400 pl-4">
              <h3 class="text-sm font-medium text-yellow-800 mb-2">
                功能模块关联图
              </h3>
              <div class="bg-yellow-50 p-3 rounded">
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div
                    v-for="module in compressionData.modules"
                    :key="module.id"
                    class="p-2 bg-white rounded border text-center"
                  >
                    {{ module.name }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 第三层：完整细节 -->
            <div class="border-l-4 border-green-400 pl-4">
              <h3 class="text-sm font-medium text-green-800 mb-2">完整细节</h3>
              <div
                class="text-sm text-gray-700 bg-green-50 p-3 rounded max-h-32 overflow-y-auto"
              >
                {{ compressionData.fullDetails }}
              </div>
            </div>
          </div>

          <!-- 压缩配置面板 -->
          <div
            v-if="showCompressionConfig"
            class="mt-6 p-4 bg-gray-50 rounded-lg"
          >
            <h4 class="text-sm font-medium text-gray-700 mb-3">压缩配置参数</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-gray-600 mb-1"
                  >摘要字数限制</label
                >
                <input
                  v-model="compressionConfig.summaryLength"
                  type="range"
                  min="100"
                  max="500"
                  class="w-full"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100字</span>
                  <span>{{ compressionConfig.summaryLength }}字</span>
                  <span>500字</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">分层深度</label>
                <select
                  v-model="compressionConfig.layerDepth"
                  class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="2">2层</option>
                  <option value="3">3层</option>
                  <option value="4">4层</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">压缩比例</label>
                <input
                  v-model="compressionConfig.ratio"
                  type="range"
                  min="10"
                  max="90"
                  class="w-full"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10%</span>
                  <span>{{ compressionConfig.ratio }}%</span>
                  <span>90%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 快速回顾模块 -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <Clock class="w-5 h-5 mr-2 text-purple-600" />
              快速回顾
            </h2>
            <button
              @click="showReviewConfig = !showReviewConfig"
              class="text-sm text-purple-600 hover:text-purple-800 flex items-center"
            >
              <Settings class="w-4 h-4 mr-1" />
              配置
            </button>
          </div>

          <!-- 最近快照摘要 -->
          <div class="space-y-4">
            <div class="p-4 bg-purple-50 rounded-lg">
              <h3 class="text-sm font-medium text-purple-800 mb-2">
                最近快照摘要
              </h3>
              <p class="text-sm text-purple-700">
                {{ reviewData.lastSnapshotSummary }}
              </p>
            </div>

            <!-- 核心约束 -->
            <div class="p-4 bg-blue-50 rounded-lg">
              <h3 class="text-sm font-medium text-blue-800 mb-2">核心约束</h3>
              <ul class="text-sm text-blue-700 space-y-1">
                <li
                  v-for="constraint in reviewData.coreConstraints"
                  :key="constraint"
                  class="flex items-center"
                >
                  <CheckCircle class="w-3 h-3 mr-2 text-blue-600" />
                  {{ constraint }}
                </li>
              </ul>
            </div>

            <!-- 未完成任务 -->
            <div class="p-4 bg-orange-50 rounded-lg">
              <h3 class="text-sm font-medium text-orange-800 mb-2">
                未完成任务
              </h3>
              <ul class="text-sm text-orange-700 space-y-1">
                <li
                  v-for="task in reviewData.pendingTasks"
                  :key="task"
                  class="flex items-center"
                >
                  <AlertCircle class="w-3 h-3 mr-2 text-orange-600" />
                  {{ task }}
                </li>
              </ul>
            </div>
          </div>

          <!-- 回顾配置面板 -->
          <div v-if="showReviewConfig" class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-3">回顾配置参数</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-gray-600 mb-1"
                  >回顾内容类型</label
                >
                <div class="space-y-1">
                  <label class="flex items-center text-xs">
                    <input
                      v-model="reviewConfig.includeConstraints"
                      type="checkbox"
                      class="mr-2"
                    />
                    包含核心约束
                  </label>
                  <label class="flex items-center text-xs">
                    <input
                      v-model="reviewConfig.includeTasks"
                      type="checkbox"
                      class="mr-2"
                    />
                    包含未完成任务
                  </label>
                  <label class="flex items-center text-xs">
                    <input
                      v-model="reviewConfig.includeChanges"
                      type="checkbox"
                      class="mr-2"
                    />
                    包含最近变更
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">展示方式</label>
                <select
                  v-model="reviewConfig.displayMode"
                  class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="summary">摘要模式</option>
                  <option value="detailed">详细模式</option>
                  <option value="timeline">时间线模式</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  Camera,
  Plus,
  Settings,
  Layers,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  GitBranch,
  Save,
  Zap,
} from 'lucide-vue-next'

// 响应式数据
const showSnapshotConfig = ref(false)
const showCompressionConfig = ref(false)
const showReviewConfig = ref(false)

// 快照数据
const snapshots = reactive([
  {
    id: 1,
    type: 'auto',
    title: '自动快照 - 功能完成',
    description: '完成了上下文管理模块的核心功能实现',
    time: '2024-01-20 14:30',
    stats: { files: 15, lines: 1250, size: '45KB' },
    preview: true,
  },
  {
    id: 2,
    type: 'manual',
    title: '手动快照 - 重要节点',
    description: '项目架构调整完成，准备进入下一阶段开发',
    time: '2024-01-20 10:15',
    stats: { files: 12, lines: 980, size: '38KB' },
    preview: true,
  },
  {
    id: 3,
    type: 'milestone',
    title: '里程碑快照 - 需求确认',
    description: '核心需求确认完成，开始技术方案设计',
    time: '2024-01-19 16:45',
    stats: { files: 8, lines: 650, size: '25KB' },
    preview: true,
  },
])

// 压缩数据
const compressionData = reactive({
  coreRequirements:
    'TraeIDE项目偏离预防MCP产品旨在通过智能上下文管理、历史追踪和需求校验，确保开发过程与核心目标一致。核心约束包括：1) 支持MCP协议双向通信；2) 实现金字塔式信息分层；3) 提供实时偏离预警；4) 集成Claude-4-Sonnet增强能力；5) 所有功能在TraeIDE内展示和配置。',
  modules: [
    { id: 1, name: '项目仪表板' },
    { id: 2, name: '上下文管理' },
    { id: 3, name: '需求管理' },
    { id: 4, name: '历史文档' },
    { id: 5, name: '会话回溯' },
    { id: 6, name: 'Claude集成' },
  ],
  fullDetails:
    '详细技术实现包括Vue 3 + TypeScript前端架构，MCP协议服务器实现，SQLite本地数据存储，实时WebSocket通信，智能检索算法，上下文压缩算法，需求关联度评估算法，历史会话分析算法等。性能要求：接口响应时间<1秒，内存占用<200MB，支持并发用户≥10人。安全要求：本地数据加密，API密钥管理，权限控制等。',
})

// 回顾数据
const reviewData = reactive({
  lastSnapshotSummary:
    '最近快照包含15个文件，1250行代码，主要完成了上下文管理模块的快照创建、压缩算法和回顾功能。当前进度：核心功能已实现75%，UI界面完成60%，测试覆盖率40%。',
  coreConstraints: [
    'MCP协议双向通信支持',
    '金字塔式信息分层架构',
    '60%关联度预警阈值',
    'TraeIDE内嵌式界面设计',
    '实时参数调整能力',
  ],
  pendingTasks: [
    '完成需求管理页面开发',
    '实现Claude-4-Sonnet集成',
    '添加历史文档检索功能',
    '优化上下文压缩算法',
    '完善单元测试覆盖',
  ],
})

// 配置参数
const snapshotConfig = reactive({
  frequency: 15,
  strategy: 'important',
  maxCount: 50,
})

const compressionConfig = reactive({
  summaryLength: 300,
  layerDepth: '3',
  ratio: 70,
})

const reviewConfig = reactive({
  includeConstraints: true,
  includeTasks: true,
  includeChanges: true,
  displayMode: 'summary',
})

// 方法
const createSnapshot = () => {
  const newSnapshot = {
    id: snapshots.length + 1,
    type: 'manual',
    title: `手动快照 - ${new Date().toLocaleString()}`,
    description: '用户手动创建的快照',
    time: new Date().toLocaleString(),
    stats: { files: 16, lines: 1300, size: '48KB' },
    preview: true,
  }
  snapshots.unshift(newSnapshot)
}

const restoreSnapshot = (id: number) => {
  console.log('恢复快照:', id)
  // 实现快照恢复逻辑
}

const deleteSnapshot = (id: number) => {
  const index = snapshots.findIndex(s => s.id === id)
  if (index > -1) {
    snapshots.splice(index, 1)
  }
}

const showPreview = (id: number) => {
  console.log('显示预览:', id)
  // 实现预览功能
}

const getSnapshotNodeStyle = (type: string) => {
  switch (type) {
    case 'auto':
      return 'bg-blue-100 text-blue-600'
    case 'manual':
      return 'bg-green-100 text-green-600'
    case 'milestone':
      return 'bg-purple-100 text-purple-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const getSnapshotIcon = (type: string) => {
  switch (type) {
    case 'auto':
      return Zap
    case 'manual':
      return Save
    case 'milestone':
      return GitBranch
    default:
      return Camera
  }
}
</script>
