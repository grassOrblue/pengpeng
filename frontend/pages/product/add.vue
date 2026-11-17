<template>
  <view class="container">
    <view class="form-card">
      <view class="form-title">添加产品</view>
      <view class="form-item">
        <text class="label">产品名称 *</text>
        <input class="input" v-model="form.name" placeholder="如：招牌红烧肉" />
      </view>
      <view class="form-item">
        <text class="label">产品描述</text>
        <textarea class="input textarea" v-model="form.description" placeholder="描述产品特色..." />
      </view>
      <view class="form-item">
        <text class="label">价格</text>
        <input class="input" v-model="form.price" placeholder="¥" type="digit" />
      </view>
      <view class="form-item">
        <text class="label">产品图片（最多9张）</text>
        <view class="image-picker">
          <view class="image-item" v-for="(img, i) in form.images" :key="i">
            <image :src="img" class="preview-img" mode="aspectFill" />
            <text class="remove-img" @click="removeImage(i)">×</text>
          </view>
          <view class="add-image" @click="chooseImage" v-if="form.images.length < 9">
            <text class="add-icon">+</text>
          </view>
        </view>
      </view>
      <button class="btn-submit" @click="submit" :disabled="loading">{{ loading ? '保存中...' : '保存产品' }}</button>
    </view>
  </view>
</template>

<script>
import { productApi, storage } from '../../utils/api.js'
export default {
  data() {
    return { form: { name: '', description: '', price: '', images: [] }, loading: false }
  },
  methods: {
    chooseImage() {
      uni.chooseImage({
        count: 9 - this.form.images.length,
        success: async (res) => {
          for (const path of res.tempFilePaths) {
            try {
              const r = await productApi.upload(path)
              if (r.code === 0 && r.data) {
                r.data.forEach(url => this.form.images.push(url))
              }
            } catch (e) {
              // H5环境下直接用本地路径预览
              this.form.images.push(path)
            }
          }
        }
      })
    },
    removeImage(i) { this.form.images.splice(i, 1) },
    async submit() {
      if (!this.form.name) { uni.showToast({ title: '请输入产品名称', icon: 'none' }); return }
      this.loading = true
      const merchantId = storage.get('merchant_id')
      try {
        const res = await productApi.add({
          merchant_id: merchantId,
          name: this.form.name,
          description: this.form.description,
          price: parseFloat(this.form.price) || 0,
          images: this.form.images,
          category: ''
        })
        if (res.code === 0) {
          uni.showToast({ title: '保存成功', icon: 'success' })
          setTimeout(() => uni.navigateBack(), 1500)
        }
      } catch (e) { uni.showToast({ title: '保存失败', icon: 'none' }) }
      this.loading = false
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: #F8F8F8; padding: 15px; }
.form-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.form-title { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 20px; }
.form-item { margin-bottom: 15px; }
.label { display: block; font-size: 14px; color: #666; margin-bottom: 6px; }
.input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
.textarea { height: 80px; }
.image-picker { display: flex; flex-wrap: wrap; gap: 10px; }
.image-item { position: relative; width: 70px; height: 70px; }
.preview-img { width: 100%; height: 100%; border-radius: 8px; }
.remove-img { position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; background: #ff4d4f; color: #fff; border-radius: 50%; text-align: center; line-height: 20px; font-size: 14px; }
.add-image { width: 70px; height: 70px; border: 2px dashed #ddd; border-radius: 8px; display: flex; justify-content: center; align-items: center; }
.add-icon { font-size: 28px; color: #ccc; }
.btn-submit { background: linear-gradient(135deg, #FFD700, #FFC107); color: #333; border: none; border-radius: 25px; padding: 12px; font-size: 16px; font-weight: 600; margin-top: 10px; }
.btn-submit::after { border: none; }
</style>
