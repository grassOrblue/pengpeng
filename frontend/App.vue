<script>
export default {
  onLaunch: function() {
    console.log('碰一碰好评小程序启动');
    // 检查NFC支持
    // #ifdef APP-PLUS
    if (uni.getSystemInfoSync().platform === 'android') {
      console.log('Android平台，支持NFC');
    }
    // #endif
  },
  onShow: function() {
    console.log('小程序显示');
  },
  onHide: function() {
    console.log('小程序隐藏');
  }
}
</script>

<style>
/* 全局样式 */
page {
  background-color: #F8F8F8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;
}

/* 黄色主题按钮 */
.btn-primary {
  background: linear-gradient(135deg, #FFD700, #FFC107);
  color: #333;
  border: none;
  border-radius: 25px;
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
}

.btn-primary::after {
  border: none;
}

/* 卡片样式 */
.card {
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  margin: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

/* 平台标签 */
.platform-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
}

.platform-meituan { background: #FFD700; color: #333; }
.platform-douyin { background: #FE2C55; }
.platform-dianping { background: #FF7A00; }

/* 通用布局 */
.flex-center { display: flex; justify-content: center; align-items: center; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }
.flex-column { display: flex; flex-direction: column; }
</style>
