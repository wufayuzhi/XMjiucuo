<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">DeepSeek AI集成</h1>
      <p class="text-gray-600">AI模型配置、智能对话、项目分析与文件查询</p>
    </div>

    <!-- 状态概览 -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">API连接</p>
            <p class="text-2xl font-bold" :class="{
              'text-green-600': connectionStatus === '已连接',
              'text-red-600': connectionStatus === '连接失败' || connectionStatus === '未配置',
              'text-yellow-600': connectionStatus === '连接中...',
              'text-gray-600': connectionStatus === '未连接'
            }">
              {{ connectionStatus }}
            </p>
          </div>
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="{
              'bg-green-100': connectionStatus === '已连接',
              'bg-red-100': connectionStatus === '连接失败' || connectionStatus === '未配置',
              'bg-yellow-100': connectionStatus === '连接中...',
              'bg-gray-100': connectionStatus === '未连接'
            }"
          >
            <Zap class="w-6 h-6" :class="{
              'text-green-600': connectionStatus === '已连接',
              'text-red-600': connectionStatus === '连接失败' || connectionStatus === '未配置',
              'text-yellow-600': connectionStatus === '连接中...',
              'text-gray-600': connectionStatus === '未连接'
            }" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">MCP服务</p>
            <p class="text-2xl font-bold" :class="{
              'text-green-600': mcpConnectionStatus === '已连接',
              'text-red-600': mcpConnectionStatus === '连接失败' || mcpConnectionStatus === '服务未启动',
              'text-yellow-600': mcpConnectionStatus === '检测中...',
              'text-gray-600': mcpConnectionStatus === '未检测'
            }">
              {{ mcpConnectionStatus }}
            </p>
            <div class="mt-1 space-x-2">
              <button
                v-if="mcpConnectionStatus !== '已连接' && mcpConnectionStatus !== '检测中...'"
                @click="retryMCPConnection"
                class="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                重试连接
              </button>
              <button
                @click="debugMCPConnection"
                class="text-xs text-gray-600 hover:text-gray-800 underline"
              >
                调试连接
              </button>
            </div>
          </div>
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="{
              'bg-green-100': mcpConnectionStatus === '已连接',
              'bg-red-100': mcpConnectionStatus === '连接失败' || mcpConnectionStatus === '服务未启动',
              'bg-yellow-100': mcpConnectionStatus === '检测中...',
              'bg-gray-100': mcpConnectionStatus === '未检测'
            }"
          >
            <Database class="w-6 h-6" :class="{
              'text-green-600': mcpConnectionStatus === '已连接',
              'text-red-600': mcpConnectionStatus === '连接失败' || mcpConnectionStatus === '服务未启动',
              'text-yellow-600': mcpConnectionStatus === '检测中...',
              'text-gray-600': mcpConnectionStatus === '未检测'
            }" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">今日对话</p>
            <p class="text-2xl font-bold text-blue-600">
              {{ todayConversations }}
            </p>
          </div>
          <div
            class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
          >
            <MessageCircle class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">分析报告</p>
            <p class="text-2xl font-bold text-purple-600">
              {{ analysisReports }}
            </p>
          </div>
          <div
            class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
          >
            <BarChart3 class="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">API使用率</p>
            <p class="text-2xl font-bold text-orange-600">{{ apiUsage }}%</p>
          </div>
          <div
            class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"
          >
            <Activity class="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- 配置面板 -->
      <div>
        <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <Settings class="w-5 h-5 mr-2 text-blue-600" />
              模型配置
            </h2>
            <div class="flex items-center space-x-2">
              <button
                v-if="config.apiKey"
                @click="clearSavedConfig"
                class="px-2 py-1 rounded text-xs flex items-center transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                title="清除保存的配置"
              >
                <Trash2 class="w-3 h-3 mr-1" />
                清除配置
              </button>
              <button
                @click="testConnection"
                :disabled="!config.apiKey || !config.apiKey.trim()"
                :class="[
                  'px-3 py-1 rounded text-sm flex items-center transition-colors',
                  !config.apiKey || !config.apiKey.trim() 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                ]"
              >
                <Zap class="w-4 h-4 mr-1" />
                {{ !config.apiKey || !config.apiKey.trim() ? '请先输入API密钥' : '测试连接' }}
              </button>
            </div>
          </div>

          <!-- API配置 -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >API密钥
                <span v-if="!config.apiKey" class="text-red-500 text-xs ml-1">（必填）</span>
                <span v-else-if="Object.values(getApiConfig().keyFormats || {}).some((regex: any) => regex.test(config.apiKey))" class="text-green-500 text-xs ml-1">✓ 格式正确</span>
                <span v-else class="text-orange-500 text-xs ml-1">⚠ 格式可能错误</span>
              </label>
              <div class="relative">
                <input
                  v-model="config.apiKey"
                  :type="showApiKey ? 'text' : 'password'"
                  placeholder="输入DeepSeek API密钥 (以sk-开头)"
                  :class="[
                    'w-full px-3 py-2 border rounded text-sm pr-10',
                    !config.apiKey ? 'border-red-300 bg-red-50' : 
                    Object.values(getApiConfig().keyFormats || {}).some((regex: any) => regex.test(config.apiKey)) ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'
                  ]"
                />
                <button
                  @click="showApiKey = !showApiKey"
                  class="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <Eye v-if="!showApiKey" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
              <!-- API密钥状态提示 -->
              <div v-if="!config.apiKey" class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div class="text-sm text-red-800">
                  <div class="font-medium mb-1 flex items-center">
                    <span class="text-red-500 mr-1">⚠️</span>
                    请先配置API密钥才能使用DeepSeek功能
                  </div>
                  <div class="text-xs text-red-600">
                    没有API密钥将无法进行连接测试和AI对话
                  </div>
                </div>
              </div>
              
              <div v-else-if="!Object.values(getApiConfig().keyFormats || {}).some((regex: any) => regex.test(config.apiKey))" class="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div class="text-sm text-orange-800">
                  <div class="font-medium mb-1 flex items-center">
                    <span class="text-orange-500 mr-1">⚠️</span>
                    API密钥格式可能不正确
                  </div>
                  <div class="text-xs text-orange-600">
                    DeepSeek API密钥应该以 "sk-" 开头
                  </div>
                </div>
              </div>
              
              <div v-else class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div class="text-sm text-green-800">
                  <div class="font-medium mb-1 flex items-center">
                    <span class="text-green-500 mr-1">✅</span>
                    API密钥格式正确，可以进行连接测试
                  </div>
                  <div v-if="isConfigSaved" class="text-xs text-green-600 mt-1 flex items-center">
                    <span class="text-green-500 mr-1">💾</span>
                    配置已保存到本地存储，下次启动将自动加载
                  </div>
                  <div v-else class="text-xs text-blue-600 mt-1 flex items-center">
                    <span class="text-blue-500 mr-1">💡</span>
                    连接测试成功后将自动保存配置
                  </div>
                </div>
              </div>
              
              <div class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="text-sm text-blue-800">
                  <div class="font-medium mb-1">🔑 支持的API密钥类型：</div>
                  <div class="grid grid-cols-1 gap-2 text-xs">
                    <div class="flex items-center">
                      <span class="text-green-500 mr-1">✅</span>
                      <strong>OpenRouter:</strong> <a href="https://openrouter.ai/keys" target="_blank" class="text-blue-600 hover:underline">openrouter.ai/keys</a> (推荐)
                    </div>
                    <div class="flex items-center">
                      <span class="text-green-500 mr-1">✅</span>
                      <strong>DeepSeek:</strong> <a href="https://platform.deepseek.com" target="_blank" class="text-blue-600 hover:underline">platform.deepseek.com</a>
                    </div>
                    <div class="flex items-center">
                      <span class="text-green-500 mr-1">✅</span>
                      <strong>OpenAI:</strong> <a href="https://platform.openai.com" target="_blank" class="text-blue-600 hover:underline">platform.openai.com</a>
                    </div>
                    <div class="flex items-center">
                      <span class="text-green-500 mr-1">✅</span>
                      <strong>Anthropic:</strong> <a href="https://console.anthropic.com" target="_blank" class="text-blue-600 hover:underline">console.anthropic.com</a>
                    </div>
                    <div class="flex items-center">
                      <span class="text-green-500 mr-1">✅</span>
                      <strong>MoonshotAI:</strong> <a href="https://platform.moonshot.cn" target="_blank" class="text-blue-600 hover:underline">platform.moonshot.cn</a>
                    </div>
                  </div>
                  <div class="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                    💡 <strong>推荐使用OpenRouter：</strong>一个API密钥即可访问多种AI模型，包括DeepSeek、GPT、Claude、Kimi等
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >AI模型选择</label
              >
              <select
                v-model="config.modelVersion"
                class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <optgroup 
                  v-for="group in modelOptions" 
                  :key="group.label" 
                  :label="group.label"
                >
                  <option 
                    v-for="option in group.options" 
                    :key="option.value" 
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </optgroup>
              </select>
              <div class="mt-1 text-xs text-gray-500">
                💡 使用OpenRouter API密钥可访问所有模型
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >最大Token数</label
              >
              <input
                v-model="config.maxTokens"
                type="number"
                min="100"
                max="4096"
                class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >温度参数</label
              >
              <input
                v-model="config.temperature"
                type="range"
                min="0"
                max="1"
                step="0.1"
                class="w-full"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>保守</span>
                <span>{{ config.temperature }}</span>
                <span>创新</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >系统提示词</label
              >
              <textarea
                v-model="config.systemPrompt"
                rows="3"
                placeholder="定义AI助手的角色和行为..."
                class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        <!-- 快捷功能 -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h3
            class="text-lg font-semibold text-gray-900 mb-4 flex items-center"
          >
            <Sparkles class="w-5 h-5 mr-2 text-purple-600" />
            快捷功能
          </h3>

          <div class="space-y-3">
            <button
              @click="analyzeProject"
              class="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-left flex items-center"
            >
              <Search class="w-5 h-5 mr-3" />
              <div>
                <div class="font-medium">项目分析</div>
                <div class="text-sm text-blue-600">
                  分析当前项目状态和潜在问题
                </div>
              </div>
            </button>

            <button
              @click="generateSuggestions"
              class="w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-left flex items-center"
            >
              <Lightbulb class="w-5 h-5 mr-3" />
              <div>
                <div class="font-medium">优化建议</div>
                <div class="text-sm text-green-600">生成项目优化和改进建议</div>
              </div>
            </button>

            <button
              @click="reviewRequirements"
              class="w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-left flex items-center"
            >
              <FileCheck class="w-5 h-5 mr-3" />
              <div>
                <div class="font-medium">需求评审</div>
                <div class="text-sm text-purple-600">
                  智能评审需求文档和规格
                </div>
              </div>
            </button>

            <button
              @click="generateDocumentation"
              class="w-full px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-left flex items-center"
            >
              <FileText class="w-5 h-5 mr-3" />
              <div>
                <div class="font-medium">文档生成</div>
                <div class="text-sm text-orange-600">
                  自动生成技术文档和说明
                </div>
              </div>
            </button>

            <button
              @click="toggleFileExplorer"
              class="w-full px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-left flex items-center"
            >
              <FolderOpen class="w-5 h-5 mr-3" />
              <div>
                <div class="font-medium">文件夹查询</div>
                <div class="text-sm text-indigo-600">
                  浏览和查询指定文件夹内容
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- 文件夹浏览面板 -->
      <div
        v-if="showFileExplorer"
        class="bg-white rounded-lg shadow-sm border p-6 mb-6"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <FolderOpen class="w-5 h-5 mr-2 text-indigo-600" />
            文件夹浏览器
          </h3>
          <button
            @click="showFileExplorer = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >选择文件夹路径</label
          >
          <div class="flex space-x-2">
            <input
              v-model="selectedFolderPath"
              placeholder="输入文件夹路径，如: C:\\Users\\Documents"
              class="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <button
              @click="browseFolder"
              class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center"
            >
              <Search class="w-4 h-4 mr-1" />
              浏览
            </button>
          </div>
        </div>

        <div
          v-if="folderContents.length > 0"
          class="border rounded-lg p-4 max-h-64 overflow-y-auto"
        >
          <div class="space-y-2">
            <div
              v-for="item in folderContents"
              :key="item.name"
              class="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
              @click="selectFile(item)"
            >
              <div class="flex items-center">
                <Folder
                  v-if="item.type === 'folder'"
                  class="w-4 h-4 mr-2 text-blue-500"
                />
                <FileText v-else class="w-4 h-4 mr-2 text-gray-500" />
                <span class="text-sm">{{ item.name }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-400">{{ item.size }}</span>
                <button
                  @click.stop="queryFile(item)"
                  class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                >
                  查询
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="selectedFolderPath"
          class="text-center py-8 text-gray-500"
        >
          <FolderOpen class="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>未找到文件或文件夹为空</p>
        </div>
      </div>

      <!-- 对话界面 -->
      <div class="xl:col-span-2">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <MessageCircle class="w-5 h-5 mr-2 text-green-600" />
              智能对话
            </h2>
            <div class="flex space-x-2">
              <button
                @click="clearConversation"
                class="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 flex items-center"
              >
                <Trash2 class="w-4 h-4 mr-1" />
                清空
              </button>
              <button
                @click="exportConversation"
                class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center"
              >
                <Download class="w-4 h-4 mr-1" />
                导出
              </button>
            </div>
          </div>

          <!-- 对话历史 -->
          <div
            class="h-96 overflow-y-auto mb-4 border rounded-lg p-4 bg-gray-50"
          >
            <div v-if="conversation.length === 0" class="text-center py-12">
              <MessageCircle class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">开始对话</h3>
              <p class="text-gray-500">向Claude提问关于项目的任何问题</p>
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="(message, index) in conversation"
                :key="index"
                class="flex"
                :class="
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                "
              >
                <div
                  class="max-w-3xl"
                  :class="message.role === 'user' ? 'order-2' : 'order-1'"
                >
                  <div
                    class="flex items-center mb-1"
                    :class="
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    "
                  >
                    <span class="text-sm font-medium text-gray-600">
                      {{ message.role === 'user' ? '您' : 'Claude' }}
                    </span>
                    <span class="text-xs text-gray-400 ml-2">{{
                      message.timestamp
                    }}</span>
                  </div>
                  <div
                    class="rounded-lg p-3"
                    :class="
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200'
                    "
                  >
                    <div class="text-sm whitespace-pre-wrap">
                      {{ message.content }}
                    </div>
                    <!-- 附件显示区域 -->
                    <div class="mt-2 flex flex-wrap gap-1">
                      <span
                        class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        文本消息
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center ml-3 mr-3"
                  :class="
                    message.role === 'user'
                      ? 'bg-blue-600 order-1'
                      : 'bg-green-600 order-2'
                  "
                >
                  <User
                    v-if="message.role === 'user'"
                    class="w-4 h-4 text-white"
                  />
                  <Bot v-else class="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <!-- 正在输入指示器 -->
            <div v-if="isTyping" class="flex justify-start">
              <div
                class="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-3"
              >
                <div class="flex space-x-1">
                  <div
                    class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  />
                  <div
                    class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style="animation-delay: 0.1s"
                  />
                  <div
                    class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style="animation-delay: 0.2s"
                  />
                </div>
                <span class="text-sm text-gray-500">Claude正在思考...</span>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="border rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <div class="flex-1">
                <textarea
                  v-model="currentMessage"
                  @keydown.enter.prevent="sendMessage"
                  placeholder="输入您的问题或请求..."
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <!-- 快捷提示 -->
                <div class="flex flex-wrap gap-2 mt-2">
                  <button
                    v-for="prompt in quickPrompts"
                    :key="prompt"
                    @click="currentMessage = prompt"
                    class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                  >
                    {{ prompt }}
                  </button>
                </div>
              </div>

              <div class="flex flex-col space-y-2">
                <button
                  @click="sendMessage"
                  :disabled="!currentMessage.trim() || isTyping"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Send class="w-4 h-4 mr-1" />
                  发送
                </button>

                <button
                  @click="attachFile"
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center"
                >
                  <Paperclip class="w-4 h-4 mr-1" />
                  附件
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分析结果面板 -->
    <div v-if="analysisResults.length > 0" class="mt-6">
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <BarChart3 class="w-5 h-5 mr-2 text-purple-600" />
          分析结果
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="result in analysisResults"
            :key="result.id"
            class="border rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-gray-900">{{ result.title }}</h3>
              <span
                class="px-2 py-1 rounded-full text-xs"
                :class="getResultTypeClass(result.type)"
              >
                {{ result.type }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-3">{{ result.description }}</p>
            <div
              class="flex items-center justify-between text-xs text-gray-500"
            >
              <span>{{ result.timestamp }}</span>
              <button
                @click="viewResultDetail(result.id)"
                class="text-blue-600 hover:text-blue-800"
              >
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { mcpClient } from '../utils/mcpClient'
import { getApiConfig, getSystemConfig, getPathsConfig, getServerConfig } from '../config/app.config.js'
import {
  Zap,
  MessageCircle,
  BarChart3,
  Activity,
  Settings,
  Eye,
  EyeOff,
  Sparkles,
  Search,
  Lightbulb,
  FileCheck,
  FileText,
  Trash2,
  Download,
  Paperclip,
  Send,
  User,
  Bot,
  FolderOpen,
  Folder,
  X,
  Database,
  TestTube,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
} from 'lucide-vue-next'
import {
  getDefaultModelOptions,
  getDefaultQuickActions,
  getDefaultConfig,
  getDefaultQuickPrompts,
  getApiKeyTypes,
  pageTexts,
  getTemperatureConfig,
  getTokenConfig
} from '@/config/deepseek.config'

// 获取配置
const apiConfig = getApiConfig()
const systemConfig = getSystemConfig()
const pathsConfig = getPathsConfig()
const serverConfig = getServerConfig()

// 获取页面配置数据
const modelOptions = getDefaultModelOptions()
const quickActions = getDefaultQuickActions()
const apiKeyTypes = getApiKeyTypes()
const temperatureConfig = getTemperatureConfig()
const tokenConfig = getTokenConfig()

// 响应式数据
const showApiKey = ref(false)
const isTyping = ref(false)
const currentMessage = ref('')
const showFileExplorer = ref(false)
const selectedFolderPath = ref('')
const folderContents = ref([])

// 状态数据
const connectionStatus = ref('未连接')
const mcpConnectionStatus = ref('未检测')
const todayConversations = ref(0)
const analysisReports = ref(0)
const apiUsage = ref(0)

// localStorage配置键名
const STORAGE_KEY = 'deepseek_api_config'

// 从localStorage加载配置
const loadConfigFromStorage = () => {
  try {
    const savedConfig = localStorage.getItem(STORAGE_KEY)
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig)
      console.log('从localStorage加载配置:', parsed)
      const defaultConfig = getDefaultConfig()
      return {
        apiKey: parsed.apiKey || defaultConfig.apiKey,
        modelVersion: parsed.modelVersion || defaultConfig.modelVersion,
        maxTokens: parsed.maxTokens || defaultConfig.maxTokens,
        temperature: parsed.temperature || defaultConfig.temperature,
        systemPrompt: parsed.systemPrompt || defaultConfig.systemPrompt,
      }
    }
  } catch (error) {
    console.warn('加载localStorage配置失败:', error)
  }
  return getDefaultConfig()
}

