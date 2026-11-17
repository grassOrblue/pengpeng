const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// 初始化数据库
const db = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件 - 上传的图片
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

app.use(express.static(path.join(__dirname, 'public')));

// 静态文件 - 后台管理界面
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// 路由
app.use('/api/merchant', require('./routes/merchant'));
app.use('/api/product', require('./routes/product'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/qrcode', require('./routes/qrcode'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ code: 0, msg: 'ok', time: new Date().toISOString() });
});

// 首页重定向到后台
app.get('/', (req, res) => {
  res.redirect('/admin/');
});

// 启动服务器
app.listen(PORT, process.env.HOST || '127.0.0.1', () => {
  console.log('========================================');
  console.log('  碰一碰好评小程序后端服务已启动');
  console.log('========================================');
  console.log(`  服务地址: http://0.0.0.0:${PORT}`);
  console.log(`  后台管理: http://0.0.0.0:${PORT}/admin/`);
  console.log(`  API基础:  http://0.0.0.0:${PORT}/api/`);
  console.log('========================================');
});
