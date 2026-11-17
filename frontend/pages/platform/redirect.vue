<template>
  <view class="container" :class="'theme-' + platform">
    <view class="redirect-card">
      <view class="redirect-icon">{{ platformEmoji }}</view>
      <text class="redirect-title">即将跳转到 {{ platformName }}</text>
      <text class="redirect-desc">好评已自动填入，请在{{ platformName }}确认发布</text>
      
      <view class="review-preview" v-if="review">
        <text class="preview-label">自动填入的好评：</text>
        <text class="preview-content">{{ review }}</text>
      </view>

      <view class="countdown">
        <text class="countdown-text">{{ countdown }}秒后自动跳转</text>
      </view>

      <button class="btn-jump" @click="doJump">立即跳转</button>
      <button class="btn-copy" @click="copyReview" v-if="review">复制好评内容</button>
    </view>
  </view>
</template>

<script>
import { storage } from '../../utils/api.js'
export default {
  data() {
    return {
      platform: 'meituan',
      countdown: 3,
      review: '',
      platformNames: { meituan: '美团', douyin: '抖音', dianping: '大众点评' },
      platformEmojis: { meituan: '🍜', douyin: '🎵', dianping: '⭐' },
      platformUrls: { meituan: 'https://www.meituan.com', douyin: 'https://www.douyin.com', dianping: 'https://www.dianping.com' }
    }
  },
  computed: {
    platformName() { return this.platformNames[this.platform] },
    platformEmoji() { return this.platformEmojis[this.platform] }
  },
  onLoad(options) {
    this.platform = options.platform || 'meituan'
    this.review = storage.get('last_review') || ''
    this.startCountdown()
  },
  methods: {
    startCountdown() {
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(timer)
          this.doJump()
        }
      }, 1000)
    },
    doJump() {
      const url = this.platformUrls[this.platform]
      // #ifdef H5
      window.open(url, '_blank')
      // #endif
      // #ifdef APP-PLUS
      plus.runtime.openURL(url)
      // #endif
      // #ifdef MP-WEIXIN
      uni.showToast({ title: '请在浏览器中打开', icon: 'none' })
      // #endif
    },
    copyReview() {
      uni.setClipboardData({ data: this.review, success: () => uni.showToast({ title: '已复制', icon: 'success' }) })
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; }
.theme-meituan { background: linear-gradient(135deg, #FFD700, #FFC107); }
.theme-douyin { background: linear-gradient(135deg, #1A1A2E, #16213E); }
.theme-dianping { background: linear-gradient(135deg, #FF7A00, #FF6000); }
.redirect-card { background: #fff; border-radius: 16px; padding: 30px 25px; width: 100%; max-width: 350px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.15); }
.redirect-icon { font-size: 56px; }
.redirect-title { font-size: 20px; font-weight: bold; color: #333; margin-top: 15px; display: block; }
.redirect-desc { font-size: 14px; color: #999; margin-top: 8px; display: block; }
.review-preview { background: #FFF8E1; border-radius: 8px; padding: 12px; margin: 15px 0; text-align: left; }
.preview-label { font-size: 12px; color: #996600; display: block; }
.preview-content { font-size: 14px; color: #333; margin-top: 5px; display: block; line-height: 1.6; }
.countdown { margin: 15px 0; }
.countdown-text { font-size: 14px; color: #FFB800; }
.btn-jump { background: linear-gradient(135deg, #FFD700, #FFC107); color: #333; border: none; border-radius: 25px; padding: 12px; font-size: 16px; font-weight: 600; width: 100%; }
.btn-jump::after { border: none; }
.btn-copy { background: #f5f5f5; color: #666; border: none; border-radius: 25px; padding: 12px; font-size: 14px; width: 100%; margin-top: 10px; }
.btn-copy::after { border: none; }
</style>
