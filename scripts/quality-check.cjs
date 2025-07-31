#!/usr/bin/env node

/**
 * 代码质量检查脚本
 * 整合TypeScript检查、ESLint、Prettier等工具
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function runCommand(command, description) {
  log(`\n🔍 ${description}...`, 'blue')
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' })
    log(`✅ ${description} 通过`, 'green')
    return { success: true, output }
  } catch (error) {
    log(`❌ ${description} 失败`, 'red')
    if (error.stdout) {
      console.log(error.stdout)
    }
    if (error.stderr) {
      console.error(error.stderr)
    }
    return { success: false, error: error.message }
  }
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description} 存在`, 'green')
    return true
  } else {
    log(`❌ ${description} 不存在`, 'red')
    return false
  }
}

function analyzeProject() {
  log('\n📊 项目结构分析', 'magenta')

  const srcDir = path.join(process.cwd(), 'src')
  if (!fs.existsSync(srcDir)) {
    log('❌ src 目录不存在', 'red')
    return false
  }

  const requiredDirs = ['src/components', 'src/pages', 'src/utils', 'src/types']

  let allDirsExist = true
  requiredDirs.forEach(dir => {
    if (!checkFileExists(dir, `目录 ${dir}`)) {
      allDirsExist = false
    }
  })

  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    '.eslintrc.cjs',
    '.prettierrc',
  ]

  requiredFiles.forEach(file => {
    checkFileExists(file, `配置文件 ${file}`)
  })

  return allDirsExist
}

function countFiles() {
  log('\n📈 代码统计', 'cyan')

  try {
    const srcFiles = execSync(
      'find src -name "*.ts" -o -name "*.vue" | wc -l',
      { encoding: 'utf8' }
    ).trim()
    const totalLines = execSync(
      'find src -name "*.ts" -o -name "*.vue" | xargs wc -l | tail -1',
      { encoding: 'utf8' }
    ).trim()

    log(`📁 源代码文件数: ${srcFiles}`, 'cyan')
    log(`📝 总代码行数: ${totalLines.split(' ')[0]}`, 'cyan')
  } catch (error) {
    log('⚠️  代码统计失败 (Windows环境)', 'yellow')
    // Windows fallback
    try {
      const files = execSync(
        'dir /s /b src\\*.ts src\\*.vue 2>nul | find /c /v ""',
        { encoding: 'utf8' }
      ).trim()
      log(`📁 源代码文件数: ${files}`, 'cyan')
    } catch (e) {
      log('⚠️  无法统计文件数量', 'yellow')
    }
  }
}

function main() {
  log('🚀 开始代码质量检查', 'magenta')
  log('='.repeat(50), 'blue')

  const results = []

  // 1. 项目结构检查
  const structureOk = analyzeProject()
  results.push({ name: '项目结构', success: structureOk })

  // 2. 代码统计
  countFiles()

  // 3. TypeScript 类型检查
  const tsCheck = runCommand('npm run check', 'TypeScript 类型检查')
  results.push({ name: 'TypeScript', success: tsCheck.success })

  // 4. ESLint 代码规范检查
  const lintCheck = runCommand('npm run lint', 'ESLint 代码规范检查')
  results.push({ name: 'ESLint', success: lintCheck.success })

  // 5. Prettier 格式检查
  const formatCheck = runCommand('npm run format:check', 'Prettier 格式检查')
  results.push({ name: 'Prettier', success: formatCheck.success })

  // 6. 依赖安全检查
  const auditCheck = runCommand('npm audit --audit-level=high', '依赖安全检查')
  results.push({ name: '安全检查', success: auditCheck.success })

  // 总结报告
  log('\n' + '='.repeat(50), 'blue')
  log('📋 质量检查报告', 'magenta')
  log('='.repeat(50), 'blue')

  const passed = results.filter(r => r.success).length
  const total = results.length

  results.forEach(result => {
    const status = result.success ? '✅ 通过' : '❌ 失败'
    const color = result.success ? 'green' : 'red'
    log(`${result.name.padEnd(15)} ${status}`, color)
  })

  log('\n' + '-'.repeat(30), 'blue')
  log(
    `总体评分: ${passed}/${total} (${Math.round((passed / total) * 100)}%)`,
    passed === total ? 'green' : passed > total * 0.7 ? 'yellow' : 'red'
  )

  if (passed === total) {
    log('\n🎉 恭喜！所有质量检查都通过了！', 'green')
    process.exit(0)
  } else {
    log('\n⚠️  请修复上述问题后重新检查', 'yellow')
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { main, runCommand, checkFileExists }
