<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">历史文档中心</h1>
      <p class="text-gray-600">文档分类浏览、智能检索、文档关联展示</p>
    </div>

    <!-- 搜索和过滤区域 -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold text-gray-900 flex items-center">
          <Search class="w-5 h-5 mr-2 text-blue-600" />
          智能检索
        </h2>
        <button
          @click="showSearchConfig = !showSearchConfig"
          class="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <Settings class="w-4 h-4 mr-1" />
          检索配置
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="relative mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="支持自然语言查询，如：'上下文管理相关的技术文档'..."
          class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          @keyup.enter="performSearch"
        />
        <Search class="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
        <button
          @click="performSearch"
          class="absolute right-2 top-2 px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          搜索
        </button>
      </div>

      <!-- 智能提示 -->
      <div v-if="searchSuggestions.length > 0" class="mb-4">
        <div class="flex flex-wrap gap-2">
          <span class="text-sm text-gray-600">建议搜索:</span>
          <button
            v-for="suggestion in searchSuggestions"
            :key="suggestion"
            @click="() => {
              searchQuery = suggestion;
              performSearch();
            }"
            class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- 过滤器面板 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >文档类型</label
          >
          <select
            v-model="filters.type"
            class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">全部类型</option>
            <option 
              v-for="option in documentTypeOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >创建时间</label
          >
          <select
            v-model="filters.timeRange"
            class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">全部时间</option>
            <option 
              v-for="option in timeRangeOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >标签</label
          >
          <select
            v-model="filters.tag"
            class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option value="">全部标签</option>
            <option value="core">核心功能</option>
            <option value="ui">用户界面</option>
            <option value="api">接口设计</option>
            <option value="performance">性能优化</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >结果数量</label
          >
          <select
            v-model="searchConfig.resultCount"
            class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          >
            <option 
              v-for="option in pageSizeOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- 检索配置面板 -->
      <div v-if="showSearchConfig" class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-3">检索配置参数</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs text-gray-600 mb-1">检索精度</label>
            <input
              v-model="searchConfig.precision"
              type="range"
              min="0"
              max="100"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>模糊</span>
              <span>{{ searchConfig.precision }}%</span>
              <span>精确</span>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">搜索范围</label>
            <div class="space-y-1">
              <label class="flex items-center text-xs">
                <input
                  v-model="searchConfig.includeContent"
                  type="checkbox"
                  class="mr-2"
                />
                包含文档内容
              </label>
              <label class="flex items-center text-xs">
                <input
                  v-model="searchConfig.includeComments"
                  type="checkbox"
                  class="mr-2"
                />
                包含注释
              </label>
              <label class="flex items-center text-xs">
                <input
                  v-model="searchConfig.includeCode"
                  type="checkbox"
                  class="mr-2"
                />
                包含代码
              </label>
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">排序方式</label>
            <select
              v-model="searchConfig.sortBy"
              class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option
                      v-for="option in sortOptions"
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

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <!-- 文档分类浏览 -->
      <div>
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <FolderTree class="w-5 h-5 mr-2 text-green-600" />
              文档分类
            </h2>
            <button
              @click="showCategoryConfig = !showCategoryConfig"
              class="text-sm text-green-600 hover:text-green-800 flex items-center"
            >
              <Settings class="w-4 h-4 mr-1" />
              配置
            </button>
          </div>

          <!-- 文档层级展示 -->
          <div class="space-y-2">
            <div
              v-for="category in documentCategories"
              :key="category.id"
              class=""
            >
              <button
                @click="toggleCategory(category.id)"
                class="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded"
              >
                <div class="flex items-center">
                  <ChevronDown
                    v-if="category.expanded"
                    class="w-4 h-4 mr-2 text-gray-400"
                  />
                  <ChevronRight v-else class="w-4 h-4 mr-2 text-gray-400" />
                  <component
                    :is="getCategoryIcon(category.type)"
                    class="w-4 h-4 mr-2 text-blue-600"
                  />
                  <span class="text-sm font-medium text-gray-700">{{
                    category.name
                  }}</span>
                </div>
                <span class="text-xs text-gray-500">{{ category.count }}</span>
              </button>

              <!-- 子分类 -->
              <div v-if="category.expanded" class="ml-6 space-y-1">
                <button
                  v-for="subcategory in category.children"
                  :key="subcategory.id"
                  @click="selectCategory(subcategory.id)"
                  class="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded text-sm"
                  :class="{
                    'bg-blue-50 text-blue-700':
                      selectedCategory === subcategory.id,
                  }"
                >
                  <div class="flex items-center">
                    <File class="w-3 h-3 mr-2 text-gray-400" />
                    <span>{{ subcategory.name }}</span>
                  </div>
                  <span class="text-xs text-gray-500">{{
                    subcategory.count
                  }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 分类配置面板 -->
          <div v-if="showCategoryConfig" class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-3">分类配置</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-xs text-gray-600 mb-1"
                  >自定义分类规则</label
                >
                <select
                  v-model="categoryConfig.rule"
                  class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="auto">自动分类</option>
                  <option value="manual">手动分类</option>
                  <option value="hybrid">混合模式</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">展示方式</label>
                <select
                  v-model="categoryConfig.displayMode"
                  class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="tree">树形结构</option>
                  <option value="list">列表模式</option>
                  <option value="grid">网格模式</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 文档列表和详情 -->
      <div class="xl:col-span-3">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <FileText class="w-5 h-5 mr-2 text-purple-600" />
              文档列表
              <span
                v-if="searchResults.length > 0"
                class="ml-2 text-sm text-gray-500"
              >
                ({{ searchResults.length }} 个结果)
              </span>
            </h2>
            <div class="flex space-x-2">
              <button
                @click="generateDocument"
                class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm flex items-center"
              >
                <Plus class="w-4 h-4 mr-1" />
                生成文档
              </button>
              <button
                @click="showDocumentConfig = !showDocumentConfig"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm flex items-center"
              >
                <Settings class="w-4 h-4 mr-1" />
                配置
              </button>
            </div>
          </div>

          <!-- 文档配置面板 -->
          <div v-if="showDocumentConfig" class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-3">文档配置参数</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-600 mb-1">文档模板</label>
                <select
                  v-model="documentConfig.template"
                  class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="requirement">需求文档模板</option>
                  <option value="design">设计文档模板</option>
                  <option value="api">API文档模板</option>
                  <option value="test">测试文档模板</option>
                </select>
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">生成规则</label>
                <select
                  v-model="documentConfig.generationRule"
                  class="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="auto">自动生成</option>
                  <option value="template">基于模板</option>
                  <option value="ai">AI辅助生成</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 搜索结果列表 -->
          <div class="space-y-4">
            <div
              v-for="document in displayDocuments"
              :key="document.id"
              class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              @click="selectDocument(document.id)"
            >
              <!-- 文档头部 -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <component
                    :is="getDocumentIcon(document.type)"
                    class="w-5 h-5 text-blue-600"
                  />
                  <div>
                    <h3 class="font-medium text-gray-900">
                      {{ document.title }}
                    </h3>
                    <div
                      class="flex items-center space-x-2 text-sm text-gray-500"
                    >
                      <span>{{ document.type }}</span>
                      <span>•</span>
                      <span>{{ document.updateTime }}</span>
                      <span>•</span>
                      <span>{{ document.author }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <span
                    v-if="document.relevance"
                    class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    相关度: {{ document.relevance }}%
                  </span>
                  <button
                    @click.stop="viewDocument(document.id)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    查看
                  </button>
                </div>
              </div>

              <!-- 文档摘要 -->
              <p class="text-sm text-gray-600 mb-3">{{ document.summary }}</p>

              <!-- 标签和关联信息 -->
              <div class="flex items-center justify-between">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="tag in document.tags"
                    :key="tag"
                    class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {{ tag }}
                  </span>
                </div>
                <div class="flex items-center space-x-4 text-xs text-gray-500">
                  <span class="flex items-center">
                    <Link class="w-3 h-3 mr-1" />
                    {{ document.linkedDocs }} 个关联
                  </span>
                  <span class="flex items-center">
                    <Eye class="w-3 h-3 mr-1" />
                    {{ document.views }} 次查看
                  </span>
                </div>
              </div>

              <!-- 相关片段显示区域 -->
              <div class="mt-3 p-2 bg-yellow-50 rounded">
                <p class="text-xs text-yellow-700 mb-1">相关片段:</p>
                <div class="space-y-1">
                  <p class="text-xs text-yellow-800 italic">
                    "{{ document.summary.substring(0, 100) }}..."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div
            v-if="totalPages > 1"
            class="mt-6 flex items-center justify-center space-x-2"
          >
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              上一页
            </button>
            <span class="text-sm text-gray-600">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页
            </span>
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  Search,
  Settings,
  FolderTree,
  FileText,
  BookOpen,
  Layers,
  Code,
  TestTube,
  File,
  Plus,
  Eye,
  Link,
  ChevronDown,
  ChevronRight,
  Filter,
  Download,
  Share,
} from 'lucide-vue-next'
import {
  getPageSizeOptions,
  getDocumentTypeOptions,
  getSortOptions,
  getSearchPrecisionOptions,
  getSearchScopeOptions,
  getTimeRangeOptions,
  getDefaultSearchConfig,
  getDefaultDisplayConfig,
  getDefaultFilterConfig,
  getDefaultDocuments,
  pageTexts,
  getTypeIcon,
  getTypeStyle,
  formatFileSize,
  formatDate
} from '../config/document.config'

// 响应式数据
const showSearchConfig = ref(false)
const showCategoryConfig = ref(false)
const showDocumentConfig = ref(false)
const searchQuery = ref('')
const selectedCategory = ref(0)
const currentPage = ref(1)
const pageSize = 5

// 配置选项
const pageSizeOptions = getPageSizeOptions()
const documentTypeOptions = getDocumentTypeOptions()
const sortOptions = getSortOptions()
const searchPrecisionOptions = getSearchPrecisionOptions()
const searchScopeOptions = getSearchScopeOptions()
const timeRangeOptions = getTimeRangeOptions()

// 搜索建议
const searchSuggestions = reactive([
  '上下文管理技术方案',
  'MCP协议集成文档',
  '需求评估算法设计',
  'Claude-4-Sonnet集成指南',
])

// 过滤器
const filters = reactive({
  type: '',
  timeRange: '',
  tag: '',
})

// 文档分类
const documentCategories = reactive([
  {
    id: 1,
    name: '需求文档',
    type: 'requirement',
    count: 15,
    expanded: false,
    children: [
      { id: 11, name: '核心需求', count: 8 },
      { id: 12, name: '功能需求', count: 5 },
      { id: 13, name: '非功能需求', count: 2 },
    ],
  },
  {
    id: 2,
    name: '设计文档',
    type: 'design',
    count: 12,
    expanded: false,
    children: [
      { id: 21, name: '架构设计', count: 4 },
      { id: 22, name: '接口设计', count: 6 },
      { id: 23, name: 'UI设计', count: 2 },
    ],
  },
  {
    id: 3,
    name: 'API文档',
    type: 'api',
    count: 8,
    expanded: false,
    children: [
      { id: 31, name: 'MCP接口', count: 4 },
      { id: 32, name: '内部API', count: 4 },
    ],
  },
  {
    id: 4,
    name: '测试文档',
    type: 'test',
    count: 6,
    expanded: false,
    children: [
      { id: 41, name: '单元测试', count: 3 },
      { id: 42, name: '集成测试', count: 2 },
      { id: 43, name: '性能测试', count: 1 },
    ],
  },
])

// 文档数据
const allDocuments = reactive([
  {
    id: 1,
    title: 'TraeIDE项目偏离预防MCP产品需求文档',
    type: '需求文档',
    summary: '详细描述了MCP产品的核心功能、技术架构和用户界面设计要求',
    author: '产品经理',
    updateTime: '2024-01-20',
    tags: ['核心功能', 'MCP协议', '需求分析'],
    linkedDocs: 8,
    views: 156,
    relevance: 95,
  },
  {
    id: 2,
    title: 'MCP协议集成技术方案',
    type: '设计文档',
    summary: '描述了如何在TraeIDE中集成MCP协议，包括客户端和服务端实现',
    author: '技术架构师',
    updateTime: '2024-01-19',
    tags: ['MCP协议', '技术架构', '集成方案'],
    linkedDocs: 5,
    views: 89,
    relevance: 88,
  },
  {
    id: 3,
    title: '上下文管理模块API设计',
    type: 'API文档',
    summary: '定义了上下文管理模块的所有API接口，包括快照创建、压缩和恢复功能',
    author: '后端开发',
    updateTime: '2024-01-18',
    tags: ['API设计', '上下文管理', '接口规范'],
    linkedDocs: 3,
    views: 67,
    relevance: 82,
  },
  {
    id: 4,
    title: '需求关联度评估算法设计',
    type: '设计文档',
    summary: '详细描述了需求与核心目标关联度的计算算法和评估标准',
    author: '算法工程师',
    updateTime: '2024-01-17',
    tags: ['算法设计', '需求评估', '关联度计算'],
    linkedDocs: 4,
    views: 45,
    relevance: 75,
  },
  {
    id: 5,
    title: 'Claude-4-Sonnet集成测试用例',
    type: '测试文档',
    summary: '包含Claude-4-Sonnet集成的完整测试用例和验证标准',
    author: '测试工程师',
    updateTime: '2024-01-16',
    tags: ['测试用例', 'Claude集成', '质量保证'],
    linkedDocs: 2,
    views: 34,
    relevance: 70,
  },
])

const searchResults = ref([...allDocuments])

// 配置参数
const searchConfig = reactive({
  precision: 75,
  resultCount: '20',
  includeContent: true,
  includeComments: true,
  includeCode: false,
  sortBy: 'relevance',
})

const categoryConfig = reactive({
  rule: 'auto',
  displayMode: 'tree',
})

const documentConfig = reactive({
  template: 'requirement',
  generationRule: 'ai',
})

// 计算属性
const displayDocuments = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return searchResults.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(searchResults.value.length / pageSize)
})

