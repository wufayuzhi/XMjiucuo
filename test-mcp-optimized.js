#!/usr/bin/env node

/**
 * MCP优化方案测试脚本
 * 验证自动端口分配和客户端自动发现功能
 */

import { promises as fs } from 'fs'
import path from 'path'
import { getServerConfig } from './config/app.config.js'

class MCPOptimizedTester {
  constructor() {
    this.projectPath = process.cwd()
    this.portFile = path.join(this.projectPath, '.mcp-port.json')
    this.statusFile = path.join(this.projectPath, '.mcp-status.json')
    this.serverConfig = getServerConfig()
  }

  /**
   * 测试端口信息文件读取
   */
  async testPortFileReading() {
    console.log('\n=== 测试端口信息文件读取 ===')
    
    try {
      if (await this.fileExists(this.portFile)) {
        const portInfo = JSON.parse(await fs.readFile(this.portFile, 'utf-8'))
        console.log('✅ 端口信息文件读取成功:')
        console.log('   端口:', portInfo.port)
        console.log('   WebSocket URL:', portInfo.wsUrl)
        console.log('   HTTP URL:', portInfo.httpUrl)
        console.log('   进程ID:', portInfo.pid)
        console.log('   启动时间:', portInfo.startTime)
        return portInfo
      } else {
        console.log('❌ 端口信息文件不存在:', this.portFile)
        return null
      }
    } catch (error) {
      console.log('❌ 读取端口信息文件失败:', error.message)
      return null
    }
  }

  /**
   * 测试状态信息文件读取
   */
  async testStatusFileReading() {
    console.log('\n=== 测试状态信息文件读取 ===')
    
    try {
      if (await this.fileExists(this.statusFile)) {
        const statusInfo = JSON.parse(await fs.readFile(this.statusFile, 'utf-8'))
        console.log('✅ 状态信息文件读取成功:')
        console.log('   状态:', statusInfo.status)
        console.log('   端口:', statusInfo.port)
        console.log('   客户端数量:', statusInfo.clients)
        console.log('   运行时间:', Math.round(statusInfo.uptime), '秒')
        console.log('   最后更新:', statusInfo.lastUpdate)
        return statusInfo
      } else {
        console.log('❌ 状态信息文件不存在:', this.statusFile)
        return null
      }
    } catch (error) {
      console.log('❌ 读取状态信息文件失败:', error.message)
      return null
    }
  }

  /**
   * 测试HTTP健康检查
   */
  async testHealthCheck(port) {
    console.log(`\n=== 测试HTTP健康检查 (端口 ${port}) ===`)
    
    try {
      const response = await fetch(`http://${this.serverConfig.host}:${port}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      
      if (response.ok) {
        const healthData = await response.json()
        console.log('✅ 健康检查成功:')
        console.log('   状态:', healthData.status)
        console.log('   端口:', healthData.port)
        console.log('   运行时间:', Math.round(healthData.uptime), '秒')
        console.log('   时间戳:', healthData.timestamp)
        return healthData
      } else {
        console.log('❌ 健康检查失败，HTTP状态:', response.status)
        return null
      }
    } catch (error) {
      console.log('❌ 健康检查请求失败:', error.message)
      return null
    }
  }

  /**
   * 测试API状态端点
   */
  async testAPIStatus(port) {
    console.log(`\n=== 测试API状态端点 (端口 ${port}) ===`)
    
    try {
      const response = await fetch(`http://${this.serverConfig.host}:${port}/api/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      
      if (response.ok) {
        const statusData = await response.json()
        console.log('✅ API状态检查成功:')
        console.log('   状态:', statusData.status)
        console.log('   端口:', statusData.port)
        console.log('   项目路径:', statusData.projectPath)
        console.log('   客户端数量:', statusData.clients)
        console.log('   进程ID:', statusData.pid)
        console.log('   运行时间:', Math.round(statusData.uptime), '秒')
        return statusData
      } else {
        console.log('❌ API状态检查失败，HTTP状态:', response.status)
        return null
      }
    } catch (error) {
      console.log('❌ API状态请求失败:', error.message)
      return null
    }
  }

  /**
   * 测试端口范围扫描
   */
  async testPortRangeScanning(startPort = this.serverConfig.portRange.start, endPort = this.serverConfig.portRange.end) {
    console.log(`\n=== 测试端口范围扫描 (${startPort}-${endPort}) ===`)
    
    const availablePorts = []
    const mcpPorts = []
    
    for (let port = startPort; port <= endPort; port++) {
      try {
        const response = await fetch(`http://${this.serverConfig.host}:${port}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000)
        })
        
        if (response.ok) {
          const healthData = await response.json()
          availablePorts.push(port)
          
          if (healthData.status === 'healthy') {
            // 进一步验证是否为MCP服务
            try {
              const statusResponse = await fetch(`http://${this.serverConfig.host}:${port}/api/status`)
              if (statusResponse.ok) {
                const statusData = await statusResponse.json()
                if (statusData.status === 'running') {
                  mcpPorts.push(port)
                  console.log(`   ✅ 发现MCP服务: 端口 ${port}`)
                }
              }
            } catch (e) {
              console.log(`   ⚠️  端口 ${port} 有服务但非MCP`)
            }
          }
        }
      } catch (error) {
        // 端口不可用，继续扫描
      }
    }
    
    console.log('\n扫描结果:')
    console.log('   可用端口:', availablePorts.length > 0 ? availablePorts.join(', ') : '无')
    console.log('   MCP端口:', mcpPorts.length > 0 ? mcpPorts.join(', ') : '无')
    
