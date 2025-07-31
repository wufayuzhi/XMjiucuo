<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">系统配置</h1>
      <p class="text-gray-600">全局参数设置、用户偏好配置、系统监控</p>
    </div>

    <!-- 配置导航 -->
    <div class="bg-white rounded-lg shadow-sm border mb-6">
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8 px-6" aria-label="配置选项">
          <button
            v-for="tab in configTabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            "
          >
            <component :is="tab.icon" class="w-5 h-5 mr-2 inline" />
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </div>

    <!-- 配置内容 -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <!-- 全局设置 -->
      <div v-if="activeTab === 'global'" class="space-y-8">
        <div>
          <h2
            class="text-xl font-semibold text-gray-900 mb-6 flex items-center"
          >
            <Globe class="w-5 h-5 mr-2 text-blue-600" />
            全局设置
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 基础配置 -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900">基础配置</h3>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >系统语言</label
                >
                <select
                  v-model="globalConfig.language"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                  <option value="ja-JP">日本語</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >时区设置</label
                >
                <select
                  v-model="globalConfig.timezone"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="Asia/Shanghai">北京时间 (UTC+8)</option>
                  <option value="America/New_York">纽约时间 (UTC-5)</option>
                  <option value="Europe/London">伦敦时间 (UTC+0)</option>
                  <option value="Asia/Tokyo">东京时间 (UTC+9)</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >主题模式</label
                >
                <div class="flex space-x-4">
                  <label class="flex items-center">
                    <input
                      v-model="globalConfig.theme"
                      type="radio"
                      value="light"
                      class="mr-2"
                    />
                    <span class="text-sm">浅色模式</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="globalConfig.theme"
                      type="radio"
                      value="dark"
                      class="mr-2"
                    />
                    <span class="text-sm">深色模式</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="globalConfig.theme"
                      type="radio"
                      value="auto"
                      class="mr-2"
                    />
                    <span class="text-sm">跟随系统</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    v-model="globalConfig.autoSave"
                    type="checkbox"
                    class="mr-2"
                  />
                  <span class="text-sm font-medium text-gray-700"
                    >启用自动保存</span
                  >
                </label>
                <p class="text-xs text-gray-500 mt-1">
                  每5分钟自动保存配置更改
                </p>
              </div>
            </div>

            <!-- 性能配置 -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900">性能配置</h3>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >最大并发任务数</label
                >
                <input
                  v-model="globalConfig.maxConcurrentTasks"
                  type="number"
                  min="1"
                  max="20"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >缓存大小 (MB)</label
                >
                <input
                  v-model="globalConfig.cacheSize"
                  type="number"
                  min="100"
                  max="2048"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >日志级别</label
                >
                <select
                  v-model="globalConfig.logLevel"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="error">错误</option>
                  <option value="warn">警告</option>
                  <option value="info">信息</option>
                  <option value="debug">调试</option>
                </select>
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    v-model="globalConfig.enableMetrics"
                    type="checkbox"
                    class="mr-2"
                  />
                  <span class="text-sm font-medium text-gray-700"
                    >启用性能监控</span
                  >
                </label>
                <p class="text-xs text-gray-500 mt-1">
                  收集系统性能指标用于优化
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MCP配置 -->
      <div v-if="activeTab === 'mcp'" class="space-y-8">
        <div>
          <h2
            class="text-xl font-semibold text-gray-900 mb-6 flex items-center"
          >
            <Zap class="w-5 h-5 mr-2 text-purple-600" />
            MCP服务配置
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 连接配置 -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900">连接配置</h3>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >服务地址</label
                >
                <input
                  v-model="mcpConfig.serverUrl"
                  type="url"
                  :placeholder="`http://${serverConfig.mcp.host}:${serverConfig.mcp.defaultPort}`"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >连接超时 (秒)</label
                >
                <input
                  v-model="mcpConfig.timeout"
                  type="number"
                  min="5"
                  max="60"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >重试次数</label
                >
                <input
                  v-model="mcpConfig.retryCount"
                  type="number"
                  min="0"
                  max="10"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    v-model="mcpConfig.autoReconnect"
                    type="checkbox"
                    class="mr-2"
                  />
                  <span class="text-sm font-medium text-gray-700"
                    >自动重连</span
                  >
                </label>
              </div>
            </div>

            <!-- 功能配置 -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900">功能配置</h3>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >偏离检测敏感度</label
                >
                <input
                  v-model="mcpConfig.deviationSensitivity"
                  type="range"
                  min="0"
                  max="100"
                  class="w-full"
                />
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>低敏感</span>
                  <span>{{ mcpConfig.deviationSensitivity }}%</span>
                  <span>高敏感</span>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >快照频率 (分钟)</label
                >
                <select
                  v-model="mcpConfig.snapshotInterval"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option 
                    v-for="option in timeIntervalOptions" 
                    :key="option.value" 
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >数据保留期 (天)</label
                >
                <input
                  v-model="mcpConfig.dataRetentionDays"
                  type="number"
                  min="7"
                  max="365"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700"
                  >启用功能</label
                >
                <div class="space-y-1">
                  <label class="flex items-center">
                    <input
                      v-model="mcpConfig.enableRealTimeMonitoring"
                      type="checkbox"
                      class="mr-2"
                    />
                    <span class="text-sm">实时监控</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="mcpConfig.enableAutoCorrection"
                      type="checkbox"
                      class="mr-2"
                    />
                    <span class="text-sm">自动纠正</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="mcpConfig.enableNotifications"
                      type="checkbox"
                      class="mr-2"
                    />
                    <span class="text-sm">通知提醒</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户偏好 -->
      <div v-if="activeTab === 'user'" class="space-y-8">
        <div>
          <h2
            class="text-xl font-semibold text-gray-900 mb-6 flex items-center"
          >
            <User class="w-5 h-5 mr-2 text-green-600" />
            用户偏好
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 界面偏好 -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900">界面偏好</h3>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >默认页面</label
                >
                <select
                  v-model="userPreferences.defaultPage"
                  class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option 
                    v-for="option in defaultPageOptions" 
                    :key="option.value" 
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >侧边栏位置</label
                >
                <div class="flex space-x-4">
                  <label 
                    v-for="option in sidebarPositionOptions" 
                    :key="option.value" 
                    class="flex items-center"
                  >
                    <input
                      v-model="userPreferences.sidebarPosition"
                      type="radio"
                      :value="option.value"
                      class="mr-2"
                    />
                    <span class="text-sm">{{ option.label }}</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >页面密度</label
                >
                <div class="flex space-x-4">
                    <label 
                      v-for="option in pageDensityOptions" 
                      :key="option.value" 
                      class="flex items-center"
                    >
                      <input
                        v-model="userPreferences.density"
                        type="radio"
                        :value="option.value"
                        class="mr-2"
                      />
                      <span class="text-sm">{{ option.label }}</span>
                    </label>
                  </div>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700"
                  >显示选项</label
                >
                <div class="space-y-1">
                  <label class="flex items-center">
                    <input
                      v-model="userPreferences.showTooltips"
                      type="checkbox"
                      class="mr-2"
                    />
                    <span class="text-sm">显示工具提示</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="userPreferences.showAnimations"
                      type="checkbox"
                      class="mr-2"
                    />
                    <span class="text-sm">启用动画效果</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="userPreferences.showShortcuts"
                      type="checkbox"
                      class="mr-2"
                    />
                    <span class="text-sm">显示快捷键</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- 通知偏好 -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900">通知偏好</h3>

              <div class="space-y-3">
                <div
                  class="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div class="font-medium text-sm">偏离预警</div>
                    <div class="text-xs text-gray-500">
                      项目偏离核心目标时通知
                    </div>
                  </div>
                  <label
                    class="relative inline-flex items-center cursor-pointer"
                  >
                    <input
                      v-model="userPreferences.notifications.deviation"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                    />
                  </label>
                </div>

                <div
                  class="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div class="font-medium text-sm">需求变更</div>
                    <div class="text-xs text-gray-500">需求发生变更时通知</div>
                  </div>
                  <label
                    class="relative inline-flex items-center cursor-pointer"
                  >
                    <input
                      v-model="userPreferences.notifications.requirements"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                    />
                  </label>
                </div>

                <div
                  class="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div class="font-medium text-sm">系统更新</div>
                    <div class="text-xs text-gray-500">系统版本更新时通知</div>
                  </div>
                  <label
                    class="relative inline-flex items-center cursor-pointer"
                  >
                    <input
                      v-model="userPreferences.notifications.updates"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                  >通知方式</label
                >
                <div class="space-y-1">
                  <label class="flex items-center">
                    <input
                      v-model="userPreferences.notificationMethods"
                      type="checkbox"
                      value="browser"
                      class="mr-2"
                    />
                    <span class="text-sm">浏览器通知</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="userPreferences.notificationMethods"
                      type="checkbox"
                      value="email"
                      class="mr-2"
                    />
                    <span class="text-sm">邮件通知</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="userPreferences.notificationMethods"
                      type="checkbox"
                      value="sound"
                      class="mr-2"
                    />
                    <span class="text-sm">声音提醒</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统监控 -->
      <div v-if="activeTab === 'monitoring'" class="space-y-8">
        <div>
          <h2
            class="text-xl font-semibold text-gray-900 mb-6 flex items-center"
          >
            <Activity class="w-5 h-5 mr-2 text-red-600" />
            系统监控
          </h2>

          <!-- 系统状态 -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-green-800">CPU使用率</p>
                  <p class="text-2xl font-bold text-green-900">
                    {{ systemStatus.cpu }}%
                  </p>
                </div>
                <Cpu class="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-blue-800">内存使用</p>
                  <p class="text-2xl font-bold text-blue-900">
                    {{ systemStatus.memory }}%
                  </p>
                </div>
                <HardDrive class="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-purple-800">网络延迟</p>
                  <p class="text-2xl font-bold text-purple-900">
                    {{ systemStatus.latency }}ms
                  </p>
                </div>
                <Wifi class="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-orange-800">运行时间</p>
                  <p class="text-2xl font-bold text-orange-900">
                    {{ systemStatus.uptime }}
                  </p>
                </div>
                <Clock class="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <!-- 服务连接状态 -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-gray-900 mb-4">服务连接状态</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-800">MCP服务</p>
                    <p class="text-2xl font-bold" :class="systemStatus.mcpConnected ? 'text-green-900' : 'text-red-900'">
                      {{ systemStatus.mcpConnected ? '已连接' : '未连接' }}
                    </p>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ systemStatus.mcpConnected ? 'MCP服务运行正常' : '请检查MCP服务是否启动' }}
                    </p>
                  </div>
                  <div :class="systemStatus.mcpConnected ? 'w-4 h-4 bg-green-500 rounded-full' : 'w-4 h-4 bg-red-500 rounded-full'"></div>
                </div>
              </div>

              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-800">API服务</p>
                    <p class="text-2xl font-bold" :class="systemStatus.apiConnected ? 'text-green-900' : 'text-gray-600'">
                      {{ systemStatus.apiConnected ? '已连接' : '待检测' }}
                    </p>
                    <p class="text-sm text-gray-600 mt-1">
                      {{ systemStatus.apiConnected ? 'API服务运行正常' : '请在DeepSeek页面测试API连接' }}
                    </p>
                  </div>
                  <div :class="systemStatus.apiConnected ? 'w-4 h-4 bg-green-500 rounded-full' : 'w-4 h-4 bg-gray-400 rounded-full'"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 日志查看 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">系统日志</h3>
              <div
                class="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm"
              >
                <div v-for="log in systemLogs" :key="log.id" class="mb-1">
                  <span class="text-gray-500">[{{ log.timestamp }}]</span>
                  <span :class="getLogLevelClass(log.level)">{{
                    log.level.toUpperCase()
                  }}</span>
                  <span class="ml-2">{{ log.message }}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">性能指标</h3>
              <div class="space-y-4">
                <div
                  v-for="metric in performanceMetrics"
                  :key="metric.name"
                  class=""
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-sm font-medium text-gray-700">{{
                      metric.name
                    }}</span>
                    <span class="text-sm text-gray-500"
                      >{{ metric.value }}{{ metric.unit }}</span
                    >
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="h-2 rounded-full"
                      :class="getMetricBarClass(metric.status)"
                      :style="{ width: metric.percentage + '%' }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div
        class="flex items-center justify-between pt-6 border-t border-gray-200"
      >
        <div class="flex space-x-3">
          <button
            @click="resetToDefaults"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center"
          >
            <RotateCcw class="w-4 h-4 mr-1" />
            重置默认
          </button>
          <button
            @click="exportConfig"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center"
          >
            <Download class="w-4 h-4 mr-1" />
            导出配置
          </button>
          <button
            @click="importConfig"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center"
          >
            <Upload class="w-4 h-4 mr-1" />
            导入配置
          </button>
        </div>

        <div class="flex space-x-3">
          <button
            @click="cancelChanges"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            取消
          </button>
          <button
            @click="saveConfig"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <Save class="w-4 h-4 mr-1" />
            保存配置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { mcpClient } from '../utils/mcpClient'
