const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const db = require('../db/init');
const path = require('path');

router.post('/generate', async (req, res) => {
  const merchant = db.prepare('SELECT id FROM merchants WHERE id = ?').get(req.body.merchant_id);
  if (!merchant) return res.status(404).json({ code: 1, msg: '商家不存在' });
  const base = (process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const tapUrl = `${base}/api/qrcode/tap?m=${encodeURIComponent(merchant.id)}`;
  try { res.json({ code: 0, data: { qr_url: await QRCode.toDataURL(tapUrl, { width: 400, margin: 2 }), tap_url: tapUrl, nfc_url: tapUrl } }); }
  catch (e) { res.status(500).json({ code: 1, msg: '二维码生成失败' }); }
});
router.get('/tap', (req, res) => res.sendFile(path.join(__dirname, '../public/tap.html')));
router.get('/store', (req, res) => {
  const m = db.prepare('SELECT name, address, meituan_url, douyin_url, dianping_url, xiaohongshu_url, review_text FROM merchants WHERE id = ?').get(req.query.m);
  if (!m) return res.status(404).json({ code: 1, msg: '商家不存在' });
  const products = db.prepare('SELECT images FROM products WHERE merchant_id = ?').all(req.query.m);
  const images = products.flatMap(p => { try { const a = JSON.parse(p.images || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } }).filter(x => typeof x === 'string' && x.startsWith('/uploads/'));
  const actions = db.prepare('SELECT platform, action, url FROM merchant_actions WHERE merchant_id = ?').all(req.query.m);
  res.json({ code: 0, data: { ...m, images, actions } });
});
module.exports = router;
