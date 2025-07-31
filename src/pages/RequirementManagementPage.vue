<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 页面标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">{{ pageTexts.title }}</h1>
        <p class="mt-2 text-gray-600">{{ pageTexts.subtitle }}</p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- 核心需求定义模块 -->
        <div class="xl:col-span-2">
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target class="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 class="text-xl font-semibold text-gray-900">{{ pageTexts.sections.coreRequirements.title }}</h2>
                  <p class="text-sm text-gray-500">定义和管理核心功能需求</p>
                </div>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="addRequirement"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus class="w-4 h-4" />
                  <span>{{ pageTexts.sections.coreRequirements.addButton }}</span>
                </button>
                <button
                  @click="showRequirementConfig = true"
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <Settings class="w-4 h-4" />
                  <span>{{ pageTexts.sections.coreRequirements.configButton }}</span>
                </button>
              </div>
            </div>

            <!-- 需求列表 -->
            <div class="space-y-4">
              <div
                v-for="requirement in coreRequirements"
                :key="requirement.id"
                :class="[
                  'border rounded-lg p-4 transition-all duration-200',
                  getRequirementBorderStyle(requirement.priority)
                ]"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                      <button
                        @click="toggleRequirement(requirement.id)"
                        class="text-gray-400 hover:text-gray-600"
                      >
                        <ChevronRight
                          :class="[
                            'w-4 h-4 transition-transform',
                            requirement.expanded ? 'rotate-90' : ''
                          ]"
                        />
                      </button>
                      <h3 class="font-medium text-gray-900">{{ requirement.title }}</h3>
                      <span
                        :class="[
                          'px-2 py-1 text-xs rounded-full',
                          getPriorityStyle(requirement.priority)
                        ]"
                      >
                        {{ getPriorityText(requirement.priority) }}
                      </span>
                    </div>
                    <p class="text-gray-600 text-sm mb-3">{{ requirement.description }}</p>
                    <div class="flex items-center space-x-4">
                      <div class="flex items-center space-x-2">
                        <span class="text-xs text-gray-500">关联度:</span>
                        <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            :class="[
                              'h-full transition-all duration-300',
                              getCorrelationColor(requirement.correlation)
                            ]"
                            :style="{ width: requirement.correlation + '%' }"
                          ></div>
                        </div>
                        <span class="text-xs font-medium text-gray-700">{{ requirement.correlation }}%</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex space-x-2 ml-4">
                    <button
                      @click="editRequirement(requirement.id)"
                      class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteRequirement(requirement.id)"
                      class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- 子需求展开内容 -->
                <div v-if="requirement.expanded && requirement.children?.length" class="mt-4 pl-6 border-l-2 border-gray-200">
                  <div v-for="child in requirement.children" :key="child.id" class="mb-3 last:mb-0">
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 class="font-medium text-gray-800 text-sm">{{ child.title }}</h4>
                        <p class="text-gray-600 text-xs mt-1">{{ child.description }}</p>
                      </div>
                      <div class="flex items-center space-x-2">
                        <span class="text-xs text-gray-500">{{ child.correlation }}%</span>
                        <div class="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            :class="[
                              'h-full',
                              getCorrelationColor(child.correlation)
                            ]"
                            :style="{ width: child.correlation + '%' }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧面板 -->
        <div class="space-y-6">
          <!-- 新需求评估 -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <div class="flex items-center space-x-3 mb-6">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Lightbulb class="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-gray-900">{{ pageTexts.sections.newRequirementEvaluation.title }}</h2>
                <p class="text-sm text-gray-500">{{ pageTexts.sections.newRequirementEvaluation.intelligentAnalysis }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">需求描述</label>
                <textarea
                  v-model="newRequirement.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请描述新需求的具体内容和目标..."
                ></textarea>
              </div>

              <button
                @click="evaluateRequirement"
                :disabled="!newRequirement.description.trim()"
                class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Zap class="w-4 h-4" />
                <span>智能评估</span>
              </button>

              <!-- 评估结果 -->
              <div v-if="evaluationResult" class="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-3">评估结果</h4>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">综合评分:</span>
                    <span :class="['font-medium', getScoreColor(evaluationResult.score)]">
                      {{ evaluationResult.score }}/100
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">业务价值:</span>
                    <span :class="['font-medium', getScoreColor(evaluationResult.businessValue)]">
                      {{ evaluationResult.businessValue }}/100
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">可行性:</span>
                    <span :class="['font-medium', getScoreColor(evaluationResult.feasibility)]">
                      {{ evaluationResult.feasibility }}/100
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">推荐优先级:</span>
                    <span :class="[
                      'px-2 py-1 text-xs rounded-full',
                      getPriorityRecommendationStyle(evaluationResult.recommendedPriority)
                    ]">
                      {{ evaluationResult.recommendedPriority }}
                    </span>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-gray-200">
                  <p class="text-sm text-gray-600">{{ evaluationResult.recommendation }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 需求冲突检测 -->
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle class="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">{{ pageTexts.sections.conflictDetection.title }}</h2>
                  <p class="text-sm text-gray-500">{{ pageTexts.sections.conflictDetection.subtitle }}</p>
                </div>
              </div>
              <button
                @click="showConflictConfig = true"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings class="w-4 h-4" />
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="conflict in conflicts"
                :key="conflict.id"
                class="p-4 border border-red-200 bg-red-50 rounded-lg"
              >
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-medium text-red-900">{{ conflict.title }}</h4>
                  <span class="px-2 py-1 text-xs bg-red-200 text-red-800 rounded-full">
                    {{ conflict.severity }}
                  </span>
                </div>
                <p class="text-sm text-red-700 mb-2">{{ conflict.description }}</p>
                <div class="text-xs text-red-600">
                  <span class="font-medium">冲突对象:</span> {{ conflict.conflictWith }}
                </div>
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
  Target,
  Plus,
  Settings,
  ChevronRight,
  Edit,
  Trash2,
  Lightbulb,
  Zap,
  AlertTriangle
} from 'lucide-vue-next'