import { getSystemConfig, getServerConfig, getMonitoringConfig, getDevelopmentConfig } from '../config/app.config'
import {
  getTimeIntervalOptions,
  getDefaultPageOptions,
  getSidebarPositionOptions,
  getDensityOptions,
  getNotificationTypes,
  getDefaultGlobalConfig,
  getDefaultMcpConfig,
  getDefaultUserPreferences,
  getDefaultSystemLogs,
  getDefaultPerformanceMetrics,
  getLogLevelOptions,
  getDataRetentionOptions,
  getSensitivityOptions,
  pageTexts,
  getLogLevelClass,
  getMetricBarClass
} from '../config/system.config'
import {
  Globe,
  Zap,
  User,
  Activity,
  Save,
  RotateCcw,
  Download,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
} from 'lucide-vue-next'

// 获取配置
const systemConfig = getSystemConfig()
const serverConfig = getServerConfig()
const monitoringConfig = getMonitoringConfig()
const developmentConfig = getDevelopmentConfig()

// 配置选项
const timeIntervalOptions = getTimeIntervalOptions()
const defaultPageOptions = getDefaultPageOptions()
const sidebarPositionOptions = getSidebarPositionOptions()
const pageDensityOptions = getDensityOptions()
const notificationTypes = getNotificationTypes()
const logLevelOptions = getLogLevelOptions()
const dataRetentionOptions = getDataRetentionOptions()
const sensitivityOptions = getSensitivityOptions()

