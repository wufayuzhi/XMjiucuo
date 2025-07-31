/**
 * DeepSeek集成页面配置
 * 管理模型选项、快捷功能等配置数据
 */

// 模型配置
export const getDefaultModelOptions = () => {
  return [
    {
      label: '🔥 DeepSeek 模型',
      options: [
        { value: 'deepseek/deepseek-chat', label: 'DeepSeek Chat (V3最新版本)' },
        { value: 'deepseek/deepseek-coder', label: 'DeepSeek Coder (编程专用)' },
        { value: 'deepseek/deepseek-reasoner', label: 'DeepSeek Reasoner (推理专用)' }
      ]
    },
    {
      label: '🤖 OpenAI 模型',
      options: [
        { value: 'openai/gpt-4o', label: 'GPT-4o (最新版本)' },
        { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (轻量版)' },
        { value: 'openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
      ]
    },
    {
      label: '🧠 Anthropic 模型',
      options: [
        { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
        { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku' }
      ]
    },
    {
      label: '🌙 MoonshotAI 模型',
      options: [
        { value: 'moonshotai/kimi-k2:free', label: 'Kimi K2 Free (免费版)' },
        { value: 'moonshotai/kimi-k2', label: 'Kimi K2 (完整版)' }
      ]
    },
    {
      label: '🚀 其他模型',
      options: [
        { value: 'google/gemini-pro', label: 'Google Gemini Pro' },
        { value: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B' }
      ]
    }
  ]
}

// 快捷功能配置
export const getDefaultQuickActions = () => {
  return [
    {
      id: 'analyze',
      title: '项目分析',
      description: '分析当前项目状态和潜在问题',
      icon: 'Search',
      color: 'blue',
      action: 'analyzeProject'
    },
    {
      id: 'suggestions',
      title: '优化建议',
      description: '生成项目优化和改进建议',
      icon: 'Lightbulb',
      color: 'green',
      action: 'generateSuggestions'
    },
    {
      id: 'requirements',
      title: '需求评审',
      description: '智能评审需求文档和规格',
      icon: 'FileCheck',
      color: 'purple',
      action: 'reviewRequirements'
    },
    {
      id: 'documentation',
      title: '文档生成',
      description: '自动生成技术文档和说明',
      icon: 'FileText',
      color: 'orange',
      action: 'generateDocumentation'
    },
    {
      id: 'explorer',
      title: '文件夹查询',
      description: '浏览和查询指定文件夹内容',
      icon: 'FolderOpen',
      color: 'indigo',
      action: 'toggleFileExplorer'
    }
  ]
}

// 默认配置
export const getDefaultConfig = () => {
  return {
    apiKey: '',
    modelVersion: 'deepseek/deepseek-chat',
    maxTokens: 4096,
    temperature: 0.7,
    systemPrompt: '你是一个专业的项目管理和软件开发助手，专门帮助分析项目偏离情况并提供优化建议。支持文件夹查询和文件内容分析。'
  }
}

// 快捷提示
export const getDefaultQuickPrompts = () => {
  return [
    '分析当前项目的技术架构',
    '评估需求文档的完整性',
    '检查代码质量和规范性',
    '生成项目优化建议',
    '审查安全风险点',
    '分析性能瓶颈'
  ]
}

// API密钥类型配置
export const getApiKeyTypes = () => {
  return [
    {
      name: 'OpenRouter',
      url: 'https://openrouter.ai/keys',
      description: '推荐',
      supported: true
    },
    {
      name: 'DeepSeek',
      url: 'https://platform.deepseek.com/api_keys',
      description: '官方API',
      supported: true
    },
    {
      name: 'OpenAI',
      url: 'https://platform.openai.com/api-keys',
      description: '官方API',
      supported: true
    },
    {
      name: 'Anthropic',
      url: 'https://console.anthropic.com/',
      description: 'Claude API',
      supported: true
    }
  ]
}

// 页面文本配置
export const pageTexts = {
  title: 'DeepSeek 智能集成',
  subtitle: 'AI驱动的项目分析与优化助手',
  configSection: {
    title: 'API配置',
    apiKeyLabel: 'API密钥',
    apiKeyPlaceholder: '请输入您的API密钥...',
    modelLabel: '模型版本',
    maxTokensLabel: '最大Token数',
    temperatureLabel: '温度参数',
    systemPromptLabel: '系统提示词',
    systemPromptPlaceholder: '定义AI助手的角色和行为...',
    testConnection: '测试连接',
    saveConfig: '保存配置'
  },
  quickActions: {
    title: '快捷功能'
  },
  fileExplorer: {
    title: '文件夹浏览器',
    pathLabel: '选择文件夹路径',
    pathPlaceholder: '输入文件夹路径，如: C:\\Users\\Documents',
    browseButton: '浏览'
  },
  conversation: {
    title: '对话历史',
    inputPlaceholder: '输入您的问题或指令...',
    sendButton: '发送',
    clearButton: '清空对话'
  },
  status: {
    connected: '已连接',
    disconnected: '未连接',
    testing: '测试中...',
    configSaved: '配置已保存到本地存储，下次启动将自动加载',
    configNotSaved: '连接测试成功后将自动保存配置'
  }
}

// 温度参数配置
export const getTemperatureConfig = () => {
  return {
    min: 0,
    max: 1,
    step: 0.1,
    labels: {
      low: '保守',
      high: '创新'
    }
  }
}

// Token配置
export const getTokenConfig = () => {
  return {
    min: 100,
    max: 4096,
    default: 4096
  }
}