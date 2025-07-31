<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 重定向到仪表板 -->
    <div :class="loadingConfig.containerClass">
      <div class="text-center">
        <div :class="loadingConfig.spinnerClass" />
        <p :class="loadingConfig.textClass">{{ homeTexts.loading }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { homeTexts, redirectConfig, loadingConfig } from '@/config/home.config'

const router = useRouter()

onMounted(() => {
  // 自动跳转到仪表板页面
  setTimeout(() => {
    router.push(redirectConfig.targetRoute)
  }, redirectConfig.delay)
})
</script>