// 响应式数据
const activeTab = ref('global')

// 配置选项卡
const configTabs = [
  { id: 'global', name: '全局设置', icon: Globe },
  { id: 'mcp', name: 'MCP配置', icon: Zap },
  { id: 'user', name: '用户偏好', icon: User },
  { id: 'monitoring', name: '系统监控', icon: Activity },
]

// 全局配置
const globalConfig = reactive({
  language: systemConfig.language,
  timezone: systemConfig.timezone,
  theme: systemConfig.theme,
  autoSave: developmentConfig.autoSave,
  maxConcurrentTasks: systemConfig.performance.maxConcurrentTasks,
  cacheSize: systemConfig.performance.cacheSize,
  logLevel: developmentConfig.logLevel,
  enableMetrics: developmentConfig.enableMetrics,
})

// MCP配置
const mcpConfig = reactive({
  serverUrl: `http://${serverConfig.mcp.host}:${serverConfig.mcp.defaultPort}`,
  timeout: serverConfig.timeout.connection / 1000, // 转换为秒
  retryCount: monitoringConfig.healthCheck.retryCount,
  autoReconnect: true,
  deviationSensitivity: monitoringConfig.deviation.sensitivity,
  snapshotInterval: systemConfig.retention.snapshotInterval,
  dataRetentionDays: systemConfig.retention.sessionDays,
  enableRealTimeMonitoring: monitoringConfig.deviation.realTimeMonitoring,
  enableAutoCorrection: monitoringConfig.deviation.autoCorrection,
  enableNotifications: true,
})

