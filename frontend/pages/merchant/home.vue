<template>
  <view class="container">
    <view class="header">
      <view class="merchant-info" v-if="merchant">
        <text class="merchant-name">{{ merchant.name }}</text>
        <text class="merchant-status">状态：{{ statusText }}</text>
      </view>
    </view>
    <view class="menu-list">
      <view class="menu-item" @click="goProductList">
        <text class="menu-icon">📦</text><text class="menu-text">产品管理</text><text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goQrcode">
        <text class="menu-icon">📱</text><text class="menu-text">碰一碰二维码</text><text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goNFC">
        <text class="menu-icon">📶</text><text class="menu-text">NFC标签写入</text><text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goRecords">
        <text class="menu-icon">📊</text><text class="menu-text">碰一碰记录</text><text class="menu-arrow">›</text>
      </view>
    </view>
    <view class="quick-actions">
      <view class="section-title">快速操作</view>
      <view class="action-grid">
        <view class="action-card" @click="goPlatform('meituan')">
          <text class="action-icon">🍜</text><text class="action-name">美团好评</text>
        </view>
        <view class="action-card" @click="goPlatform('douyin')">
          <text class="action-icon">🎵</text><text class="action-name">抖音好评</text>
        </view>
        <view class="action-card" @click="goPlatform('dianping')">
          <text class="action-icon">⭐</text><text class="action-name">点评好评</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { merchantApi, storage } from '../../utils/api.js'
export default {
  data() { return { merchant: null } },
  computed: {
    statusText() {
      if (!this.merchant) return '未知'
      const m = { pending: '待审核', approved: '已通过', rejected: '已拒绝' }
      return m[this.merchant.status] || this.merchant.status
    }
  },
  async onShow() {
    const id = storage.get('merchant_id')
    if (!id) { uni.navigateTo({ url: '/pages/merchant/register' }); return }
    try {
      const res = await merchantApi.getDetail(id)
      if (res.code === 0) this.merchant = res.data
    } catch (e) {}
  },
  methods: {
    goProductList() { uni.navigateTo({ url: '/pages/product/list' }) },
    goQrcode() { uni.navigateTo({ url: '/pages/qrcode/generate' }) },
    goNFC() { uni.navigateTo({ url: '/pages/qrcode/generate?tab=nfc' }) },
    goRecords() { uni.navigateTo({ url: '/pages/tap/result?tab=records' }) },
    goPlatform(pf) { uni.navigateTo({ url: '/pages/tap/result?platform=' + pf }) }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: #F8F8F8; }
.header { background: linear-gradient(135deg, #FFD700, #FFC107); padding: 20px 15px; }
.merchant-info { display: flex; flex-direction: column; }
.merchant-name { font-size: 20px; font-weight: bold; color: #333; }
.merchant-status { font-size: 13px; color: #666; margin-top: 5px; }
.menu-list { margin: 15px; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.menu-item { display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #f5f5f5; }
.menu-item:last-child { border-bottom: none; }
.menu-icon { font-size: 24px; margin-right: 12px; }
.menu-text { flex: 1; font-size: 15px; color: #333; }
.menu-arrow { color: #ccc; font-size: 20px; }
.quick-actions { margin: 15px; }
.section-title { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 12px; }
.action-grid { display: flex; justify-content: space-between; }
.action-card { width: 31%; background: #fff; border-radius: 12px; padding: 15px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.action-icon { font-size: 28px; }
.action-name { font-size: 13px; color: #666; margin-top: 8px; }
</style>
