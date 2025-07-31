/**
 * 智能需求分析器
 * 自动读取历史会话和技术文档，生成需求评估报告
 */

import { logger } from './logger'
import { mcpClient } from './mcpClient'

export interface SessionData {
  id: string
  title: string
  type: string
  startTime: string
  duration: string
  messageCount: number
  decisionCount: number
  summary: string
  messages: SessionMessage[]
  decisions: Decision[]
}

export interface SessionMessage {
  id: string
  type: 'message' | 'decision' | 'action'
  content: string
  timestamp: string
  author: string
  isDecision: boolean
}

export interface Decision {
  id: string
  title: string
  content: string
  maker: string
  impact: string
  alternatives: string[]
  reasoning: string
  timestamp: string
}

export interface TechnicalDocument {
  path: string
  name: string
  type: string
  content: string
  lastModified: string
  size: number
}

export interface RequirementAnalysisResult {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  businessValue: number
  feasibility: number
  cost: number
  risk: number
  correlation: number
  recommendedPriority: string
  recommendation: string
  sourceData: {
    sessions: string[]
    documents: string[]
    keywords: string[]
  }
  generatedAt: string
}

export interface AnalysisConfig {
  sessionTimeRange: 'today' | 'week' | 'month' | 'all'
  documentTypes: string[]
  keywordWeights: Record<string, number>
  analysisDepth: 'basic' | 'detailed' | 'comprehensive'
  includeDecisions: boolean
  includeConflicts: boolean
  includeDocuments: boolean
  timeRange: 'today' | 'week' | 'month' | 'all'
}

class IntelligentRequirementAnalyzer {
  private projectPath: string
  private config: AnalysisConfig
  private sessionCache: Map<string, SessionData> = new Map()
  private documentCache: Map<string, TechnicalDocument> = new Map()

  constructor(projectPath: string, config?: Partial<AnalysisConfig>) {
    this.projectPath = projectPath
    this.config = {
      sessionTimeRange: 'month',
      documentTypes: ['.md', '.txt', '.json', '.ts', '.vue', '.js'],
      keywordWeights: {
        '需求': 1.0,
        '功能': 0.9,
        '特性': 0.8,
        '优化': 0.7,
        '修复': 0.6,
        '重构': 0.5
      },
      analysisDepth: 'detailed',
      includeDecisions: true,
      includeConflicts: true,
      includeDocuments: true,
      timeRange: 'month',
      ...config
    }
  }

  /**
   * 自动分析并生成需求评估
   */
  async analyzeAndGenerateRequirements(): Promise<RequirementAnalysisResult[]> {
    try {
      logger.info('开始智能需求分析...')

      // 调用MCP服务器的auto_generate_requirements工具
      const timeRange = this.getTimeRange()
      const analysisResult = await mcpClient.sendRequest('tools/call', {
        name: 'auto_generate_requirements',
        arguments: {
          timeRange: {
            start: timeRange.start,
            end: timeRange.end
          },
          analysisDepth: this.config.analysisDepth,
          includeDocuments: true,
          includeSessions: true
        }
      })

      if (analysisResult && analysisResult.content && analysisResult.content[0]) {
        const mcpResult = JSON.parse(analysisResult.content[0].text)
        logger.info(`MCP服务器分析完成，生成 ${mcpResult.generatedRequirements.length} 个需求`)

        // 转换MCP结果为本地格式
        const requirements = mcpResult.generatedRequirements.map((req: any) => ({
          id: req.id,
          title: req.title,
          description: req.description,
          priority: req.priority,
          businessValue: req.evaluation.businessValue,
          feasibility: req.evaluation.technicalFeasibility,
          cost: req.evaluation.implementationCost,
          risk: req.evaluation.riskAssessment,
          correlation: req.confidence || 70,
          recommendedPriority: this.calculateRecommendedPriority(req.evaluation),
          recommendation: this.generateRecommendation(req),
          sourceData: {
            sessions: [req.sourceId],
            documents: [],
            keywords: [req.category]
          },
          generatedAt: req.generatedAt
        }))

        return requirements
      }

      // 如果MCP调用失败，回退到本地分析
      logger.warn('MCP服务器调用失败，使用本地分析')
      return await this.fallbackLocalAnalysis()
    } catch (error) {
      logger.error('智能需求分析失败', error)
      // 回退到本地分析
      return await this.fallbackLocalAnalysis()
    }
  }

