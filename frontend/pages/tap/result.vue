<template>
  <view class="container" :class="'theme-' + platform">
    <!-- 碰一碰成功动画 -->
    <view class="tap-success" v-if="!generating && !showRecords">
      <view class="success-icon">✅</view>
      <text class="success-title">碰一碰成功！</text>
      <text class="success-platform">正在为您生成 {{ platformName }} 好评</text>
    </view>

    <!-- 生成中 -->
    <view class="generating" v-if="generating">
      <view class="loading-icon">🤖</view>
      <text class="loading-text">AI正在生成好评...</text>
      <view class="loading-dots">
        <text class="dot">●</text><text class="dot">●</text><text class="dot">●</text>
      </view>
    </view>

    <!-- 好评结果 -->
    <view class="review-result" v-if="review && !generating && !showRecords">
      <!-- 平台风格头部 -->
      <view class="platform-header" :class="'header-' + platform">
        <text class="platform-logo">{{ platformEmoji }}</text>
        <text class="platform-name">{{ platformName }}</text>
        <text class="merchant-name">{{ merchantName }}</text>
      </view>

      <!-- 好评内容 -->
      <view class="review-card">
        <view class="review-stars">
          <text v-for="n in 5" :key="n" class="star">⭐</text>
        </view>
        <text class="review-content">{{ review }}</text>
        <view class="review-images" v-if="images.length > 0">
          <image v-for="(img, i) in images" :key="i" :src="img" class="review-img" mode="aspectFill" v-if="i < 3" />
        </view>
        <view class="review-meta">
          <text class="meta-source">来源：{{ sourceText }}</text>
          <text class="meta-time">{{ currentTime }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="btn-publish" @click="publishReview">发布到{{ platformName }}</button>
        <button class="btn-regenerate" @click="generateReview">重新生成</button>
      </view>
    </view>

    <!-- 碰一碰记录 -->
    <view class="records-section" v-if="showRecords">
      <text class="records-title">碰一碰记录</text>
      <view class="record-item" v-for="r in records" :key="r.id">
        <text class="record-platform">{{ platformNames[r.platform] }}</text>
        <text class="record-content">{{ r.review_content }}</text>
        <text class="record-time">{{ r.created_at }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { aiApi, storage } from '../../utils/api.js'
export default {
  data() {
    return {
      platform: 'meituan',
      generating: false,
      review: '',
      images: [],
      merchantName: '',
      source: '',
      records: [],
      showRecords: false,
      currentTime: '',
      platformNames: { meituan: '美团', douyin: '抖音', dianping: '大众点评' },
      platformEmojis: { meituan: '🍜', douyin: '🎵', dianping: '⭐' }
    }
  },
  computed: {
    platformName() { return this.platformNames[this.platform] || '平台' },
    platformEmoji() { return this.platformEmojis[this.platform] || '📱' },
    sourceText() { return this.source === 'ai' ? 'AI生成' : '模板生成' }
  },
  onLoad(options) {
    if (options.platform) this.platform = options.platform
    if (options.tab === 'records') { this.showRecords = true; this.loadRecords(); return }
    this.currentTime = new Date().toLocaleString()
    this.generateReview()
  },
  methods: {
    async generateReview() {
      this.generating = true
      const merchantId = storage.get('merchant_id')
      try {
        const res = await aiApi.generateReview({
          merchant_id: merchantId,
          platform: this.platform
        })
        if (res.code === 0) {
          this.review = res.data.review
          this.images = res.data.images || []
          this.merchantName = res.data.merchant_name || ''
          this.source = res.data.source || 'template'
          this.currentTime = new Date().toLocaleString()
        }
      } catch (e) {
        uni.showToast({ title: '生成失败', icon: 'none' })
      }
      this.generating = false
    },
    publishReview() {
      uni.showModal({
        title: '发布好评',
        content: `即将跳转到${this.platformName}，好评内容已自动填入，确认发布？`,
        success: (r) => {
          if (r.confirm) {
            uni.navigateTo({ url: '/pages/platform/redirect?platform=' + this.platform })
          }
        }
      })
    },
    async loadRecords() {
      // 加载记录
      try {
        const { request } = await import('../../utils/api.js')
        const res = await request('/api/ai/records')
        if (res.code === 0) this.records = res.data
      } catch (e) {}
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; }
/* 美团风格 */
.theme-meituan { background: #FFF8E1; }
.header-meituan { background: linear-gradient(135deg, #FFD700, #FFC107); }
/* 抖音风格 */
.theme-douyin { background: #1A1A2E; color: #fff; }
.header-douyin { background: linear-gradient(135deg, #FE2C55, #C7243F); }
/* 大众点评风格 */
.theme-dianping { background: #FFF3E0; }
.header-dianping { background: linear-gradient(135deg, #FF7A00, #FF6000); }

.tap-success { display: flex; flex-direction: column; align-items: center; padding: 40px; }
.success-icon { font-size: 60px; }
.success-title { font-size: 22px; font-weight: bold; margin-top: 15px; }
.success-platform { font-size: 14px; color: #999; margin-top: 8px; }

.generating { display: flex; flex-direction: column; align-items: center; padding: 50px; }
.loading-icon { font-size: 48px; animation: bounce 1s infinite; }
@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
.loading-text { font-size: 16px; margin-top: 15px; }
.loading-dots { margin-top: 10px; }
.dot { font-size: 12px; color: #FFB800; animation: blink 1.5s infinite; }
.dot:nth-child(2) { animation-delay: 0.5s; }
.dot:nth-child(3) { animation-delay: 1s; }
@keyframes blink { 0%,100%{opacity:0.3} 50%{opacity:1} }

.review-result { padding: 0; }
.platform-header { padding: 20px 15px; display: flex; align-items: center; gap: 10px; }
.platform-logo { font-size: 28px; }
.platform-name { font-size: 18px; font-weight: bold; color: #fff; }
.merchant-name { font-size: 13px; color: rgba(255,255,255,0.8); margin-left: auto; }

.review-card { margin: 15px; background: #fff; border-radius: 12px; padding: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.review-stars { margin-bottom: 10px; }
.star { font-size: 18px; }
.review-content { font-size: 15px; line-height: 1.8; color: #333; }
.review-images { display: flex; gap: 8px; margin-top: 12px; }
.review-img { width: 80px; height: 80px; border-radius: 8px; }
.review-meta { display: flex; justify-content: space-between; margin-top: 12px; font-size: 12px; color: #999; }

.action-buttons { padding: 15px; }
.btn-publish { background: linear-gradient(135deg, #FFD700, #FFC107); color: #333; border: none; border-radius: 25px; padding: 12px; font-size: 16px; font-weight: 600; width: 100%; }
.btn-publish::after { border: none; }
.btn-regenerate { background: #fff; color: #666; border: 1px solid #ddd; border-radius: 25px; padding: 12px; font-size: 16px; width: 100%; margin-top: 10px; }
.btn-regenerate::after { border: none; }

.records-section { padding: 15px; }
.records-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; }
.record-item { background: #fff; border-radius: 8px; padding: 12px; margin-bottom: 10px; }
.record-platform { font-size: 13px; color: #FFB800; font-weight: 600; }
.record-content { font-size: 14px; color: #333; margin-top: 5px; display: block; }
.record-time { font-size: 12px; color: #999; margin-top: 5px; display: block; }
</style>
