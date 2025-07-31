<template>
  <div class="mcp-demo-page min-h-screen bg-gray-100">
    <!-- 页面头部 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">MCP优化方案演示</h1>
            <p class="mt-1 text-sm text-gray-500">
              展示服务器端自动端口分配 + 客户端自动发现的完整解决方案
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-500">
              <div>项目路径: {{ projectPath }}</div>
              <div>当前时间: {{ currentTime }}</div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- 功能介绍卡片 -->
      <div class="mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">🚀 核心功能特性</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="feature-card">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                      <span class="text-blue-600 font-semibold">🔧</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-sm font-medium text-gray-900">自动端口分配</h3>
                    <p class="text-sm text-gray-500">服务器自动寻找可用端口启动</p>
                  </div>
                </div>
              </div>
              
              <div class="feature-card">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                      <span class="text-green-600 font-semibold">🔍</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-sm font-medium text-gray-900">智能服务发现</h3>
                    <p class="text-sm text-gray-500">客户端自动发现并连接服务器</p>
                  </div>
                </div>
              </div>
              
              <div class="feature-card">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                      <span class="text-purple-600 font-semibold">🔄</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-sm font-medium text-gray-900">自动重连机制</h3>
                    <p class="text-sm text-gray-500">连接断开时自动尝试重连</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 服务器状态监控 -->
      <div class="mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">📊 服务器状态监控</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="stat-card bg-blue-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ serverStats.port || 'N/A' }}</div>
                <div class="text-sm text-blue-800">当前端口</div>
              </div>
              
              <div class="stat-card bg-green-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ serverStats.clients || 0 }}</div>
                <div class="text-sm text-green-800">连接客户端</div>
              </div>
              
              <div class="stat-card bg-purple-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">{{ serverStats.uptime || 0 }}s</div>
                <div class="text-sm text-purple-800">运行时间</div>
              </div>
              
              <div class="stat-card bg-yellow-50 p-4 rounded-lg">
                <div class="text-2xl font-bold text-yellow-600">{{ serverStats.status || 'Unknown' }}</div>
                <div class="text-sm text-yellow-800">服务状态</div>
              </div>
            </div>
            
            <div class="mt-4 flex space-x-3">
              <button 
                @click="refreshServerStats"
                :disabled="refreshing"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {{ refreshing ? '刷新中...' : '刷新状态' }}
              </button>
              
              <button 
                @click="openServerLogs"
                class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                查看服务器日志
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MCP客户端演示组件 -->
      <div class="mb-8">
        <MCPClientDemo />
      </div>

      <!-- 技术说明 -->
      <div class="mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">📚 技术实现说明</h2>
            <div class="prose max-w-none">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 class="text-base font-semibold text-gray-900 mb-2">服务器端优化</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 自动扫描{{ serverConfig.mcp.portRange.start }}-{{ serverConfig.mcp.portRange.end }}端口范围</li>
                    <li>• 生成 <code>.mcp-port.json</code> 端口信息文件</li>
                    <li>• 实时更新 <code>.mcp-status.json</code> 状态文件</li>
                    <li>• 提供 <code>/health</code> 和 <code>/api/status</code> 端点</li>
                    <li>• 支持进程ID记录和管理</li>
                  </ul>
                </div>
                
                <div>
                  <h3 class="text-base font-semibold text-gray-900 mb-2">客户端端优化</h3>
                  <ul class="text-sm text-gray-600 space-y-1">
                    <li>• 优先读取端口信息文件</li>
                    <li>• HTTP健康检查验证服务可用性</li>
                    <li>• 端口范围扫描作为备用方案</li>
                    <li>• 智能重连和错误处理</li>
                    <li>• 事件驱动的状态管理</li>
                  </ul>
                </div>
              </div>
              
              <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 class="text-sm font-semibold text-gray-900 mb-2">🔧 启动命令</h4>
                <div class="text-sm text-gray-600 font-mono">
                  <div>服务器: <code>node mcp-server-optimized.js</code></div>
                  <div>批处理: <code>start-mcp-optimized.bat</code></div>
                  <div>停止服务: <code>stop-mcp-optimized.bat</code></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 文件结构说明 -->
      <div class="mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">📁 项目文件结构</h2>
            <div class="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
              <pre>{{ fileStructure }}</pre>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MCPClientDemo from '../components/MCPClientDemo.vue'
