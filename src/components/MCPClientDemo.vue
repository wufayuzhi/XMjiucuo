<template>
  <div class="mcp-client-demo p-6 bg-white rounded-lg shadow-lg">
    <div class="header mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">MCP客户端演示</h2>
      <p class="text-gray-600">展示优化版MCP客户端的自动发现和连接功能</p>
    </div>

    <!-- 连接状态 -->
    <div class="connection-status mb-6">
      <div class="flex items-center gap-3 mb-3">
        <div 
          :class="[
            'w-3 h-3 rounded-full',
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          ]"
        ></div>
        <span class="font-medium">
          状态: {{ getStatusText(connectionStatus) }}
        </span>
      </div>
      
      <div v-if="serverInfo" class="bg-gray-50 p-3 rounded text-sm">
        <div><strong>服务器地址:</strong> {{ serverInfo.url }}</div>
        <div><strong>端口:</strong> {{ serverInfo.port }}</div>
        <div><strong>发现方式:</strong> {{ serverInfo.discoveryMethod }}</div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="controls mb-6">
      <div class="flex gap-3">
        <button 
          @click="connect"
          :disabled="connectionStatus === 'connecting'"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ connectionStatus === 'connected' ? '重新连接' : '连接' }}
        </button>
        
        <button 
          @click="disconnect"
          :disabled="connectionStatus === 'disconnected'"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          断开连接
        </button>
        
        <button 
          @click="getStatus"
          :disabled="connectionStatus !== 'connected'"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          获取状态
        </button>
      </div>
    </div>

    <!-- MCP工具测试 -->
    <div class="tools-section mb-6">
      <h3 class="text-lg font-semibold mb-3">MCP工具测试</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="tool-card p-4 border rounded">
          <h4 class="font-medium mb-2">获取项目上下文</h4>
          <button 
            @click="testGetProjectContext"
            :disabled="connectionStatus !== 'connected' || loading"
            class="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50"
          >
            {{ loading ? '执行中...' : '执行' }}
          </button>
        </div>
        
        <div class="tool-card p-4 border rounded">
          <h4 class="font-medium mb-2">分析偏差</h4>
          <button 
            @click="testAnalyzeDeviation"
            :disabled="connectionStatus !== 'connected' || loading"
            class="px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600 disabled:opacity-50"
          >
            {{ loading ? '执行中...' : '执行' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 日志输出 -->
    <div class="logs-section">
      <h3 class="text-lg font-semibold mb-3">操作日志</h3>
      <div class="logs bg-gray-900 text-green-400 p-4 rounded h-64 overflow-y-auto font-mono text-sm">
        <div v-for="(log, index) in logs" :key="index" class="mb-1">
          <span class="text-gray-500">[{{ log.timestamp }}]</span>
          <span :class="getLogClass(log.level)">{{ log.message }}</span>
        </div>
        <div v-if="logs.length === 0" class="text-gray-500">
          等待操作日志...
        </div>
      </div>
      
      <button 
        @click="clearLogs"
        class="mt-2 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
      >
        清空日志
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import MCPClientOptimized from '../utils/mcpClientOptimized'

// 类型定义
interface LogEntry {
  timestamp: string
  level: string
  message: string
}

interface ServerInfo {
  url: string
  port: number
  discoveryMethod: string
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

// 响应式数据
const connectionStatus = ref<ConnectionStatus>('disconnected')
const serverInfo = ref<ServerInfo | null>(null)
const loading = ref(false)
const logs = ref<LogEntry[]>([])

// MCP客户端实例
let mcpClient: MCPClientOptimized | null = null

// 添加日志
const addLog = (level: string, message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push({ timestamp, level, message })
  
  // 保持最多100条日志
  if (logs.value.length > 100) {
    logs.value.shift()
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap = {
    'disconnected': '未连接',
    'connecting': '连接中',
    'connected': '已连接'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

// 获取日志样式类
const getLogClass = (level: string) => {
  const classMap = {
    'info': 'text-blue-400',
    'success': 'text-green-400',
    'warning': 'text-yellow-400',
    'error': 'text-red-400'
  }
  return classMap[level as keyof typeof classMap] || 'text-gray-400'
}

// 连接到MCP服务器
const connect = async () => {
  try {
    connectionStatus.value = 'connecting'
    addLog('info', '开始连接MCP服务器...')
    
    // 创建新的客户端实例
    mcpClient = new MCPClientOptimized()
    
    // 设置事件监听器
    mcpClient.on('connected', (info) => {
      connectionStatus.value = 'connected'
      serverInfo.value = info
      addLog('success', `连接成功: ${info.url} (${info.discoveryMethod})`)
    })
    
    mcpClient.on('disconnected', () => {
      connectionStatus.value = 'disconnected'
      serverInfo.value = null
      addLog('warning', '连接已断开')
    })
    
    mcpClient.on('error', (error) => {
      addLog('error', `连接错误: ${error.message}`)
    })
    
    mcpClient.on('reconnecting', (attempt) => {
      addLog('info', `重连尝试 #${attempt}`)
    })
    
    // 开始连接
    await mcpClient.connect()
    
  } catch (error: any) {
    connectionStatus.value = 'disconnected'
    addLog('error', `连接失败: ${error.message}`)
  }
}

// 断开连接
const disconnect = async () => {
  if (mcpClient) {
    await mcpClient.disconnect()
    mcpClient = null
    addLog('info', '主动断开连接')
  }
}

// 获取服务器状态
const getStatus = async () => {
  if (!mcpClient) return
  
  try {
    loading.value = true
    addLog('info', '获取服务器状态...')
    
    const status = await mcpClient.getStatus()
    addLog('success', `服务器状态: ${JSON.stringify(status, null, 2)}`)
    
  } catch (error: any) {
    addLog('error', `获取状态失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// 测试获取项目上下文
const testGetProjectContext = async () => {
  if (!mcpClient) return
  
  try {
    loading.value = true
    addLog('info', '执行获取项目上下文...')
    
    const result = await mcpClient.callTool('get_project_context', {})
    
    addLog('success', `项目上下文获取成功: ${JSON.stringify(result, null, 2)}`)
    
  } catch (error: any) {
    addLog('error', `获取项目上下文失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// 测试分析偏差
const testAnalyzeDeviation = async () => {
  if (!mcpClient) return
  
  try {
    loading.value = true
    addLog('info', '执行分析偏差...')
    
    const result = await mcpClient.callTool('analyze_deviation', {
      current_code: 'console.log("Hello World")',
      expected_behavior: '输出Hello World到控制台'
    })
    
    addLog('success', `偏差分析完成: ${JSON.stringify(result, null, 2)}`)
    
  } catch (error: any) {
    addLog('error', `分析偏差失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// 清空日志
const clearLogs = () => {
  logs.value = []
  addLog('info', '日志已清空')
}

// 组件挂载时自动连接
onMounted(() => {
  addLog('info', 'MCP客户端演示组件已加载')
  // 可以选择自动连接
  // connect()
})

// 组件卸载时断开连接
onUnmounted(() => {
  if (mcpClient) {
    mcpClient.disconnect()
  }
})
</script>

<style scoped>
.mcp-client-demo {
  max-width: 800px;
  margin: 0 auto;
}

.logs {
  scrollbar-width: thin;
  scrollbar-color: #4a5568 #2d3748;
}

.logs::-webkit-scrollbar {
  width: 6px;
}

.logs::-webkit-scrollbar-track {
  background: #2d3748;
}

.logs::-webkit-scrollbar-thumb {
  background: #4a5568;
  border-radius: 3px;
}

.logs::-webkit-scrollbar-thumb:hover {
  background: #718096;
}
</style>