// 用户偏好
const userPreferences = reactive({
  defaultPage: 'dashboard',
  sidebarPosition: 'left',
  density: 'normal',
  showTooltips: true,
  showAnimations: true,
  showShortcuts: true,
  notifications: {
    deviation: true,
    requirements: true,
    updates: false,
  },
  notificationMethods: ['browser', 'sound'],
})

// 系统状态
const systemStatus = reactive({
  cpu: 45,
  memory: 68,
  latency: 12,
  uptime: '2天3小时',
  mcpConnected: false,
  apiConnected: false,
})

// 服务状态检测
const checkServiceStatus = async () => {
  try {
    // 检测MCP连接状态
    const mcpStatus = mcpClient.getStatus()
    systemStatus.mcpConnected = mcpStatus.connected
    
    if (!mcpStatus.connected) {
      try {
        await mcpClient.connect()
        systemStatus.mcpConnected = true
        addSystemLog('info', 'MCP服务连接成功')
      } catch (error) {
        systemStatus.mcpConnected = false
        addSystemLog('error', 'MCP服务连接失败 - 请检查服务是否启动')
      }
    } else {
      addSystemLog('info', 'MCP服务状态正常')
    }
  } catch (error) {
    console.error('服务状态检测失败:', error)
    addSystemLog('error', '服务状态检测失败')
  }
}