import {
  pageTexts,
  priorityStrategyOptions,
  sensitivityOptions,
  resolutionStrategyOptions,
  getDefaultCoreRequirements,
  getDefaultConflicts,
  getDefaultRequirementConfig,
  getDefaultEvaluationConfig,
  getDefaultConflictConfig,
  getDefaultNewRequirement,
  getRequirementBorderStyle,
  getPriorityStyle,
  getPriorityText,
  getCorrelationColor,
  getScoreColor,
  getPriorityRecommendationStyle
} from '@/config/requirement.config'

// 响应式数据
const showRequirementConfig = ref(false)
const showEvaluationConfig = ref(false)
const showConflictConfig = ref(false)

// 核心需求数据
const coreRequirements = reactive(getDefaultCoreRequirements())

// 新需求评估
const newRequirement = reactive(getDefaultNewRequirement())
const evaluationResult = ref(null as any)

// 冲突检测数据
const conflicts = reactive(getDefaultConflicts())

// 配置参数
const requirementConfig = reactive(getDefaultRequirementConfig())
const evaluationConfig = reactive(getDefaultEvaluationConfig())
const conflictConfig = reactive(getDefaultConflictConfig())

// 方法
const addRequirement = () => {
  const newReq = {
    id: coreRequirements.length + 1,
    title: '新需求',
    description: '请编辑需求描述',
    priority: 'low',
    correlation: 50,
    expanded: false,
    children: [],
  }
  coreRequirements.push(newReq)
}

const toggleRequirement = (id: number) => {
  const req = coreRequirements.find(r => r.id === id)
  if (req) {
    req.expanded = !req.expanded
  }
}

const editRequirement = (id: number) => {
  console.log('编辑需求:', id)
  // 实现编辑功能
}

const deleteRequirement = (id: number) => {
  const index = coreRequirements.findIndex(r => r.id === id)
  if (index > -1) {
    coreRequirements.splice(index, 1)
  }
}

const evaluateRequirement = () => {
  if (!newRequirement.description.trim()) return

  // 模拟评估结果
  evaluationResult.value = {
    score: Math.floor(Math.random() * 40) + 60, // 60-100
    businessValue: Math.floor(Math.random() * 30) + 70,
    feasibility: Math.floor(Math.random() * 25) + 75,
    cost: Math.floor(Math.random() * 40) + 30,
    risk: Math.floor(Math.random() * 30) + 20,
    recommendedPriority: '中等',
    recommendation:
      '该需求与核心目标关联度较高，建议纳入开发计划，但需要进一步细化技术方案。',
  }
}
</script>