// 方法
const performSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [...allDocuments]
    return
  }

  // 模拟搜索结果
  searchResults.value = allDocuments.filter(
    doc =>
      doc.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      doc.tags.some(tag =>
        tag.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
  )

  // 添加高亮
  searchResults.value.forEach(doc => {
    if (doc.summary.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      // 高亮搜索结果（简化处理）
      doc.relevance = 95
    }
  })

  currentPage.value = 1
}

const toggleCategory = (id: number) => {
  const category = documentCategories.find(c => c.id === id)
  if (category) {
    category.expanded = !category.expanded
  }
}

const selectCategory = (id: number) => {
  selectedCategory.value = id
  // 根据分类过滤文档
  // 这里可以实现分类过滤逻辑
}

const selectDocument = (id: number) => {
  console.log('选择文档:', id)
  // 实现文档选择逻辑
}

const viewDocument = (id: number) => {
  console.log('查看文档:', id)
  // 实现文档查看逻辑
}

const generateDocument = () => {
  console.log('生成新文档')
  // 实现文档生成逻辑
}

// 工具函数
const getCategoryIcon = (type: string) => {
  switch (type) {
    case 'requirement':
      return BookOpen
    case 'design':
      return Layers
    case 'api':
      return Code
    case 'test':
      return TestTube
    default:
      return File
  }
}

const getDocumentIcon = (type: string) => {
  switch (type) {
    case '需求文档':
      return BookOpen
    case '设计文档':
      return Layers
    case 'API文档':
      return Code
    case '测试文档':
      return TestTube
    default:
      return FileText
  }
}
</script>