// 保存配置到localStorage
const saveConfigToStorage = () => {
  try {
    const configToSave = {
      apiKey: config.apiKey,
      modelVersion: config.modelVersion,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      systemPrompt: config.systemPrompt,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave))
    console.log('配置已保存到localStorage:', configToSave)
  } catch (error) {
    console.error('保存配置到localStorage失败:', error)
  }
}

// 清除保存的配置
const clearSavedConfig = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('已清除保存的配置')
    // 重置配置为默认值
    Object.assign(config, getDefaultConfig())
    connectionStatus.value = '未连接'
    alert('✅ 已清除保存的API配置')
  } catch (error) {
    console.error('清除配置失败:', error)
  }
}

// 配置数据 - 从localStorage初始化
const config = reactive(loadConfigFromStorage())

// 检查配置是否已保存
const isConfigSaved = computed(() => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
})

// 对话数据
const conversation = reactive([])

// 快捷提示
const quickPrompts = reactive(getDefaultQuickPrompts())

// 分析结果
const analysisResults = reactive([])

// MCP连接状态检测
const checkMCPConnection = async () => {
  try {
    mcpConnectionStatus.value = '检测中...'
    console.log('开始检测MCP连接状态...')
    
    // 检查MCP客户端连接状态
    const mcpStatus = mcpClient.getStatus()
    console.log('MCP客户端状态:', mcpStatus)
    
    if (mcpStatus.connected) {
      mcpConnectionStatus.value = '已连接'
      console.log('MCP客户端已连接')
    } else {
      // 尝试连接MCP服务器
      const mcpUrl = `${serverConfig.mcp.protocol}://${serverConfig.mcp.host}:${serverConfig.mcp.defaultPort}`
      console.log(`尝试连接MCP服务器 ${mcpUrl}`)
      try {
        await mcpClient.connect()
        mcpConnectionStatus.value = '已连接'
        console.log('MCP连接成功')
        
        // 测试MCP功能
        try {
          const tools = await mcpClient.listTools()
          console.log('MCP工具列表:', tools)
        } catch (toolError) {
          console.warn('获取MCP工具列表失败:', toolError)
        }
      } catch (error) {
        console.error('MCP连接失败详情:', {
          message: error.message,
          stack: error.stack,
          serverUrl: mcpUrl
        })
        
        if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
          mcpConnectionStatus.value = '服务未启动'
        } else {
          mcpConnectionStatus.value = '连接失败'
        }
      }
    }
  } catch (error) {
    console.error('MCP状态检测失败:', error)
    mcpConnectionStatus.value = '连接失败'
  }
}

