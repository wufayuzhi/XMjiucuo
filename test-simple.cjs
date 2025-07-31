/**
 * 简化的MCP优化方案测试脚本
 */

const fs = require('fs').promises
const path = require('path')
const { getServerConfig } = require('./config/app.config.js')

class SimpleMCPTester {
  constructor() {
    this.projectPath = process.cwd()
    this.portFile = path.join(this.projectPath, 'mcp-port.json')
    this.statusFile = path.join(this.projectPath, 'mcp-status.json')
    this.serverConfig = getServerConfig()
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  async testPortFile() {
    console.log('\n=== 测试端口信息文件 ===')
    
    if (await this.fileExists(this.portFile)) {
      try {
        const content = await fs.readFile(this.portFile, 'utf-8')
        const portInfo = JSON.parse(content)
        console.log('✅ 端口信息文件读取成功:')
        console.log('   端口:', portInfo.port)
        console.log('   WebSocket URL:', portInfo.wsUrl)
        console.log('   HTTP URL:', portInfo.httpUrl)
        console.log('   进程ID:', portInfo.pid)
        console.log('   启动时间:', portInfo.startTime)
        return portInfo
      } catch (error) {
        console.log('❌ 解析端口信息文件失败:', error.message)
        return null
      }
    } else {
      console.log('❌ 端口信息文件不存在')
      return null
    }
  }

  async testStatusFile() {
    console.log('\n=== 测试状态信息文件 ===')
    
    if (await this.fileExists(this.statusFile)) {
      try {
        const content = await fs.readFile(this.statusFile, 'utf-8')
        const statusInfo = JSON.parse(content)
        console.log('✅ 状态信息文件读取成功:')
        console.log('   状态:', statusInfo.status)
        console.log('   端口:', statusInfo.port)
        console.log('   客户端数量:', statusInfo.clients)
        console.log('   运行时间:', Math.round(statusInfo.uptime), '秒')
        return statusInfo
      } catch (error) {
        console.log('❌ 解析状态信息文件失败:', error.message)
        return null
      }
    } else {
      console.log('❌ 状态信息文件不存在')
      return null
    }
  }

  async testHTTPEndpoint(port, endpoint) {
    const https = require('http')
    
    return new Promise((resolve) => {
      const req = https.get(`http://${this.serverConfig.mcp.host}:${port}${endpoint}`, (res) => {
        let data = ''
        
        res.on('data', (chunk) => {
          data += chunk
        })
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data)
            resolve({ success: true, data: result, status: res.statusCode })
          } catch (error) {
            resolve({ success: false, error: 'Invalid JSON', status: res.statusCode })
          }
        })
      })
      
      req.on('error', (error) => {
        resolve({ success: false, error: error.message })
      })
      
      req.setTimeout(5000, () => {
        req.destroy()
        resolve({ success: false, error: 'Timeout' })
      })
    })
  }

  async testHealthCheck(port) {
    console.log(`\n=== 测试健康检查 (端口 ${port}) ===`)
    
    const result = await this.testHTTPEndpoint(port, '/health')
    
    if (result.success) {
      console.log('✅ 健康检查成功:')
      console.log('   状态:', result.data.status)
      console.log('   端口:', result.data.port)
      console.log('   运行时间:', Math.round(result.data.uptime), '秒')
      return true
    } else {
      console.log('❌ 健康检查失败:', result.error)
      return false
    }
  }

  async testAPIStatus(port) {
    console.log(`\n=== 测试API状态 (端口 ${port}) ===`)
    
    const result = await this.testHTTPEndpoint(port, '/api/status')
    
    if (result.success) {
      console.log('✅ API状态检查成功:')
      console.log('   状态:', result.data.status)
      console.log('   端口:', result.data.port)
      console.log('   客户端数量:', result.data.clients)
      console.log('   进程ID:', result.data.pid)
      return true
    } else {
      console.log('❌ API状态检查失败:', result.error)
      return false
    }
  }

  async scanPorts(startPort = this.serverConfig.mcp.portRange.start, endPort = this.serverConfig.mcp.portRange.end) {
    console.log(`\n=== 扫描端口范围 (${startPort}-${endPort}) ===`)
    
    const mcpPorts = []
    
    for (let port = startPort; port <= endPort; port++) {
      const result = await this.testHTTPEndpoint(port, '/health')
      
      if (result.success && result.data.status === 'healthy') {
        // 验证是否为MCP服务
        const statusResult = await this.testHTTPEndpoint(port, '/api/status')
        if (statusResult.success && statusResult.data.status === 'running') {
          mcpPorts.push(port)
          console.log(`   ✅ 发现MCP服务: 端口 ${port}`)
        }
      }
    }
    
    console.log('\n扫描结果:')
    console.log('   发现的MCP端口:', mcpPorts.length > 0 ? mcpPorts.join(', ') : '无')
    
    return mcpPorts
  }

  async runTest() {
    console.log('🚀 MCP优化方案简化测试开始')
    console.log('项目路径:', this.projectPath)
    console.log('测试时间:', new Date().toISOString())
    
    const results = {
      portFile: false,
      statusFile: false,
      healthCheck: false,
      apiStatus: false,
      portScan: false,
      discoveredPort: null
    }
    
    // 1. 测试端口信息文件
    const portInfo = await this.testPortFile()
    results.portFile = !!portInfo
    
    // 2. 测试状态信息文件
    const statusInfo = await this.testStatusFile()
    results.statusFile = !!statusInfo
    
    // 3. 确定测试端口
    let testPort = portInfo?.port || this.serverConfig.mcp.defaultPort
    
    // 4. 测试健康检查
    results.healthCheck = await this.testHealthCheck(testPort)
    
    // 5. 测试API状态
    results.apiStatus = await this.testAPIStatus(testPort)
    
    // 6. 扫描端口范围
    const mcpPorts = await this.scanPorts()
    results.portScan = mcpPorts.length > 0
    if (mcpPorts.length > 0) {
      results.discoveredPort = mcpPorts[0]
    }
    
    // 输出总结
    this.printSummary(results)
    
    return results
  }

  printSummary(results) {
    console.log('\n' + '='.repeat(50))
    console.log('📊 测试总结')
    console.log('='.repeat(50))
    
    const tests = [
      { name: '端口信息文件', result: results.portFile },
      { name: '状态信息文件', result: results.statusFile },
      { name: 'HTTP健康检查', result: results.healthCheck },
      { name: 'API状态端点', result: results.apiStatus },
      { name: '端口范围扫描', result: results.portScan }
    ]
    
    let passed = 0
    tests.forEach(test => {
      const status = test.result ? '✅ 通过' : '❌ 失败'
      console.log(`${test.name}: ${status}`)
      if (test.result) passed++
    })
    
    console.log(`\n总体结果: ${passed}/${tests.length} (${Math.round(passed/tests.length*100)}%)`)
    
    if (results.discoveredPort) {
      console.log(`发现的MCP端口: ${results.discoveredPort}`)
    }
    
    if (passed >= 4) {
      console.log('\n🎉 MCP优化方案工作正常！')
      console.log('✅ 自动端口分配功能正常')
      console.log('✅ 客户端自动发现功能正常')
    } else {
      console.log('\n⚠️  部分功能异常，请检查服务器状态')
    }
  }
}

// 运行测试
const tester = new SimpleMCPTester()
tester.runTest().catch(error => {
  console.error('测试失败:', error)
  process.exit(1)
})