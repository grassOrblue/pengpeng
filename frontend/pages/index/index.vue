<template>
  <view class="container">
    <!-- 顶部Banner -->
    <view class="banner">
      <view class="banner-bg">
        <text class="banner-title">📱 碰一碰好评</text>
        <text class="banner-desc">手机一碰，打开门店服务</text>
        <text class="banner-sub">门店链接与真实体验分享</text>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="section">
      <view class="section-title">选择平台</view>
      <view class="platform-list">
        <view class="platform-card" @click="goPlatform('meituan')">
          <view class="platform-icon meituan-icon">🍜</view>
          <text class="platform-name">美团</text>
          <text class="platform-desc">外卖/到店好评</text>
        </view>
        <view class="platform-card" @click="goPlatform('douyin')">
          <view class="platform-icon douyin-icon">🎵</view>
          <text class="platform-name">抖音</text>
          <text class="platform-desc">打卡/种草好评</text>
        </view>
        <view class="platform-card" @click="goPlatform('dianping')">
          <view class="platform-icon dianping-icon">⭐</view>
          <text class="platform-name">大众点评</text>
          <text class="platform-desc">探店/点评好评</text>
        </view>
      </view>
    </view>

    <!-- 功能说明 -->
    <view class="section">
      <view class="section-title">功能介绍</view>
      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-icon">🏪</text>
          <view class="feature-info">
            <text class="feature-title">商家入驻</text>
            <text class="feature-desc">填写店铺信息，上传产品图片</text>
          </view>
        </view>
        <view class="feature-item">
          <text class="feature-icon">📱</text>
          <view class="feature-info">
            <text class="feature-title">碰一碰/NFC</text>
            <text class="feature-desc">生成二维码和NFC标签</text>
          </view>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🤖</text>
          <view class="feature-info">
            <text class="feature-title">AI自动好评</text>
            <text class="feature-desc">大模型自动生成好评文案</text>
          </view>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🚀</text>
          <view class="feature-info">
            <text class="feature-title">一键发布</text>
            <text class="feature-desc">自动跳转平台发布好评</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 商家入口 -->
    <view class="merchant-entry">
      <button class="btn-primary" @click="goRegister">商家入驻</button>
      <button class="btn-secondary" @click="goLogin">商家登录</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    goPlatform(platform) {
      uni.navigateTo({
        url: '/pages/tap/result?platform=' + platform
      })
    },
    goRegister() {
      uni.navigateTo({ url: '/pages/merchant/register' })
    },
    goLogin() {
      uni.navigateTo({ url: '/pages/merchant/login' })
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: #F8F8F8; padding-bottom: 30px; }
.banner { padding: 20px 15px; }
.banner-bg {
  background: linear-gradient(135deg, #FFD700, #FFC107);
  border-radius: 16px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
}
.banner-title { font-size: 28px; font-weight: bold; color: #333; }
.banner-desc { font-size: 18px; color: #555; margin-top: 8px; }
.banner-sub { font-size: 13px; color: #777; margin-top: 5px; }
.section { margin: 15px; }
.section-title { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 12px; }
.platform-list { display: flex; justify-content: space-between; }
.platform-card {
  width: 31%; background: #fff; border-radius: 12px; padding: 15px 10px;
  display: flex; flex-direction: column; align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.platform-icon { width: 50px; height: 50px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 28px; }
.meituan-icon { background: #FFF8E1; }
.douyin-icon { background: #FFE0E8; }
.dianping-icon { background: #FFF3E0; }
.platform-name { font-size: 15px; font-weight: 600; margin-top: 8px; color: #333; }
.platform-desc { font-size: 11px; color: #999; margin-top: 3px; }
.feature-list { background: #fff; border-radius: 12px; padding: 10px 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.feature-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
.feature-item:last-child { border-bottom: none; }
.feature-icon { font-size: 32px; margin-right: 15px; }
.feature-info { display: flex; flex-direction: column; }
.feature-title { font-size: 15px; font-weight: 600; color: #333; }
.feature-desc { font-size: 12px; color: #999; margin-top: 2px; }
.merchant-entry { padding: 20px 15px; }
.btn-primary {
  background: linear-gradient(135deg, #FFD700, #FFC107); color: #333;
  border: none; border-radius: 25px; padding: 12px; font-size: 16px; font-weight: 600; width: 100%;
}
.btn-primary::after { border: none; }
.btn-secondary {
  background: #fff; color: #666; border: 1px solid #ddd;
  border-radius: 25px; padding: 12px; font-size: 16px; width: 100%; margin-top: 10px;
}
.btn-secondary::after { border: none; }
</style>