// 页面加载时检测MCP连接状态
checkMCPConnection()

// 页面加载时的初始化
const initializePage = () => {
  // 检查是否从localStorage加载了配置
  if (config.apiKey) {
    console.log('✅ 已从localStorage加载API配置')
    conversation.push({
      role: 'assistant',
      content: `🎉 欢迎回来！已自动加载您的API配置\n\n📋 当前配置：\n• 模型: ${config.modelVersion}\n• API密钥: ${config.apiKey.substring(0, 10)}...\n\n💡 您可以直接开始对话，或点击"测试连接"验证API状态`,
      timestamp: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    })
  } else {
    console.log('ℹ️ 首次使用，需要配置API密钥')
    conversation.push({
      role: 'assistant',
      content: `👋 欢迎使用DeepSeek AI集成功能！\n\n🔧 首次使用需要配置：\n1. 输入您的API密钥\n2. 选择合适的AI模型\n3. 点击"测试连接"验证\n\n✨ 连接成功后配置将自动保存，下次启动无需重新输入`,
      timestamp: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    })
  }
}

// 初始化页面
initializePage()

// 添加MCP连接重试按钮功能
const retryMCPConnection = async () => {
  console.log('手动重试MCP连接...')
  await checkMCPConnection()
}

// MCP连接调试功能
const debugMCPConnection = async () => {
  console.log('=== MCP连接调试开始 ===')
  
  // 1. 检查WebSocket支持
  console.log('1. WebSocket支持:', typeof WebSocket !== 'undefined')
  
  // 2. 检查MCP客户端状态
  const status = mcpClient.getStatus()
  console.log('2. MCP客户端状态:', status)
  
  // 3. 测试原生WebSocket连接
  const mcpUrl = `${serverConfig.mcp.protocol}://${serverConfig.mcp.host}:${serverConfig.mcp.defaultPort}`
  console.log(`3. 测试原生WebSocket连接到 ${mcpUrl}`)
  try {
    const testWs = new WebSocket(mcpUrl)
    testWs.onopen = () => {
      console.log('✓ 原生WebSocket连接成功')
      testWs.close()
    }
    testWs.onerror = (error) => {
      console.error('✗ 原生WebSocket连接失败:', error)
    }
    testWs.onclose = (event) => {
      console.log('原生WebSocket连接关闭:', event.code, event.reason)
    }
  } catch (error) {
    console.error('✗ 创建WebSocket失败:', error)
  }
  
  // 4. 测试HTTP API
  console.log('4. 测试MCP服务器HTTP API')
  try {
    const httpUrl = `http://${serverConfig.mcp.host}:${serverConfig.mcp.defaultPort}/api/status`
    const response = await fetch(httpUrl)
    const data = await response.json()
    console.log('✓ HTTP API响应:', data)
  } catch (error) {
    console.error('✗ HTTP API测试失败:', error)
  }
  
  // 5. 尝试MCP客户端连接
  console.log('5. 尝试MCP客户端连接')
  try {
    await mcpClient.connect()
    console.log('✓ MCP客户端连接成功')
    
    // 6. 测试工具列表
    try {
      const tools = await mcpClient.listTools()
      console.log('✓ 获取工具列表成功:', tools)
    } catch (toolError) {
      console.error('✗ 获取工具列表失败:', toolError)
    }
  } catch (error) {
    console.error('✗ MCP客户端连接失败:', error)
  }
  
  console.log('=== MCP连接调试结束 ===')
}

