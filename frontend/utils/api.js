// API 请求工具
// 外部可访问的后端地址（DevBridge隧道）
const BASE_URL = 'https://mbmrcejn-3000.devbridge-s2.hwtunnel.com'

// #ifdef H5
const h5Base = ''
// #endif

function getBaseUrl() {
  // #ifdef H5
  return h5Base
  // #endif
  // #ifndef H5
  return BASE_URL
  // #endif
}

export function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: getBaseUrl() + url,
      method: method,
      data: data,
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// 商家相关API
export const merchantApi = {
  register: (data) => request('/api/merchant/register', 'POST', data),
  getDetail: (id) => request('/api/merchant/' + id),
  update: (id, data) => request('/api/merchant/' + id, 'PUT', data)
}

// 产品相关API
export const productApi = {
  list: (merchantId) => request('/api/product/merchant/' + merchantId),
  add: (data) => request('/api/product', 'POST', data),
  update: (id, data) => request('/api/product/' + id, 'PUT', data),
  delete: (id) => request('/api/product/' + id, 'DELETE'),
  upload: (filePath) => {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: getBaseUrl() + '/api/product/upload',
        filePath: filePath,
        name: 'images',
        success: (res) => {
          resolve(JSON.parse(res.data))
        },
        fail: reject
      })
    })
  }
}

// AI相关API
export const aiApi = {
  generateReview: (data) => request('/api/ai/generate-review', 'POST', data)
}

// 二维码相关API
export const qrcodeApi = {
  generate: (data) => request('/api/qrcode/generate', 'POST', data)
}

// 本地存储工具
export const storage = {
  set: (key, value) => uni.setStorageSync(key, value),
  get: (key) => uni.getStorageSync(key),
  remove: (key) => uni.removeStorageSync(key)
}

export default {
  request,
  merchantApi,
  productApi,
  aiApi,
  qrcodeApi,
  storage
}