    return { availablePorts, mcpPorts }
  }

  /**
   * 测试WebSocket连接
   */
  async testWebSocketConnection(port) {
    console.log(`\n=== 测试WebSocket连接 (端口 ${port}) ===`)
    
    return new Promise((resolve) => {
      try {
        const ws = new WebSocket(`ws://${this.serverConfig.host}:${port}`)
        let connected = false
        
        const timeout = setTimeout(() => {
          if (!connected) {
            console.log('❌ WebSocket连接超时')
            ws.close()
            resolve(false)
          }
        }, 5000)
        
        ws.onopen = () => {
          connected = true
          clearTimeout(timeout)
          console.log('✅ WebSocket连接成功')
          
          // 发送ping消息
          ws.send(JSON.stringify({
            type: 'ping',
            timestamp: new Date().toISOString()
          }))
        }
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            console.log('   收到消息:', message.type || '未知类型')
            
            if (message.type === 'welcome') {
              console.log('   服务器信息:', message.serverInfo?.name, message.serverInfo?.version)
            }
            
            if (message.type === 'pong') {
              console.log('   Ping响应时间:', new Date().toISOString())
            }
          } catch (e) {
            console.log('   收到非JSON消息:', event.data)
          }
        }
        
        ws.onclose = (event) => {
          console.log('   WebSocket连接关闭，代码:', event.code, '原因:', event.reason || '无')
          resolve(connected)
        }
        
        ws.onerror = (error) => {
          console.log('❌ WebSocket连接错误:', error.message || '未知错误')
          clearTimeout(timeout)
          resolve(false)
        }
        
        // 3秒后主动关闭连接
        setTimeout(() => {
          if (connected) {
            console.log('   主动关闭WebSocket连接')
            ws.close(1000, 'Test completed')
          }
        }, 3000)
        
      } catch (error) {
        console.log('❌ 创建WebSocket连接失败:', error.message)
        resolve(false)
      }
    })
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * 运行完整测试套件
   */
  async runFullTest() {
    console.log('🚀 MCP优化方案测试开始')
    console.log('项目路径:', this.projectPath)
    console.log('测试时间:', new Date().toISOString())
    
    const results = {
      portFileTest: false,
      statusFileTest: false,
      healthCheckTest: false,
      apiStatusTest: false,
      portScanTest: false,
      webSocketTest: false,
      discoveredPort: null
    }
    
    // 1. 测试端口信息文件
    const portInfo = await this.testPortFileReading()
    results.portFileTest = !!portInfo
    
    // 2. 测试状态信息文件
    const statusInfo = await this.testStatusFileReading()
    results.statusFileTest = !!statusInfo
    
    // 3. 确定测试端口
    let testPort = portInfo?.port || this.serverConfig.portRange.start
    
    // 4. 测试HTTP健康检查
    const healthData = await this.testHealthCheck(testPort)
    results.healthCheckTest = !!healthData
    
    // 5. 测试API状态端点
    const apiStatusData = await this.testAPIStatus(testPort)
    results.apiStatusTest = !!apiStatusData
    
    // 6. 测试端口范围扫描
    const scanResults = await this.testPortRangeScanning()
    results.portScanTest = scanResults.mcpPorts.length > 0
    
    if (scanResults.mcpPorts.length > 0) {
      results.discoveredPort = scanResults.mcpPorts[0]
      testPort = results.discoveredPort
    }
    
    // 7. 测试WebSocket连接
    if (results.healthCheckTest || results.portScanTest) {
      results.webSocketTest = await this.testWebSocketConnection(testPort)
    }
    
    // 输出测试总结
    this.printTestSummary(results)
    
    return results
  }

  /**
   * 打印测试总结
   */
  printTestSummary(results) {
    console.log('\n' + '='.repeat(50))
    console.log('📊 测试总结')
    console.log('='.repeat(50))
    
    const tests = [
      { name: '端口信息文件读取', result: results.portFileTest },
      { name: '状态信息文件读取', result: results.statusFileTest },
      { name: 'HTTP健康检查', result: results.healthCheckTest },
      { name: 'API状态端点', result: results.apiStatusTest },
      { name: '端口范围扫描', result: results.portScanTest },
      { name: 'WebSocket连接', result: results.webSocketTest }
    ]
    
    let passedTests = 0
    tests.forEach(test => {
      const status = test.result ? '✅ 通过' : '❌ 失败'
      console.log(`${test.name}: ${status}`)
      if (test.result) passedTests++
    })
    
    console.log('\n总体结果:')
    console.log(`通过: ${passedTests}/${tests.length} (${Math.round(passedTests/tests.length*100)}%)`)
    
    if (results.discoveredPort) {
      console.log(`发现的MCP端口: ${results.discoveredPort}`)
    }
    
    if (passedTests === tests.length) {
      console.log('\n🎉 所有测试通过！MCP优化方案工作正常。')
    } else if (passedTests >= tests.length * 0.5) {
      console.log('\n⚠️  部分测试失败，请检查MCP服务器是否正在运行。')
    } else {
      console.log('\n❌ 大部分测试失败，请检查MCP服务器配置和网络连接。')
    }
    
    console.log('\n建议:')
    if (!results.portFileTest && !results.statusFileTest) {
      console.log('- 启动MCP服务器: node mcp-server-optimized.js')
    }
    if (!results.healthCheckTest && !results.apiStatusTest) {
      console.log('- 检查端口是否被占用: netstat -ano | findstr :3001')
    }
    if (!results.webSocketTest) {
      console.log('- 检查防火墙设置和WebSocket支持')
    }
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new MCPOptimizedTester()
  tester.runFullTest().catch(error => {
    console.error('测试运行失败:', error)
    process.exit(1)
  })
}

export { MCPOptimizedTester }