// 方法
const testConnection = async () => {
  console.log('测试OpenRouter API连接')
  
  // 检查API密钥是否为空
  if (!config.apiKey || !config.apiKey.trim()) {
    connectionStatus.value = '未配置'
    alert('❌ 请先配置API密钥！\n\n📋 支持的API密钥类型：\n• OpenAI API密钥 (sk-...)\n• DeepSeek API密钥 (sk-...)\n• OpenRouter API密钥 (sk-or-v...)\n• Anthropic API密钥 (sk-ant-...)\n\n🔗 获取OpenRouter密钥：\n1. 访问 https://openrouter.ai/keys\n2. 注册/登录您的账户\n3. 创建新的API密钥\n4. 复制密钥并粘贴到上方输入框')
    return
  }
  
  // 验证API密钥格式
  const apiValidation = getApiConfig().keyFormats || {}
  const isValidApiKey = Object.values(apiValidation).some((regex: any) => regex.test(config.apiKey))
  
  if (!isValidApiKey) {
    alert('❌ API密钥格式错误！\n\n支持的密钥格式：\n• OpenRouter: sk-or-v...\n• OpenAI: sk-...\n• DeepSeek: sk-...\n• Anthropic: sk-ant-...\n• MoonshotAI: sk-or-v1-...\n\n请检查您的密钥是否正确复制')
    return
  }
  
  try {
    connectionStatus.value = '连接中...'
    
    // 使用配置的API端点
    const response = await fetch(apiConfig.endpoints.openrouter, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'TraeIDE Project Management Plugin'
      },
      body: JSON.stringify({
        model: config.modelVersion,
        messages: [{
          role: 'user',
          content: '你好，这是一个连接测试。请简单回复确认连接成功。'
        }],
        max_tokens: 50,
        temperature: 0.7
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      connectionStatus.value = '已连接'
      const aiResponse = data.choices[0]?.message?.content || '连接测试成功！'
      
      // 连接成功后自动保存配置
      saveConfigToStorage()
      
      alert(`✅ OpenRouter API连接成功！\n\n模型: ${config.modelVersion}\n响应: ${aiResponse}\n\n✨ 配置已自动保存，下次启动将自动加载\n\n现在可以开始使用AI助手功能了。`)
      console.log('API响应:', data)
      
      // 添加测试成功消息到对话
      conversation.push({
        role: 'assistant',
        content: `✅ OpenRouter API连接测试成功！\n模型: ${config.modelVersion}\n响应: ${aiResponse}\n\n💾 配置已自动保存到本地存储`,
        timestamp: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
    } else {
      const errorData = await response.json()
      connectionStatus.value = '连接失败'
      
      let errorMessage = '❌ 连接失败：'
      if (response.status === 401) {
        errorMessage += '\n\n🔑 API密钥无效或已过期\n\n解决方案：\n1. 检查API密钥是否正确复制\n2. 确认密钥未过期\n3. 访问对应平台重新生成密钥\n4. 确保账户余额充足\n\n🔗 密钥获取地址：\n• OpenRouter: https://openrouter.ai/keys\n• DeepSeek: https://platform.deepseek.com\n• OpenAI: https://platform.openai.com'
      } else if (response.status === 429) {
        errorMessage += '\n\n⏰ 请求频率过高\n\n请稍后再试'
      } else if (response.status === 402) {
        errorMessage += '\n\n💰 账户余额不足\n\n请前往对应平台充值'
      } else {
        errorMessage += `\n\n${errorData.error?.message || '未知错误'}\n状态码: ${response.status}`
      }
      
      alert(errorMessage)
      console.error('API错误详情:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        apiKey: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : '未设置',
        model: config.modelVersion,
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        keyFormat: config.apiKey ? (
          config.apiKey.startsWith('sk-or-v') ? 'OpenRouter密钥' :
          config.apiKey.startsWith('sk-ant-') ? 'Anthropic密钥' :
          config.apiKey.startsWith('sk-') ? '通用sk-格式' : '未知格式'
        ) : '未设置'
      })
    }
  } catch (error) {
    connectionStatus.value = '连接失败'
    let errorMessage = '❌ 网络连接失败：'
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage += '\n\n🌐 网络连接问题\n\n请检查：\n1. 网络连接是否正常\n2. 防火墙设置\n3. 代理配置'
    } else {
      errorMessage += `\n\n${error.message}`
    }
    
    alert(errorMessage)
    console.error('连接错误详情:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
  }
}

const sendMessage = async () => {
  if (!currentMessage.value.trim()) return

  if (!config.apiKey) {
    alert('请先配置API密钥并测试连接')
    return
  }

  // 添加用户消息
  conversation.push({
    role: 'user',
    content: currentMessage.value,
    timestamp: new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  })

  const userMessage = currentMessage.value
  currentMessage.value = ''
  isTyping.value = true

  try {
    // 构建对话历史
    const messages = [
      {
        role: 'system',
        content: config.systemPrompt
      },
      ...conversation.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    const response = await fetch(apiConfig.endpoints.openrouter, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'TraeIDE Project Management Plugin'
      },
      body: JSON.stringify({
        model: config.modelVersion,
        messages: messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature
      })
    })

    if (response.ok) {
      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content || '抱歉，我无法生成回复。'
      
      conversation.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
      
      // 更新统计数据
      todayConversations.value++
      apiUsage.value += data.usage?.total_tokens || 0
    } else {
      const errorData = await response.json()
      let errorMessage = '❌ API调用失败：'
      
      if (response.status === 401) {
        errorMessage += '\n\n🔑 API密钥无效或已过期\n\n请检查API密钥是否正确'
      } else if (response.status === 429) {
        errorMessage += '\n\n⏰ 请求频率过高\n\n请稍后再试'
      } else if (response.status === 402) {
        errorMessage += '\n\n💰 账户余额不足\n\n请前往充值'
      } else {
        errorMessage += `\n\n${errorData.error?.message || '未知错误'}\n状态码: ${response.status}`
      }
      
      conversation.push({
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
    }
  } catch (error) {
    conversation.push({
      role: 'assistant',
      content: `❌ 网络错误: ${error.message}`,
      timestamp: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    })
  } finally {
    isTyping.value = false
  }
}

const clearConversation = () => {
  conversation.splice(1) // 保留第一条欢迎消息
}

const exportConversation = () => {
  console.log('导出对话记录')
  // 实现对话导出逻辑
}

const attachFile = () => {
  console.log('附加文件')
  // 实现文件附加逻辑
}

const analyzeProject = () => {
  currentMessage.value =
    '请分析当前项目的整体状态，包括技术架构、需求完整性和潜在风险'
}

const generateSuggestions = () => {
  currentMessage.value = '基于当前项目情况，请提供具体的优化建议和改进方案'
}

const reviewRequirements = () => {
  currentMessage.value = '请评审当前的需求文档，检查是否有遗漏或不明确的地方'
}

const generateDocumentation = () => {
  currentMessage.value = '请帮我生成技术文档，包括API接口说明和使用指南'
}

// 文件夹浏览相关方法
const toggleFileExplorer = () => {
  showFileExplorer.value = !showFileExplorer.value
  if (showFileExplorer.value && !selectedFolderPath.value) {
    selectedFolderPath.value = pathsConfig.project + '/src'
  }
}

const browseFolder = async () => {
  if (!selectedFolderPath.value.trim()) return

  try {
    // 通过MCP服务器获取真实的文件夹内容
    const projectContext = await mcpClient.getProjectContext(false)
    let files = []
    
    if (projectContext && projectContext.files) {
      files = projectContext.files
        .filter(file => file.path.startsWith(selectedFolderPath.value))
        .map(file => ({
          name: file.name || file.path.split(/[\\/]/).pop(),
          type: file.type || (file.path.includes('.') ? 'file' : 'folder'),
          size: file.size ? `${(file.size / 1024).toFixed(1)}KB` : '-',
          path: file.path
        }))
    }
    
    // 如果MCP没有返回文件信息，尝试使用本地文件系统API（如果可用）
    if (files.length === 0) {
      // 在浏览器环境中，我们无法直接访问文件系统
      // 这里可以提示用户手动选择文件或使用其他方式
      console.warn('无法获取文件夹内容，请确保MCP服务器正常运行')
    }

    folderContents.value = files

    // 添加浏览成功消息到对话
    if (files.length > 0) {
      conversation.push({
        role: 'assistant',
        content: `已成功浏览文件夹：${selectedFolderPath.value}\n\n找到 ${files.length} 个项目，包括：\n${files.map(f => `- ${f.name} (${f.type === 'folder' ? '文件夹' : '文件'})`).join('\n')}\n\n您可以点击"查询"按钮来分析具体文件内容。`,
        timestamp: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
    }
  } catch (error) {
    console.error('浏览文件夹失败:', error)
    folderContents.value = []
  }
}

const selectFile = (item: any) => {
  if (item.type === 'folder') {
    selectedFolderPath.value = item.path
    browseFolder()
  } else {
    currentMessage.value = `请分析文件：${item.path}`
  }
}

const queryFile = (item: any) => {
  if (item.type === 'folder') {
    currentMessage.value = `请分析文件夹 ${item.name} 的结构和内容`
  } else {
    currentMessage.value = `请详细分析文件 ${item.name} 的内容、功能和代码质量`
  }

  // 自动发送消息
  sendMessage()
}

const viewResultDetail = (id: number) => {
  console.log('查看分析结果详情:', id)
  // 实现查看详情逻辑
}

// 工具函数
const getResultTypeClass = (type: string) => {
  switch (type) {
    case '架构分析':
      return 'bg-blue-100 text-blue-800'
    case '需求分析':
      return 'bg-green-100 text-green-800'
    case '质量分析':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>