import { getServerConfig } from '../config/app.config'

// 类型定义
interface ServerStats {
  port: number | null
  clients: number
  uptime: number
  status: string
}

// 获取配置
const serverConfig = getServerConfig()

// 响应式数据
const projectPath = ref('E:\\XMjiucuo')
const currentTime = ref(new Date().toLocaleString())
const serverStats = ref<ServerStats>({
  port: null,
  clients: 0,
  uptime: 0,
  status: 'Unknown'
})
const refreshing = ref(false)

// 文件结构说明
const fileStructure = `项目根目录/
├── mcp-server-optimized.js          # 优化版MCP服务器
├── start-mcp-optimized.bat          # 启动脚本
├── stop-mcp-optimized.bat           # 停止脚本
├── test-simple.cjs                  # 功能测试脚本
├── .mcp-port.json                   # 端口信息文件 (自动生成)
├── .mcp-status.json                 # 状态信息文件 (自动生成)
├── MCP-优化方案使用指南.md           # 使用指南
└── src/
    ├── components/
    │   └── MCPClientDemo.vue        # MCP客户端演示组件
    ├── pages/
    │   └── MCPDemo.vue              # 演示页面 (当前页面)
    └── utils/
        ├── mcpClient.ts             # 原始MCP客户端
        └── mcpClientOptimized.ts    # 优化版MCP客户端`

// 定时器
let timeInterval: NodeJS.Timeout | null = null
let statsInterval: NodeJS.Timeout | null = null

// 更新当前时间
const updateTime = () => {
  currentTime.value = new Date().toLocaleString()
}

// 刷新服务器状态
const refreshServerStats = async () => {
  refreshing.value = true
  
  try {
    // 尝试读取状态文件
    const response = await fetch('/api/mcp-status')
    if (response.ok) {
      const stats = await response.json()
      serverStats.value = {
        port: stats.port,
        clients: stats.clients,
        uptime: Math.round(stats.uptime),
        status: stats.status
      }
    } else {
      // 如果API不可用，尝试直接访问MCP服务器
      await fetchMCPServerStats()
    }
  } catch (error) {
    console.warn('无法获取服务器状态:', error)
    await fetchMCPServerStats()
  } finally {
    refreshing.value = false
  }
}

// 直接从MCP服务器获取状态
const fetchMCPServerStats = async () => {
  try {
    // 尝试常见端口
    const ports = []
    for (let port = serverConfig.mcp.portRange.start; port <= Math.min(serverConfig.mcp.portRange.start + 4, serverConfig.mcp.portRange.end); port++) {
      ports.push(port)
    }
    
    for (const port of ports) {
      try {
        const response = await fetch(`http://${serverConfig.mcp.host}:${port}/api/status`)
        if (response.ok) {
          const stats = await response.json()
          serverStats.value = {
            port: stats.port,
            clients: stats.clients,
            uptime: Math.round(stats.uptime),
            status: stats.status
          }
          break
        }
      } catch {
        // 继续尝试下一个端口
      }
    }
  } catch (error) {
    console.warn('无法连接到MCP服务器:', error)
  }
}

// 打开服务器日志
const openServerLogs = () => {
  // 这里可以实现打开日志文件或日志查看器的功能
  alert('服务器日志功能待实现\n\n可以通过以下方式查看日志:\n1. 检查控制台输出\n2. 查看 mcp-server.log 文件\n3. 使用 Windows 事件查看器')
}

// 组件挂载
onMounted(() => {
  // 启动时间更新定时器
  timeInterval = setInterval(updateTime, 1000)
  
  // 启动状态刷新定时器
  statsInterval = setInterval(refreshServerStats, 10000)
  
  // 初始加载
  refreshServerStats()
})

// 组件卸载
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (statsInterval) {
    clearInterval(statsInterval)
  }
})
</script>

<style scoped>
.feature-card {
  transition: transform 0.2s ease-in-out;
}

.feature-card:hover {
  transform: translateY(-2px);
}

.stat-card {
  transition: all 0.2s ease-in-out;
}

.stat-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

code {
  background-color: #f3f4f6;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.875em;
}

pre {
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>