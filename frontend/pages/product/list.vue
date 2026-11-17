<template>
  <view class="container">
    <view class="header-bar">
      <text class="header-title">产品管理</text>
      <button class="btn-add" @click="goAdd">+ 添加</button>
    </view>
    <view class="product-list" v-if="products.length > 0">
      <view class="product-card" v-for="p in products" :key="p.id">
        <view class="product-images">
          <image v-for="(img, i) in parseImages(p.images)" :key="i" :src="img" class="product-img" mode="aspectFill" v-if="i < 3" />
        </view>
        <view class="product-detail">
          <text class="product-name">{{ p.name }}</text>
          <text class="product-desc">{{ p.description || '暂无描述' }}</text>
          <view class="product-bottom">
            <text class="product-price">¥{{ p.price }}</text>
            <view class="product-actions">
              <text class="action-btn" @click="editProduct(p)">编辑</text>
              <text class="action-btn danger" @click="deleteProduct(p)">删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="empty" v-else>
      <text class="empty-icon">📦</text>
      <text class="empty-text">暂无产品，点击右上角添加</text>
    </view>
  </view>
</template>

<script>
import { productApi, storage } from '../../utils/api.js'
export default {
  data() { return { products: [], merchantId: '' } },
  async onShow() {
    this.merchantId = storage.get('merchant_id')
    if (!this.merchantId) { uni.navigateTo({ url: '/pages/merchant/register' }); return }
    await this.loadProducts()
  },
  methods: {
    async loadProducts() {
      try {
        const res = await productApi.list(this.merchantId)
        if (res.code === 0) this.products = res.data
      } catch (e) {}
    },
    parseImages(imgs) { if (typeof imgs === 'string') { try { return JSON.parse(imgs) } catch(e) { return [] } } return imgs || [] },
    goAdd() { uni.navigateTo({ url: '/pages/product/add' }) },
    editProduct(p) { uni.navigateTo({ url: '/pages/product/add?id=' + p.id }) },
    async deleteProduct(p) {
      uni.showModal({ title: '确认', content: '删除该产品？', success: async (r) => {
        if (r.confirm) {
          await productApi.delete(p.id)
          uni.showToast({ title: '已删除', icon: 'success' })
          this.loadProducts()
        }
      }})
    }
  }
}
</script>

<style scoped>
.container { min-height: 100vh; background: #F8F8F8; }
.header-bar { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #fff; }
.header-title { font-size: 18px; font-weight: 600; }
.btn-add { background: #FFD700; color: #333; border: none; border-radius: 20px; padding: 6px 16px; font-size: 14px; }
.btn-add::after { border: none; }
.product-list { padding: 15px; }
.product-card { background: #fff; border-radius: 12px; margin-bottom: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0.06)); }
.product-images { display: flex; height: 80px; }
.product-img { width: 33%; height: 100%; border-radius: 8px 0; }
.product-detail { padding: 10px 15px; }
.product-name { font-size: 15px; font-weight: 600; color: #333; }
.product-desc { font-size: 12px; color: #999; margin-top: 4px; }
.product-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.product-price { color: #FF4D4F; font-weight: bold; font-size: 15px; }
.product-actions { display: flex; gap: 10px; }
.action-btn { font-size: 13px; color: #1890ff; }
.action-btn.danger { color: #ff4d4f; }
.empty { display: flex; flex-direction: column; align-items: center; padding: 60px; }
.empty-icon { font-size: 48px; }
.empty-text { font-size: 14px; color: #ccc; margin-top: 10px; }
</style>
