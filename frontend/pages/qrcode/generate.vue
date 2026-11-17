<template>
  <view class="container">
    <view class="tab-bar">
      <text :class="['tab', {active: tab==='qr'}]" @click="tab='qr'">二维码</text>
      <text :class="['tab', {active: tab==='nfc'}]" @click="tab='nfc'">NFC标签</text>
    </view>

    <!-- 二维码 -->
    <view v-if="tab==='qr'" class="qr-section">
      <view class="platform-select">
        <text class="label">选择平台</text>
        <view class="platform-btns">
          <text :class="['pf-btn', {active: platform==='meituan'}]" @click="platform='meituan'">美团</text>
          <text :class="['pf-btn', {active: platform==='douyin'}]" @click="platform='douyin'">抖音</text>
          <text :class="['pf-btn', {active: platform==='dianping'}]" @click="platform='dianping'">大众点评</text>
        </view>
      </view>
      <view class="qr-display" v-if="qrUrl">
        <image :src="qrUrl" class="qr-img" mode="aspectFit" />
        <text class="qr-tip">扫码进入门店页面，选择平台后自主操作</text>
      </view>
      <button class="btn-generate" @click="generateQR" :disabled="loading">{{ loading ? '生成中...' : '生成二维码' }}</button>
    </view>

    <!-- NFC -->
    <view v-if="tab==='nfc'" class="nfc-section">
      <view class="nfc-card">
        <text class="nfc-icon">📶</text>
        <text class="nfc-title">NFC标签写入</text>
        <text class="nfc-desc">请先生成链接，再使用支持 NDEF 的写卡工具写入标签</text>
        <view class="nfc-url" v-if="nfcUrl">
          <text class="url-label">NFC链接：</text>
          <text class="url-text">{{ nfcUrl }}</text><button @click="copyNfcUrl">复制链接</button>
        </view>
        <button class="btn-write" @click="writeNFC">写入NFC标签</button>
        <text class="nfc-tip" v-if="nfcStatus">{{ nfcStatus }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { qrcodeApi, storage } from '../../utils/api.js'
export default {
  data() {
    return { tab: 'qr', platform: 'meituan', qrUrl: '', nfcUrl: '', loading: false, nfcStatus: '' }
  },
  onLoad(options) { if (options.tab) this.tab = options.tab },
  methods: {
    async generateQR() {
      const merchantId = storage.get('merchant_id')
      if (!merchantId) { uni.showToast({ title: '请先入驻', icon: 'none' }); return }
      this.loading = true
      try {
        const res = await qrcodeApi.generate({ merchant_id: merchantId, platform: this.platform })
        if (res.code === 0) {
          this.qrUrl = res.data.qr_url
          this.nfcUrl = res.data.nfc_url
          uni.showToast({ title: '生成成功', icon: 'success' })
        }
      } catch (e) { uni.showToast({ title: '生成失败', icon: 'none' }) }
      this.loading = false
    },
    copyNfcUrl() { if (this.nfcUrl) uni.setClipboardData({ data: this.nfcUrl }) },
    async writeNFC() {
      // #ifdef APP-PLUS
      this.nfcStatus = '请将NFC标签靠近手机背面...'
      // 实际NFC写入需要调用原生插件
      // 这里简化处理，实际开发中使用 plus.nfc API
      uni.showToast({ title: 'NFC功能需在APP端使用', icon: 'none' })
      // #endif
      // #ifndef APP-PLUS
      uni.showToast({ title: 'NFC功能仅支持APP端', icon: 'none' })
      // #endif
      // 先生成URL
      if (!this.nfcUrl) await this.generateQR()
      this.nfcStatus = '链接已生成，请使用 NFC 写卡工具写入标签'
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: #F8F8F8; }
.tab-bar { display: flex; background: #fff; border-bottom: 1px solid #eee; }
.tab { flex: 1; text-align: center; padding: 15px; font-size: 15px; color: #999; }
.tab.active { color: #FFB800; font-weight: 600; border-bottom: 2px solid #FFB800; }
.qr-section { padding: 20px; }
.platform-select { background: #fff; border-radius: 12px; padding: 15px; margin-bottom: 15px; }
.label { font-size: 14px; color: #666; display: block; margin-bottom: 10px; }
.platform-btns { display: flex; gap: 10px; }
.pf-btn { flex: 1; text-align: center; padding: 8px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
.pf-btn.active { background: #FFD700; color: #333; border-color: #FFD700; }
.qr-display { background: #fff; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; align-items: center; }
.qr-img { width: 200px; height: 200px; }
.qr-tip { font-size: 13px; color: #999; margin-top: 10px; }
.btn-generate { background: linear-gradient(135deg, #FFD700, #FFC107); color: #333; border: none; border-radius: 25px; padding: 12px; font-size: 16px; font-weight: 600; margin-top: 15px; }
.btn-generate::after { border: none; }
.nfc-section { padding: 20px; }
.nfc-card { background: #fff; border-radius: 12px; padding: 30px 20px; display: flex; flex-direction: column; align-items: center; }
.nfc-icon { font-size: 48px; }
.nfc-title { font-size: 18px; font-weight: 600; margin-top: 10px; }
.nfc-desc { font-size: 13px; color: #999; text-align: center; margin-top: 10px; line-height: 1.6; }
.nfc-url { margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 8px; width: 100%; }
.url-label { font-size: 12px; color: #999; }
.url-text { font-size: 11px; color: #666; word-break: break-all; }
.btn-write { background: linear-gradient(135deg, #FFD700, #FFC107); color: #333; border: none; border-radius: 25px; padding: 12px 30px; font-size: 16px; font-weight: 600; }
.btn-write::after { border: none; }
.nfc-tip { font-size: 13px; color: #FFB800; margin-top: 10px; }
</style>
