const express = require('express');
const router = express.Router();
const db = require('../db/init');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// 平台中文名映射
const platformNames = {
  meituan: '美团',
  douyin: '抖音',
  dianping: '大众点评'
};

// 平台对应的system prompt风格
const platformPrompts = {
  meituan: '你在模拟一个美团外卖/到店用户写好评。风格：口语化、热情、提到配送快/味道好/分量足/性价比高，适当用emoji，50-150字。',
  douyin: '你在模拟一个抖音用户写打卡好评。风格：潮流、有梗、提到拍照好看/打卡/种草/已收藏，适当用emoji和话题感，50-150字。',
  dianping: '你在模拟一个大众点评VIP用户写点评。风格：专业、细致、提到食材/做工/环境/服务/性价比，给出五星评价，80-200字。'
};

// 获取AI配置列表
router.get('/config', (req, res) => {
  const configs = db.prepare('SELECT * FROM ai_config ORDER BY created_at DESC').all();
  res.json({ code: 0, data: configs });
});

// 保存AI配置
router.post('/config', (req, res) => {
  const { name, api_url, api_key, model, temperature, max_tokens, is_active } = req.body;
  if (is_active) {
    db.prepare('UPDATE ai_config SET is_active = 0').run();
  }
  db.prepare('INSERT INTO ai_config (name, api_url, api_key, model, temperature, max_tokens, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(name, api_url, api_key, model, temperature || 0.8, max_tokens || 500, is_active ? 1 : 0);
  res.json({ code: 0, msg: '配置保存成功' });
});

// 更新AI配置
router.put('/config/:id', (req, res) => {
  const { name, api_url, api_key, model, temperature, max_tokens, is_active } = req.body;
  if (is_active) {
    db.prepare('UPDATE ai_config SET is_active = 0').run();
  }
  db.prepare('UPDATE ai_config SET name=?, api_url=?, api_key=?, model=?, temperature=?, max_tokens=?, is_active=? WHERE id=?')
    .run(name, api_url, api_key, model, temperature, max_tokens, is_active ? 1 : 0, req.params.id);
  res.json({ code: 0, msg: '配置更新成功' });
});

// 删除AI配置
router.delete('/config/:id', (req, res) => {
  db.prepare('DELETE FROM ai_config WHERE id = ?').run(req.params.id);
  res.json({ code: 0, msg: '删除成功' });
});

// 获取好评模板列表
router.get('/templates', (req, res) => {
  const templates = db.prepare('SELECT * FROM review_templates ORDER BY created_at DESC').all();
  res.json({ code: 0, data: templates });
});

// 添加好评模板
router.post('/templates', (req, res) => {
  const { platform, category, template, keywords } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO review_templates (id, platform, category, template, keywords) VALUES (?, ?, ?, ?, ?)')
    .run(id, platform, category || '', template, keywords || '');
  res.json({ code: 0, msg: '模板添加成功', data: { id } });
});

// 删除好评模板
router.delete('/templates/:id', (req, res) => {
  db.prepare('DELETE FROM review_templates WHERE id = ?').run(req.params.id);
  res.json({ code: 0, msg: '删除成功' });
});

// AI生成好评（核心功能）
router.post('/generate-review', async (req, res) => {
  const { merchant_id, product_id, platform } = req.body;
  
  if (!merchant_id || !platform) {
    return res.json({ code: 1, msg: '缺少必要参数' });
  }

  // 获取商家信息
  const merchant = db.prepare('SELECT * FROM merchants WHERE id = ?').get(merchant_id);
  if (!merchant) return res.json({ code: 1, msg: '商家不存在' });

  // 获取产品信息
  let product = null;
  if (product_id) {
    product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (product) product.images = product.images ? JSON.parse(product.images) : [];
  }

  // 获取激活的AI配置
  const aiConfig = db.prepare('SELECT * FROM ai_config WHERE is_active = 1').get();
  if (!aiConfig || !aiConfig.api_key) {
    // 没有配置AI，使用模板生成
    const template = db.prepare('SELECT * FROM review_templates WHERE platform = ? ORDER BY RANDOM() LIMIT 1').get(platform);
    let reviewContent = '这家店真的很不错，推荐大家来试试！';
    if (template) {
      reviewContent = template.template.replace('{product}', product ? product.name : '菜品');
    }
    const recordId = uuidv4();
    db.prepare('INSERT INTO tap_records (id, merchant_id, product_id, platform, review_content, review_status) VALUES (?, ?, ?, ?, ?, ?)')
      .run(recordId, merchant_id, product_id || null, platform, reviewContent, 'generated');
    return res.json({ 
      code: 0, 
      data: { 
        review: reviewContent, 
        images: product ? product.images : [],
        platform: platform,
        platform_name: platformNames[platform],
        merchant_name: merchant.name,
        product_name: product ? product.name : '',
        record_id: recordId,
        source: 'template'
      },
      msg: '使用模板生成好评（未配置AI接口）'
    });
  }

  // 调用AI大模型生成好评
  try {
    const productName = product ? product.name : '招牌菜';
    const productDesc = product ? (product.description || '') : '';
    const merchantName = merchant.name;
    const merchantCategory = merchant.category || '餐饮';

    const systemPrompt = platformPrompts[platform] || platformPrompts.meituan;
    const userPrompt = `请为以下商家写一条好评：
商家名称：${merchantName}
商家类型：${merchantCategory}
产品名称：${productName}
产品描述：${productDesc}
平台：${platformNames[platform]}

要求：
1. 以消费者第一人称视角写
2. 自然真实，不要太夸张
3. 提到具体的产品名称
4. 包含对味道、服务、环境的评价
5. 50-150字
6. 可以适当加1-2个emoji`;

    const response = await axios.post(aiConfig.api_url, {
      model: aiConfig.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: aiConfig.temperature,
      max_tokens: aiConfig.max_tokens
    }, {
      headers: {
        'Authorization': `Bearer ${aiConfig.api_key}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const reviewContent = response.data.choices[0].message.content.trim();

    // 保存记录
    const recordId = uuidv4();
    db.prepare('INSERT INTO tap_records (id, merchant_id, product_id, platform, review_content, review_status) VALUES (?, ?, ?, ?, ?, ?)')
      .run(recordId, merchant_id, product_id || null, platform, reviewContent, 'generated');

    res.json({
      code: 0,
      data: {
        review: reviewContent,
        images: product ? product.images : [],
        platform: platform,
        platform_name: platformNames[platform],
        merchant_name: merchant.name,
        product_name: productName,
        record_id: recordId,
        source: 'ai'
      },
      msg: 'AI好评生成成功'
    });
  } catch (err) {
    console.error('[AI] 生成好评失败:', err.message);
    // 降级到模板
    const template = db.prepare('SELECT * FROM review_templates WHERE platform = ? ORDER BY RANDOM() LIMIT 1').get(platform);
    let reviewContent = '这家店真的很不错，推荐大家来试试！';
    if (template) {
      reviewContent = template.template.replace('{product}', product ? product.name : '菜品');
    }
    const recordId = uuidv4();
    db.prepare('INSERT INTO tap_records (id, merchant_id, product_id, platform, review_content, review_status) VALUES (?, ?, ?, ?, ?, ?)')
      .run(recordId, merchant_id, product_id || null, platform, reviewContent, 'generated');
    res.json({
      code: 0,
      data: {
        review: reviewContent,
        images: product ? product.images : [],
        platform: platform,
        platform_name: platformNames[platform],
        merchant_name: merchant.name,
        product_name: product ? product.name : '',
        record_id: recordId,
        source: 'template_fallback'
      },
      msg: 'AI接口调用失败，已降级使用模板生成'
    });
  }
});

// 获取碰一碰记录
router.get('/records', (req, res) => {
  const records = db.prepare(`
    SELECT r.*, m.name as merchant_name, p.name as product_name 
    FROM tap_records r 
    LEFT JOIN merchants m ON r.merchant_id = m.id 
    LEFT JOIN products p ON r.product_id = p.id 
    ORDER BY r.created_at DESC LIMIT 100
  `).all();
  res.json({ code: 0, data: records });
});

// 统计数据
router.get('/stats', (req, res) => {
  const merchantCount = db.prepare('SELECT COUNT(*) as count FROM merchants').get().count;
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  const tapCount = db.prepare('SELECT COUNT(*) as count FROM tap_records').get().count;
  const pendingCount = db.prepare("SELECT COUNT(*) as count FROM merchants WHERE status = 'pending'").get().count;
  
  const platformStats = db.prepare(`
    SELECT platform, COUNT(*) as count FROM tap_records GROUP BY platform
  `).all();

  res.json({
    code: 0,
    data: {
      merchantCount,
      productCount,
      tapCount,
      pendingCount,
      platformStats
    }
  });
});

module.exports = router;
