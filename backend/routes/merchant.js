const express = require('express');
const router = express.Router();
const db = require('../db/init');
const { v4: uuidv4 } = require('uuid');

// 获取所有商家
router.get('/', (req, res) => {
  const merchants = db.prepare('SELECT * FROM merchants ORDER BY created_at DESC').all();
  res.json({ code: 0, data: merchants });
});

const platforms = ['xiaohongshu', 'douyin', 'meituan', 'dianping'];
const actions = ['favorite', 'checkin', 'review', 'publish'];
router.put('/:id/actions', (req, res) => {
  if (!db.prepare('SELECT id FROM merchants WHERE id = ?').get(req.params.id)) return res.status(404).json({ code: 1, msg: '商家不存在' });
  const entries = req.body.actions;
  if (!Array.isArray(entries) || entries.length > 16) return res.status(400).json({ code: 1, msg: '配置格式错误' });
  const seen = new Set();
  for (const item of entries) {
    if (!item || !platforms.includes(item.platform) || !actions.includes(item.action) || typeof item.url !== 'string') return res.status(400).json({ code: 1, msg: '平台或操作无效' });
    const key = item.platform + ':' + item.action;
    if (seen.has(key)) return res.status(400).json({ code: 1, msg: '操作重复' });
    seen.add(key);
    if (item.url) { try { const u = new URL(item.url); if (u.protocol !== 'https:' || u.username || u.password) throw Error(); } catch { return res.status(400).json({ code: 1, msg: '操作链接必须是有效的 HTTPS 地址' }); } }
  }
  db.exec('BEGIN');
  try {
    db.prepare('DELETE FROM merchant_actions WHERE merchant_id = ?').run(req.params.id);
    const insert = db.prepare('INSERT INTO merchant_actions (merchant_id, platform, action, url) VALUES (?, ?, ?, ?)');
    for (const item of entries) if (item.url) insert.run(req.params.id, item.platform, item.action, item.url);
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); return res.status(500).json({ code: 1, msg: '保存失败' }); }
  res.json({ code: 0, msg: '保存成功' });
});

// 获取单个商家详情
router.get('/:id', (req, res) => {
  const merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(req.params.id);
  if (!merchant) return res.json({ code: 1, msg: '商家不存在' });
  const products = db.prepare('SELECT * FROM products WHERE merchant_id = ?').all(req.params.id);
  const actions = db.prepare('SELECT platform, action, url FROM merchant_actions WHERE merchant_id = ?').all(req.params.id);
  res.json({ code: 0, data: { ...merchant, products, actions } });
});

// 商家入驻
router.post('/register', (req, res) => {
  const { name, phone, category, address, logo, meituan_url, douyin_url, dianping_url, xiaohongshu_url, review_text } = req.body;
  if (!name || !phone) return res.json({ code: 1, msg: '商家名称和手机号必填' });
  const id = uuidv4();
  db.prepare(`INSERT INTO merchants (id, name, phone, category, address, logo, status, meituan_url, douyin_url, dianping_url, xiaohongshu_url, review_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, name, phone, category || '', address || '', logo || '', 'pending', meituan_url || '', douyin_url || '', dianping_url || '', xiaohongshu_url || '', review_text || '');
  res.json({ code: 0, msg: '入驻申请已提交，等待审核', data: { id } });
});

// 更新商家信息
router.put('/:id', (req, res) => {
  const { name, phone, category, address, logo, status, meituan_url, douyin_url, dianping_url, xiaohongshu_url } = req.body;
  const merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(req.params.id);
  if (!merchant) return res.json({ code: 1, msg: '商家不存在' });
  db.prepare(`UPDATE merchants SET name=?, phone=?, category=?, address=?, logo=?, status=?, meituan_url=?, douyin_url=?, dianping_url=?, xiaohongshu_url=?, review_text=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(name || merchant.name, phone || merchant.phone, category || merchant.category, address || merchant.address, logo || merchant.logo, status || merchant.status, meituan_url ?? merchant.meituan_url, douyin_url ?? merchant.douyin_url, dianping_url ?? merchant.dianping_url, xiaohongshu_url ?? merchant.xiaohongshu_url, review_text ?? merchant.review_text, req.params.id);
  res.json({ code: 0, msg: '更新成功' });
});

// 删除商家
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM merchant_actions WHERE merchant_id = ?').run(req.params.id);
  db.prepare('DELETE FROM products WHERE merchant_id = ?').run(req.params.id);
  db.prepare('DELETE FROM merchants WHERE id = ?').run(req.params.id);
  res.json({ code: 0, msg: '删除成功' });
});

// 审核商家
router.put('/:id/audit', (req, res) => {
  const { status } = req.body; // approved / rejected
  db.prepare('UPDATE merchants SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(status, req.params.id);
  res.json({ code: 0, msg: '审核操作完成' });
});

module.exports = router;
