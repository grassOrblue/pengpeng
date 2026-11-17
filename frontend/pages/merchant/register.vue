<template>
  <view class="container">
    <view class="form-card">
      <view class="form-title">🏪 商家入驻</view>
      <view class="form-item">
        <text class="label">商家名称 *</text>
        <input class="input" v-model="form.name" placeholder="请输入商家名称" />
      </view>
      <view class="form-item">
        <text class="label">联系电话 *</text>
        <input class="input" v-model="form.phone" placeholder="请输入手机号" type="number" maxlength="11" />
      </view>
      <view class="form-item">
        <text class="label">商家分类</text>
        <picker mode="selector" :range="categories" @change="onCategoryChange">
          <input class="input" :value="form.category" placeholder="请选择分类" disabled />
        </picker>
      </view>
      <view class="form-item">
        <text class="label">商家地址</text>
        <input class="input" v-model="form.address" placeholder="请输入商家地址" />
      </view>
      <view class="form-item">
        <text class="label">美团商家链接</text>
        <input class="input" v-model="form.meituan_url" placeholder="https://..." />
      </view>
      <view class="form-item">
        <text class="label">抖音商家链接</text>
        <input class="input" v-model="form.douyin_url" placeholder="https://..." />
      </view>
      <view class="form-item">
        <text class="label">大众点评链接</text>
        <input class="input" v-model="form.dianping_url" placeholder="https://..." />
      </view>
      <view class="form-item"><text class="label">小红书门店链接</text><input class="input" v-model="form.xiaohongshu_url" placeholder="https://..." /></view>
      <view class="tips">
        <text>💡 提示：请填写您在各平台的商家主页链接，客户碰一碰后将跳转到对应平台。</text>
      </view>
      <button class="btn-submit" @click="submit" :disabled="loading">{{ loading ? '提交中...' : '提交入驻申请' }}</button>
    </view>
  </view>
</template>

<script>
import { merchantApi, storage } from '../../utils/api.js'
export default {
  data() {
    return {
      form: { name: '', phone: '', category: '', address: '', meituan_url: '', douyin_url: '', dianping_url: '', xiaohongshu_url: '' },
      categories: ['餐饮美食', '休闲娱乐', '丽人美发', '生活服务', '酒店旅游', '购物零售', '教育培训', '其他'],
      loading: false
    }
  },
  methods: {
    onCategoryChange(e) { this.form.category = this.categories[e.detail.value] },
    async submit() {
      if (!this.form.name || !this.form.phone) {
        uni.showToast({ title: '请填写必填项', icon: 'none' }); return
      }
      this.loading = true
      try {
        const res = await merchantApi.register(this.form)
        if (res.code === 0) {
          storage.set('merchant_id', res.data.id)
          storage.set('merchant_info', this.form)
          uni.showToast({ title: '入驻申请已提交', icon: 'success' })
          setTimeout(() => { uni.navigateTo({ url: '/pages/merchant/home' }) }, 1500)
        } else {
          uni.showToast({ title: res.msg || '提交失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: '网络错误', icon: 'none' })
      }
      this.loading = false
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: #F8F8F8; padding: 15px; }
.form-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.form-title { font-size: 20px; font-weight: bold; color: #333; text-align: center; margin-bottom: 20px; }
.form-item { margin-bottom: 15px; }
.label { display: block; font-size: 14px; color: #666; margin-bottom: 6px; }
.input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
.tips { background: #FFF8E1; border-radius: 8px; padding: 10px; margin: 15px 0; }
.tips text { font-size: 12px; color: #996600; }
.btn-submit { background: linear-gradient(135deg, #FFD700, #FFC107); color: #333; border: none; border-radius: 25px; padding: 12px; font-size: 16px; font-weight: 600; margin-top: 10px; }
.btn-submit::after { border: none; }
</style>