  /**
   * 本地分析回退方案
   */
  private async fallbackLocalAnalysis(): Promise<RequirementAnalysisResult[]> {
    try {
      // 优先使用MCP服务器的自动生成需求功能
      try {
        const timeRange = this.getTimeRange()
        const mcpResult = await mcpClient.autoGenerateRequirements(
          this.config.analysisDepth,
          this.config.includeDocuments,
          timeRange
        )

        if (mcpResult && mcpResult.requirements) {
          logger.info('使用MCP服务器生成需求成功')
          return mcpResult.requirements.map((req: any) => ({
            id: req.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: req.title || '未命名需求',
            description: req.description || '',
            priority: req.priority || 'medium',
            category: req.category || 'functional',
            source: req.source || 'mcp_analysis',
            confidence: req.confidence || 0.7,
            businessValue: req.businessValue || 0.5,
            technicalFeasibility: req.technicalFeasibility || 0.5,
            costBenefit: req.costBenefit || 0.5,
            riskAssessment: req.riskAssessment || 0.5,
            recommendedPriority: req.recommendedPriority || 'medium',
            reasoning: req.reasoning || '基于MCP服务器分析生成',
            relatedSessions: req.relatedSessions || [],
            relatedDocuments: req.relatedDocuments || [],
            keywordMatches: req.keywordMatches || [],
            timestamp: req.timestamp || new Date().toISOString()
          }))
        }
      } catch (mcpError) {
        logger.warn('MCP服务器生成需求失败，使用本地分析', mcpError)
      }

      // 1. 读取历史会话数据
      const sessions = await this.loadHistoricalSessions()
      logger.debug(`加载了 ${sessions.length} 个历史会话`)

      // 2. 扫描技术文档
      const documents = await this.scanTechnicalDocuments()
      logger.debug(`扫描了 ${documents.length} 个技术文档`)

      // 3. 提取关键信息
      const extractedInfo = await this.extractKeyInformation(sessions, documents)
      logger.debug('完成关键信息提取')

      // 4. 生成需求候选
      const requirementCandidates = await this.generateRequirementCandidates(extractedInfo)
      logger.debug(`生成了 ${requirementCandidates.length} 个需求候选`)

      // 5. 评估和排序
      const evaluatedRequirements = await this.evaluateRequirements(requirementCandidates)
      logger.debug('完成需求评估')

      logger.info(`本地智能需求分析完成，生成 ${evaluatedRequirements.length} 个需求`)
      return evaluatedRequirements
    } catch (error) {
      logger.error('本地需求分析失败', error)
      throw new Error(`需求分析失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 获取时间范围
   */
  private getTimeRange(): { start: string | null, end: string | null } {
    const now = new Date()
    let start: Date | null = null

    switch (this.config.sessionTimeRange) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'all':
      default:
        start = null
        break
    }

    return {
      start: start ? start.toISOString() : null,
      end: now.toISOString()
    }
  }

  /**
   * 计算推荐优先级
   */
  private calculateRecommendedPriority(evaluation: any): string {
    const score = evaluation.overallScore || 0
    if (score >= 80) return 'high'
    if (score >= 60) return 'medium'
    return 'low'
  }

  /**
   * 生成推荐建议
   */
  private generateRecommendation(requirement: any): string {
    const evaluation = requirement.evaluation
    const recommendations = []

    if (evaluation.businessValue > 80) {
      recommendations.push('业务价值高，建议优先实施')
    }
    if (evaluation.technicalFeasibility < 50) {
      recommendations.push('技术可行性较低，需要进一步评估')
    }
    if (evaluation.implementationCost > 70) {
      recommendations.push('实施成本较高，建议分阶段实施')
    }
    if (evaluation.riskAssessment > 60) {
      recommendations.push('风险较高，需要制定风险缓解策略')
    }

    return recommendations.length > 0 ? recommendations.join('；') : '建议按计划实施'
  }

  /**
   * 加载历史会话数据
   */
  private async loadHistoricalSessions(): Promise<SessionData[]> {
    try {
      // 从MCP服务器获取会话数据
      const projectContext = await mcpClient.getProjectContext(true)

      // 根据时间范围过滤会话
      const timeRange = this.getTimeRange()

      // 从MCP服务器获取真实的历史会话数据
      let sessions: SessionData[] = []

      if (projectContext && projectContext.sessions) {
        sessions = projectContext.sessions.map((session: any) => ({
          id: session.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: session.title || '未命名会话',
          type: session.type || 'general',
          startTime: session.startTime || new Date().toISOString(),
          duration: session.duration || '未知',
          messageCount: session.messageCount || 0,
          decisionCount: session.decisionCount || 0,
          summary: session.summary || '',
          messages: session.messages || [],
          decisions: session.decisions || []
        }))
      }

      // 如果没有获取到会话数据，返回空数组
      if (sessions.length === 0) {
        logger.warn('未获取到历史会话数据，可能MCP服务器未返回会话信息')
        return []
      }

      // 根据配置的时间范围过滤会话
      const timeRangeForFilter = {
        start: timeRange.start ? new Date(timeRange.start) : new Date('2020-01-01'),
        end: timeRange.end ? new Date(timeRange.end) : new Date()
      }
      const filteredSessions = this.filterSessionsByTimeRange(sessions, timeRangeForFilter)

      // 缓存会话数据
      filteredSessions.forEach(session => {
        this.sessionCache.set(session.id, session)
      })

      logger.info(`成功加载 ${filteredSessions.length} 个历史会话`)
      return filteredSessions
    } catch (error) {
      logger.error('加载历史会话失败', error)
      return []
    }
  }

  /**
   * 扫描技术文档
   */
  private async scanTechnicalDocuments(): Promise<TechnicalDocument[]> {
    try {
      // 从MCP服务器获取技术文档
      const projectContext = await mcpClient.getProjectContext(false)
      let documents: TechnicalDocument[] = []

      if (projectContext && projectContext.documents) {
        documents = projectContext.documents.map((doc: any) => ({
          path: doc.path || '',
          name: doc.name || '未命名文档',
          type: doc.type || '.md',
          content: doc.content || '',
          lastModified: doc.lastModified || new Date().toISOString(),
          size: doc.size || 0
        }))
      }

      // 如果MCP服务器没有返回文档，在浏览器环境中无法直接访问文件系统
      // 这里可以提示用户手动上传文档或通过其他方式提供文档
      if (documents.length === 0) {
        logger.warn('MCP服务器未返回文档，且浏览器环境无法直接访问本地文件系统')
        logger.info('建议通过MCP服务器或手动上传的方式提供技术文档')
      }

      // 缓存文档数据
      documents.forEach(doc => {
        this.documentCache.set(doc.path, doc)
      })

      logger.info(`成功扫描 ${documents.length} 个技术文档`)
      return documents
    } catch (error) {
      logger.error('扫描技术文档失败', error)
      return []
    }
  }

  /**
   * 提取关键信息
   */
  private async extractKeyInformation(sessions: SessionData[], documents: TechnicalDocument[]) {
    const keywordFrequency = new Map<string, number>()
    const topics = new Set<string>()
    const decisions = new Map<string, Decision>()
    const requirements = new Set<string>()
    const technicalConcepts = new Set<string>()
    const businessRequirements = []
    const technicalRequirements = []
    const participants = new Set<string>()

    // 从会话中提取信息
    for (const session of sessions) {
      // 提取关键词并统计频率
      const sessionText = `${session.summary} ${session.messages.map(m => m.content).join(' ')}`
      const sessionKeywords = this.extractKeywords(sessionText)
      sessionKeywords.forEach(kw => {
        keywordFrequency.set(kw, (keywordFrequency.get(kw) || 0) + 1)
      })

      // 提取主题
      topics.add(session.title)

      // 收集决策
      session.decisions.forEach(decision => {
        decisions.set(decision.id, decision)
      })

      // 收集参与者信息
      session.messages.forEach(msg => {
        participants.add(msg.author)
      })

      // 分类需求
      if (session.type === 'requirement') {
        businessRequirements.push({
          source: session.title,
          content: session.summary,
          priority: session.decisionCount > 2 ? 'high' : 'medium',
          messageCount: session.messageCount
        })
        requirements.add(session.summary)
      } else if (session.type === 'design') {
        technicalRequirements.push({
          source: session.title,
          content: session.summary,
          complexity: session.decisionCount > 3 ? 'high' : 'medium',
          duration: session.duration
        })
      }
    }

    // 从文档中提取信息
    for (const doc of documents) {
      const docKeywords = this.extractKeywords(doc.content)
      docKeywords.forEach(kw => {
        // 文档中的关键词权重更高
        keywordFrequency.set(kw, (keywordFrequency.get(kw) || 0) + 2)
        technicalConcepts.add(kw)
      })

      // 提取需求相关内容
      if (doc.name.includes('需求') || doc.name.includes('requirement')) {
        const reqContent = this.extractRequirementContent(doc.content)
        reqContent.forEach(req => requirements.add(req))
      }
    }

    return {
      keywordFrequency,
      keywords: Array.from(keywordFrequency.keys()),
      topics: Array.from(topics),
      decisions: Array.from(decisions.values()),
      requirements: Array.from(requirements),
      technicalConcepts: Array.from(technicalConcepts),
      businessRequirements,
      technicalRequirements,
      participants: Array.from(participants)
    }
  }

  /**
   * 提取关键词
   */
  private extractKeywords(text: string): string[] {
    const keywords: string[] = []

    // 简单的关键词提取逻辑
    const words = text.match(/[\u4e00-\u9fa5a-zA-Z]+/g) || []

    for (const word of words) {
      if (word.length >= 2 && this.config.keywordWeights[word]) {
        keywords.push(word)
      }
    }

    return keywords
  }

  /**
   * 提取需求内容
   */
  private extractRequirementContent(content: string): string[] {
    const requirements: string[] = []

    // 匹配需求相关的段落
    const reqPatterns = [
      /需求[：:][^\n]+/g,
      /功能[：:][^\n]+/g,
      /特性[：:][^\n]+/g,
      /要求[：:][^\n]+/g
    ]

    for (const pattern of reqPatterns) {
      const matches = content.match(pattern) || []
      requirements.push(...matches)
    }

    return requirements
  }

  /**
   * 生成需求候选
   */
  private async generateRequirementCandidates(extractedInfo: any): Promise<RequirementAnalysisResult[]> {
    const candidates: RequirementAnalysisResult[] = []

    // 基于高频关键词生成需求
    const topKeywords = Array.from(extractedInfo.keywordFrequency.entries())
      .filter(([keyword, frequency]) => this.config.keywordWeights[keyword] && (frequency as number) >= 2)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 8)

    for (const [keyword, frequency] of topKeywords as [string, number][]) {
      const weight = this.config.keywordWeights[keyword] || 0.5
      const confidence = Math.min((frequency as number) * 0.2 + weight * 0.3, 1.0)

      const candidate: RequirementAnalysisResult = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `优化${keyword}功能`,
        description: `基于${frequency}次讨论和文档分析，${keyword}是高频关注点，建议优化相关功能实现`,
        priority: (frequency as number) >= 3 ? 'high' : 'medium',
        businessValue: Math.floor(weight * 60 + (frequency as number) * 10 + 30),
        feasibility: Math.floor(85 - (frequency as number) * 5), // 频率高可能意味着复杂度高
        cost: Math.floor((frequency as number) * 15 + 25),
        risk: Math.floor((frequency as number) * 8 + 15),
        correlation: Math.floor(confidence * 100),
        recommendedPriority: (frequency as number) >= 3 ? '高等' : '中等',
        recommendation: `${keyword}在历史讨论中出现${frequency}次，建议优先处理相关功能`,
        sourceData: {
          sessions: extractedInfo.topics.slice(0, 3),
          documents: ['会话记录', '技术文档'],
          keywords: [keyword]
        },
        generatedAt: new Date().toISOString()
      }

      candidates.push(candidate)
    }

    // 基于业务需求生成候选
    extractedInfo.businessRequirements.forEach((req, index) => {
      const candidate: RequirementAnalysisResult = {
        id: `req_biz_${Date.now()}_${index}`,
        title: `实现${req.source}`,
        description: req.content.length > 100 ? `${req.content.substring(0, 100)}...` : req.content,
        priority: req.priority,
        businessValue: req.priority === 'high' ? 85 : 70,
        feasibility: 75,
        cost: req.messageCount > 40 ? 60 : 45, // 讨论越多可能越复杂
        risk: req.priority === 'high' ? 35 : 25,
        correlation: 80,
        recommendedPriority: req.priority === 'high' ? '高等' : '中等',
        recommendation: `基于业务需求分析，建议实现${req.source}相关功能`,
        sourceData: {
          sessions: [req.source],
          documents: ['业务需求文档'],
          keywords: ['业务需求']
        },
        generatedAt: new Date().toISOString()
      }

      candidates.push(candidate)
    })

    // 基于技术需求生成候选
    extractedInfo.technicalRequirements.forEach((req, index) => {
      const candidate: RequirementAnalysisResult = {
        id: `req_tech_${Date.now()}_${index}`,
        title: `技术改进：${req.source}`,
        description: req.content.length > 100 ? `${req.content.substring(0, 100)}...` : req.content,
        priority: req.complexity === 'high' ? 'high' : 'medium',
        businessValue: 60, // 技术需求业务价值相对较低
        feasibility: req.complexity === 'high' ? 65 : 80,
        cost: req.complexity === 'high' ? 70 : 50,
        risk: req.complexity === 'high' ? 45 : 30,
        correlation: 70,
        recommendedPriority: req.complexity === 'high' ? '高等' : '中等',
        recommendation: '技术架构优化需求，建议技术团队评估实现方案',
        sourceData: {
          sessions: [req.source],
          documents: ['技术设计文档'],
          keywords: ['技术改进']
        },
        generatedAt: new Date().toISOString()
      }

      candidates.push(candidate)
    })

    return candidates
  }

  /**
   * 评估需求
   */
  private async evaluateRequirements(candidates: RequirementAnalysisResult[]): Promise<RequirementAnalysisResult[]> {
    // 计算综合评分
    for (const candidate of candidates) {
      const score = (
        candidate.businessValue * 0.3 +
        candidate.feasibility * 0.25 +
        (100 - candidate.cost) * 0.2 +
        (100 - candidate.risk) * 0.15 +
        candidate.correlation * 0.1
      )

      // 根据评分确定优先级
      if (score >= 80) {
        candidate.priority = 'high'
        candidate.recommendedPriority = '高等'
      } else if (score >= 60) {
        candidate.priority = 'medium'
        candidate.recommendedPriority = '中等'
      } else {
        candidate.priority = 'low'
        candidate.recommendedPriority = '低等'
      }
    }

    // 按评分排序
    return candidates.sort((a, b) => {
      const scoreA = a.businessValue * 0.3 + a.feasibility * 0.25 + (100 - a.cost) * 0.2 + (100 - a.risk) * 0.15 + a.correlation * 0.1
      const scoreB = b.businessValue * 0.3 + b.feasibility * 0.25 + (100 - b.cost) * 0.2 + (100 - b.risk) * 0.15 + b.correlation * 0.1
      return scoreB - scoreA
    })
  }

  /**
   * 更新分析配置
   */
  updateConfig(newConfig: Partial<AnalysisConfig>): void {
    this.config = { ...this.config, ...newConfig }
    logger.info('智能需求分析配置已更新', this.config)
  }

  /**
   * 根据时间范围过滤会话
   */
  private filterSessionsByTimeRange(sessions: SessionData[], timeRange: { start: Date; end: Date }): SessionData[] {
    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime)
      return sessionDate >= timeRange.start && sessionDate <= timeRange.end
    })
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.sessionCache.clear()
    this.documentCache.clear()
    logger.info('智能需求分析缓存已清除')
  }

  /**
   * 获取分析统计信息
   */
  getAnalysisStats() {
    return {
      cachedSessions: this.sessionCache.size,
      cachedDocuments: this.documentCache.size,
      config: this.config,
      lastAnalysisTime: new Date().toISOString()
    }
  }
}

// 导出单例实例
export const intelligentRequirementAnalyzer = new IntelligentRequirementAnalyzer(
  '/'
)

export default IntelligentRequirementAnalyzer