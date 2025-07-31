<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ pageTexts.title }}</h1>
      <p class="text-gray-600">{{ pageTexts.subtitle }}</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 项目概览模块 -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <BarChart3 class="w-5 h-5 mr-2 text-blue-600" />
              {{ pageTexts.sections.projectOverview.title }}
            </h2>
            <button
              @click="showProjectConfig = !showProjectConfig"
              class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Settings class="w-4 h-4 mr-1" />
              {{ pageTexts.sections.projectOverview.configButton }}
            </button>
          </div>

          <!-- 项目基本信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-2">项目信息</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">项目名称:</span>
                  <span class="font-medium">{{ projectInfo.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">创建时间:</span>
                  <span class="font-medium">{{ projectInfo.createTime }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">最后更新:</span>
                  <span class="font-medium">{{ projectInfo.lastUpdate }}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-2">开发状态</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">当前阶段:</span>
                  <span
                    class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {{ projectInfo.currentPhase }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">活跃开发者:</span>
                  <span class="font-medium">{{
                    projectInfo.activeDevelopers
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 核心需求完成度 -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-3">
              核心需求完成度
            </h3>
            <div class="space-y-3">
              <div
                v-for="requirement in coreRequirements"
                :key="requirement.id"
                class="flex items-center"
              >
                <div class="flex-1">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-medium text-gray-700">{{
                      requirement.name
                    }}</span>
                    <span class="text-sm text-gray-500"
                      >{{ requirement.progress }}%</span
                    >
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="h-2 rounded-full transition-all duration-300"
                      :class="getProgressColor(requirement.progress)"
                      :style="{ width: requirement.progress + '%' }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 参数配置面板 -->
          <div v-if="showProjectConfig" class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-3">项目配置参数</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-600 mb-1"
                  >快照频率 (分钟)</label
                >
                <input
                  v-model="config.snapshotFrequency"
                  type="number"
                  min="1"
                  max="60"
                  class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1"
                  >状态刷新间隔 (秒)</label
                >
                <input
                  v-model="config.refreshInterval"
                  type="number"
                  min="5"
                  max="300"
                  class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 偏离预警模块 -->
      <div>
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <AlertTriangle class="w-5 h-5 mr-2 text-orange-600" />
              偏离预警
            </h2>
            <button
              @click="showAlertConfig = !showAlertConfig"
              class="text-sm text-orange-600 hover:text-orange-800 flex items-center"
            >
              <Settings class="w-4 h-4 mr-1" />
              阈值设置
            </button>
          </div>

          <!-- 预警状态 -->
          <div class="space-y-4">
            <div
              v-for="alert in alerts"
              :key="alert.id"
              class="p-4 rounded-lg border-l-4"
              :class="getAlertStyle(alert.level)"
            >
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium" :class="getAlertTextColor(alert.level)">
                  {{ alert.title }}
                </h3>
                <span class="text-xs text-gray-500">{{ alert.time }}</span>
              </div>
              <p class="text-sm text-gray-600 mb-2">{{ alert.description }}</p>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500"
                  >关联度: {{ alert.correlation }}%</span
                >
                <button class="text-xs text-blue-600 hover:text-blue-800">
                  查看详情
                </button>
              </div>
            </div>
          </div>

          <!-- 预警阈值配置 -->
          <div v-if="showAlertConfig" class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-3">预警阈值配置</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-gray-600 mb-1"
                  >关联度预警阈值 (%)</label
                >
                <input
                  v-model="alertConfig.correlationThreshold"
                  type="range"
                  min="0"
                  max="100"
                  class="w-full"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>{{ alertConfig.correlationThreshold }}%</span>
                  <span>100%</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1"
                  >检测敏感度</label
                >
                <select
                  v-model="alertConfig.sensitivity"
                  class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option 
                    v-for="option in sensitivityOptions" 
                    :key="option.value" 
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 上下文状态模块 -->
    <div class="mt-6">
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center">
            <Database class="w-5 h-5 mr-2 text-green-600" />
            上下文状态
          </h2>
          <button
            @click="showContextConfig = !showContextConfig"
            class="text-sm text-green-600 hover:text-green-800 flex items-center"
          >
            <Settings class="w-4 h-4 mr-1" />
            状态配置
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 最近快照信息 -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-3">最近快照</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">创建时间:</span>
                <span class="font-medium">{{
                  contextStatus.lastSnapshot.time
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">文件数量:</span>
                <span class="font-medium">{{
                  contextStatus.lastSnapshot.fileCount
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">代码行数:</span>
                <span class="font-medium">{{
                  contextStatus.lastSnapshot.lineCount
                }}</span>
              </div>
            </div>
          </div>

          <!-- 上下文完整性 -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-3">完整性状态</h3>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">核心约束:</span>
                <span class="flex items-center">
                  <CheckCircle class="w-4 h-4 text-green-500 mr-1" />
                  <span class="text-green-600 font-medium">完整</span>
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">依赖关系:</span>
                <span class="flex items-center">
                  <AlertCircle class="w-4 h-4 text-yellow-500 mr-1" />
                  <span class="text-yellow-600 font-medium">部分缺失</span>
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">变量定义:</span>
                <span class="flex items-center">
                  <CheckCircle class="w-4 h-4 text-green-500 mr-1" />
                  <span class="text-green-600 font-medium">完整</span>
                </span>
              </div>
            </div>
          </div>

          <!-- 恢复建议 -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-3">恢复建议</h3>
            <div class="space-y-2">
              <div class="p-2 bg-blue-50 rounded text-sm">
                <p class="text-blue-800 font-medium">建议操作:</p>
                <p class="text-blue-600">更新依赖关系映射</p>
              </div>
              <button
                class="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                执行快速恢复
              </button>
            </div>
          </div>
        </div>

        <!-- 状态配置面板 -->
        <div v-if="showContextConfig" class="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 class="text-sm font-medium text-gray-700 mb-3">状态配置参数</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1"
                >完整性检查频率 (分钟)</label
              >
              <input
                v-model="contextConfig.checkFrequency"
                type="number"
                min="1"
                max="60"
                class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">自动恢复</label>
              <select
                v-model="contextConfig.autoRecover"
                class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="enabled">启用</option>
                <option value="disabled">禁用</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1"
                >快照保留天数</label
              >
              <input
                v-model="contextConfig.retentionDays"
                type="number"
                min="1"
                max="365"
                class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
              />
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
  BarChart3,
  AlertTriangle,
  Database,
  Settings,
  CheckCircle,
  AlertCircle,
} from 'lucide-vue-next'
import {
  getDefaultProjectInfo,
  getDefaultCoreRequirements,
  getDefaultAlerts,
  getDefaultContextStatus,
  getDefaultConfig,
  getDefaultAlertConfig,
  getDefaultContextConfig,
  getSensitivityOptions,
  pageTexts,
  getProgressColor,
  getAlertStyle,
  getAlertTextColor
} from '@/config/dashboard.config'

// 响应式数据
const showProjectConfig = ref(false)
const showAlertConfig = ref(false)
const showContextConfig = ref(false)

// 配置选项
const sensitivityOptions = getSensitivityOptions()

// 项目信息
const projectInfo = reactive(getDefaultProjectInfo())

// 核心需求完成度
const coreRequirements = reactive(getDefaultCoreRequirements())

// 预警信息
const alerts = reactive(getDefaultAlerts())

// 上下文状态
const contextStatus = reactive(getDefaultContextStatus())

// 配置参数
const config = reactive(getDefaultConfig())

const alertConfig = reactive(getDefaultAlertConfig())

const contextConfig = reactive(getDefaultContextConfig())

// 工具函数已从配置文件导入
</script>
