const express = require('express');
const router = express.Router();
const db = require('../db/init');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 图片上传配置
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, uuidv4() + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// 图片上传
router.post('/upload', upload.array('images', 9), (req, res) => {
  const urls = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ code: 0, data: urls });
});

// 获取商家的所有产品
router.get('/merchant/:merchantId', (req, res) => {
  const products = db.prepare('SELECT * FROM products WHERE merchant_id = ? ORDER BY created_at DESC').all(req.params.merchantId);
  products.forEach(p => p.images = p.images ? JSON.parse(p.images) : []);
  res.json({ code: 0, data: products });
});

// 添加产品
router.post('/', (req, res) => {
  const { merchant_id, name, description, price, images, category } = req.body;
  if (!merchant_id || !name) return res.json({ code: 1, msg: '商家ID和产品名称必填' });
  const id = uuidv4();
  db.prepare('INSERT INTO products (id, merchant_id, name, description, price, images, category) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, merchant_id, name, description || '', price || 0, JSON.stringify(images || []), category || '');
  res.json({ code: 0, msg: '产品添加成功', data: { id } });
});

// 更新产品
router.put('/:id', (req, res) => {
  const { name, description, price, images, category } = req.body;
  db.prepare('UPDATE products SET name=?, description=?, price=?, images=?, category=? WHERE id=?')
    .run(name, description, price, JSON.stringify(images || []), category, req.params.id);
  res.json({ code: 0, msg: '更新成功' });
});

// 删除产品
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ code: 0, msg: '删除成功' });
});

module.exports = router;
