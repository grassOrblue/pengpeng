<template>
  <view class="container">
    <view class="form-card">
      <view class="form-title">🔐 商家登录</view>
      <view class="form-item">
        <text class="label">手机号</text>
        <input class="input" v-model="phone" placeholder="请输入手机号" type="number" maxlength="11" />
      </view>
      <button class="btn-submit" @click="login">登录</button>
      <view class="link" @click="goRegister">还没有账号？去入驻</view>
    </view>
  </view>
</template>

<script>
import { merchantApi, storage } from '../../utils/api.js'
export default {
  data() { return { phone: '' } },
  methods: {
    async login() {
      if (!this.phone) { uni.showToast({ title: '请输入手机号', icon: 'none' }); return }
      // 简化登录：通过手机号查找商家
      try {
        const res = await merchantApi.register({ name: '临时', phone: this.phone })
        // 实际应该有登录接口，这里简化处理
        const merchantId = storage.get('merchant_id')
        if (merchantId) {
          uni.navigateTo({ url: '/pages/merchant/home' })
        } else {
          uni.showToast({ title: '请先入驻', icon: 'none' })
          setTimeout(() => uni.navigateTo({ url: '/pages/merchant/register' }), 1500)
        }
      } catch (e) {
        uni.showToast({ title: '登录失败', icon: 'none' })
      }
    },
    goRegister() { uni.navigateTo({ url: '/pages/merchant/register' }) }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: #F8F8F8; padding: 15px; display: flex; align-items: center; }
.form-card { background: #fff; border-radius: 12px; padding: 30px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); width: 100%; }
.form-title { font-size: 20px; font-weight: bold; color: #333; text-align: center; margin-bottom: 20px; }
.form-item { margin-bottom: 15px; }
.label { display: block; font-size: 14px; color: #666; margin-bottom: 6px; }
.input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
.btn-submit { background: linear-gradient(135deg, #FFD700, #FFC107); color: #333; border: none; border-radius: 25px; padding: 12px; font-size: 16px; font-weight: 600; }
.btn-submit::after { border: none; }
.link { text-align: center; color: #FFB800; font-size: 14px; margin-top: 15px; }
</style>