// 添加系统日志
const addSystemLog = (level: string, message: string) => {
  const now = new Date()
  const timestamp = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  systemLogs.unshift({
    id: Date.now(),
    timestamp,
    level,
    message
  })
  
  // 保持日志数量在合理范围内
  if (systemLogs.length > 20) {
    systemLogs.splice(20)
  }
}

// 系统日志
const systemLogs = reactive([
  { id: 1, timestamp: '14:30:25', level: 'warn', message: 'MCP服务连接状态未知 - 需要实时检测' },
  {
    id: 2,
    timestamp: '14:29:18',
    level: 'info',
    message: '系统配置页面已加载',
  },
  { id: 3, timestamp: '14:28:45', level: 'info', message: '等待服务状态检测...' },
  {
    id: 4,
    timestamp: '14:27:32',
    level: 'warn',
    message: '建议启用实时状态监控',
  },
  { id: 5, timestamp: '14:26:15', level: 'info', message: '用户配置已更新' },
])

// 性能指标
const performanceMetrics = reactive([
  { name: '响应时间', value: 120, unit: 'ms', percentage: 75, status: 'good' },
  {
    name: '吞吐量',
    value: 450,
    unit: 'req/min',
    percentage: 85,
    status: 'good',
  },
  { name: '错误率', value: 0.5, unit: '%', percentage: 5, status: 'excellent' },
  {
    name: '可用性',
    value: 99.9,
    unit: '%',
    percentage: 99,
    status: 'excellent',
  },
])

// 方法
const saveConfig = () => {
  console.log('保存配置')
  // 实现配置保存逻辑
}

const cancelChanges = () => {
  console.log('取消更改')
  // 实现取消更改逻辑
}

const resetToDefaults = () => {
  console.log('重置为默认配置')
  // 实现重置默认配置逻辑
}

const exportConfig = () => {
  console.log('导出配置')
  // 实现配置导出逻辑
}

const importConfig = () => {
  console.log('导入配置')
  // 实现配置导入逻辑
}



// 页面加载时检测服务状态
onMounted(() => {
  addSystemLog('info', '系统配置页面已加载')
  checkServiceStatus()
})
</script>
