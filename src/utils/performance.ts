/**
 * 性能监控工具类
 * 监控应用性能、用户体验指标
 */

import { logger } from './logger'

export interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: string
  context?: string
  tags?: Record<string, string>
}

export interface NavigationTiming {
  dns: number
  tcp: number
  ssl: number
  ttfb: number // Time to First Byte
  domContentLoaded: number
  loadComplete: number
  total: number
}

export interface ResourceTiming {
  name: string
  type: string
  size: number
  duration: number
  startTime: number
}

export interface UserTiming {
  name: string
  duration: number
  startTime: number
  endTime: number
}

export interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  usage: number // 使用率百分比
}

export interface FPSInfo {
  current: number
  average: number
  min: number
  max: number
  samples: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private userTimings: Map<string, number> = new Map()
  private fpsData: number[] = []
  private lastFrameTime = 0
  private frameCount = 0
  private isMonitoring = false
  private observers: PerformanceObserver[] = []

  constructor() {
    this.setupPerformanceObservers()
  }

  /**
   * 开始性能监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.startFPSMonitoring()
    this.collectNavigationTiming()

    logger.info('Performance monitoring started')
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []

    logger.info('Performance monitoring stopped')
  }

  /**
   * 记录性能指标
   */
  recordMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    context?: string,
    tags?: Record<string, string>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      context,
      tags,
    }

    this.metrics.push(metric)

    // 保持指标数量在合理范围内
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500)
    }

    logger.debug('Performance metric recorded', metric)
  }

  /**
   * 开始计时
   */
  startTiming(name: string): void {
    this.userTimings.set(name, performance.now())
    performance.mark(`${name}-start`)
  }

  /**
   * 结束计时
   */
  endTiming(name: string, context?: string): number {
    const startTime = this.userTimings.get(name)
    if (!startTime) {
      logger.warn('No start time found for timing', { name })
      return 0
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    performance.mark(`${name}-end`)
    performance.measure(name, `${name}-start`, `${name}-end`)

    this.userTimings.delete(name)
    this.recordMetric(name, duration, 'ms', context)

    return duration
  }

  /**
   * 测量函数执行时间
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    context?: string
  ): Promise<T> {
    this.startTiming(name)
    try {
      const result = await fn()
      this.endTiming(name, context)
      return result
    } catch (error) {
      this.endTiming(name, context)
      throw error
    }
  }

  /**
   * 测量同步函数执行时间
   */
  measure<T>(name: string, fn: () => T, context?: string): T {
    this.startTiming(name)
    try {
      const result = fn()
      this.endTiming(name, context)
      return result
    } catch (error) {
      this.endTiming(name, context)
      throw error
    }
  }

  /**
   * 获取导航时序信息
   */
  getNavigationTiming(): NavigationTiming | null {
    if (!performance.getEntriesByType) return null

    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming
    if (!navigation) return null

    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ssl:
        navigation.secureConnectionStart > 0
          ? navigation.connectEnd - navigation.secureConnectionStart
          : 0,
      ttfb: navigation.responseStart - navigation.requestStart,
      domContentLoaded:
        navigation.domContentLoadedEventEnd - navigation.fetchStart,
      loadComplete: navigation.loadEventEnd - navigation.fetchStart,
      total: navigation.loadEventEnd - navigation.fetchStart,
    }
  }

  /**
   * 获取资源时序信息
   */
  getResourceTiming(): ResourceTiming[] {
    if (!performance.getEntriesByType) return []

    const resources = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[]

    return resources.map(resource => ({
      name: resource.name,
      type: this.getResourceType(resource.name),
      size: resource.transferSize || 0,
      duration: resource.responseEnd - resource.startTime,
      startTime: resource.startTime,
    }))
  }

  /**
   * 获取用户时序信息
   */
  getUserTiming(): UserTiming[] {
    if (!performance.getEntriesByType) return []

    const measures = performance.getEntriesByType(
      'measure'
    ) as PerformanceMeasure[]

    return measures.map(measure => ({
      name: measure.name,
      duration: measure.duration,
      startTime: measure.startTime,
      endTime: measure.startTime + measure.duration,
    }))
  }

  /**
   * 获取内存信息
   */
  getMemoryInfo(): MemoryInfo | null {
    const memory = (performance as any).memory
    if (!memory) return null

    const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usage: Math.round(usage * 100) / 100,
    }
  }

  /**
   * 获取FPS信息
   */
  getFPSInfo(): FPSInfo {
    if (this.fpsData.length === 0) {
      return { current: 0, average: 0, min: 0, max: 0, samples: 0 }
    }

    const current = this.fpsData[this.fpsData.length - 1] || 0
    const average =
      this.fpsData.reduce((sum, fps) => sum + fps, 0) / this.fpsData.length
    const min = Math.min(...this.fpsData)
    const max = Math.max(...this.fpsData)

    return {
      current: Math.round(current),
      average: Math.round(average * 100) / 100,
      min: Math.round(min),
      max: Math.round(max),
      samples: this.fpsData.length,
    }
  }

  /**
   * 获取所有性能指标
   */
  getMetrics(filter?: {
    name?: string
    context?: string
  }): PerformanceMetric[] {
    let filtered = this.metrics

    if (filter?.name) {
      filtered = filtered.filter(metric => metric.name.includes(filter.name!))
    }

    if (filter?.context) {
      filtered = filtered.filter(metric => metric.context === filter.context)
    }

    return filtered
  }

  /**
   * 获取性能统计
   */
  getStats(): {
    totalMetrics: number
    averageByName: Record<string, number>
    memoryUsage?: MemoryInfo
    fps?: FPSInfo
    navigation?: NavigationTiming
  } {
    const averageByName: Record<string, number> = {}

    // 计算各指标的平均值
    const groupedMetrics = this.metrics.reduce(
      (groups, metric) => {
        if (!groups[metric.name]) {
          groups[metric.name] = []
        }
        groups[metric.name].push(metric.value)
        return groups
      },
      {} as Record<string, number[]>
    )

    Object.entries(groupedMetrics).forEach(([name, values]) => {
      averageByName[name] =
        values.reduce((sum, value) => sum + value, 0) / values.length
    })

    return {
      totalMetrics: this.metrics.length,
      averageByName,
      memoryUsage: this.getMemoryInfo() || undefined,
      fps: this.getFPSInfo(),
      navigation: this.getNavigationTiming() || undefined,
    }
  }

  /**
   * 清除所有指标
   */
  clearMetrics(): void {
    this.metrics = []
    this.fpsData = []
    this.userTimings.clear()

    if (performance.clearMarks) {
      performance.clearMarks()
    }
    if (performance.clearMeasures) {
      performance.clearMeasures()
    }

    logger.info('Performance metrics cleared')
  }

  /**
   * 导出性能报告
   */
  exportReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      metrics: this.metrics,
      userTiming: this.getUserTiming(),
      resourceTiming: this.getResourceTiming().slice(-50), // 最近50个资源
      navigationTiming: this.getNavigationTiming(),
    }

    return JSON.stringify(report, null, 2)
  }

  private setupPerformanceObservers(): void {
    if (!window.PerformanceObserver) return

    try {
      // 观察资源加载
      const resourceObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming
            this.recordMetric(
              `resource-${this.getResourceType(resource.name)}`,
              resource.duration,
              'ms',
              'resource-loading',
              { url: resource.name }
            )
          }
        })
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.push(resourceObserver)

      // 观察用户时序
      const measureObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'measure') {
            this.recordMetric(entry.name, entry.duration, 'ms', 'user-timing')
          }
        })
      })
      measureObserver.observe({ entryTypes: ['measure'] })
      this.observers.push(measureObserver)
    } catch (error) {
      logger.warn('Failed to setup performance observers', error)
    }
  }

  private collectNavigationTiming(): void {
    // 等待页面加载完成后收集导航时序
    if (document.readyState === 'complete') {
      this.recordNavigationMetrics()
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.recordNavigationMetrics(), 100)
      })
    }
  }

  private recordNavigationMetrics(): void {
    const timing = this.getNavigationTiming()
    if (!timing) return

    Object.entries(timing).forEach(([name, value]) => {
      this.recordMetric(`navigation-${name}`, value, 'ms', 'navigation')
    })
  }

  private startFPSMonitoring(): void {
    const measureFPS = (timestamp: number) => {
      if (this.lastFrameTime > 0) {
        const fps = 1000 / (timestamp - this.lastFrameTime)
        this.fpsData.push(fps)

        // 保持FPS数据在合理范围内
        if (this.fpsData.length > 60) {
          this.fpsData = this.fpsData.slice(-30)
        }
      }

      this.lastFrameTime = timestamp
      this.frameCount++

      if (this.isMonitoring) {
        requestAnimationFrame(measureFPS)
      }
    }

    requestAnimationFrame(measureFPS)
  }

  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'js':
        return 'script'
      case 'css':
        return 'stylesheet'
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
        return 'image'
      case 'woff':
      case 'woff2':
      case 'ttf':
      case 'otf':
        return 'font'
      case 'json':
        return 'fetch'
      default:
        return 'other'
    }
  }
}

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor()

// 自动开始监控
if (typeof window !== 'undefined') {
  performanceMonitor.startMonitoring()
}

// 导出便捷方法
export const startTiming = (name: string) =>
  performanceMonitor.startTiming(name)
export const endTiming = (name: string, context?: string) =>
  performanceMonitor.endTiming(name, context)
export const measureAsync = <T>(
  name: string,
  fn: () => Promise<T>,
  context?: string
) => performanceMonitor.measureAsync(name, fn, context)
export const measure = <T>(name: string, fn: () => T, context?: string) =>
  performanceMonitor.measure(name, fn, context)

export default performanceMonitor
