const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = process.env.PENG_DB_PATH || path.join(__dirname, 'pengyipeng.db');
const db = new DatabaseSync(dbPath);

// 启用WAL模式提升性能
db.exec('PRAGMA journal_mode = WAL');

// 初始化所有表
function initDB() {
  // 商家表
  db.exec(`
    CREATE TABLE IF NOT EXISTS merchants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      category TEXT,
      address TEXT,
      logo TEXT,
      status TEXT DEFAULT 'pending',
      meituan_url TEXT,
      douyin_url TEXT,
      dianping_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const columns = db.prepare('PRAGMA table_info(merchants)').all().map(c => c.name);
  if (!columns.includes('xiaohongshu_url')) db.exec('ALTER TABLE merchants ADD COLUMN xiaohongshu_url TEXT');

  db.exec("CREATE TABLE IF NOT EXISTS merchant_actions (merchant_id TEXT NOT NULL, platform TEXT NOT NULL, action TEXT NOT NULL, url TEXT NOT NULL, PRIMARY KEY (merchant_id, platform, action))");
  if (!columns.includes('review_text')) db.exec('ALTER TABLE merchants ADD COLUMN review_text TEXT');

  // 产品表
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL,
      images TEXT,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (merchant_id) REFERENCES merchants(id)
    )
  `);

  // 碰一碰记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS tap_records (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL,
      product_id TEXT,
      platform TEXT,
      review_content TEXT,
      review_status TEXT DEFAULT 'generated',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (merchant_id) REFERENCES merchants(id)
    )
  `);

  // AI接口配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      api_url TEXT NOT NULL,
      api_key TEXT,
      model TEXT DEFAULT 'gpt-3.5-turbo',
      temperature REAL DEFAULT 0.8,
      max_tokens INTEGER DEFAULT 500,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 好评模板表
  db.exec(`
    CREATE TABLE IF NOT EXISTS review_templates (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      category TEXT,
      template TEXT NOT NULL,
      keywords TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 管理员表
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 插入默认管理员
  const adminExists = db.prepare('SELECT COUNT(*) as count FROM admins WHERE username = ?').get('admin');
  if (adminExists.count === 0) {
    db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', 'admin123');
  }

  // 插入默认AI配置
  const configExists = db.prepare('SELECT COUNT(*) as count FROM ai_config').get();
  if (configExists.count === 0) {
    db.prepare(`INSERT INTO ai_config (name, api_url, api_key, model, is_active) VALUES (?, ?, ?, ?, ?)`)
      .run('默认大模型', 'https://api.openai.com/v1/chat/completions', '', 'gpt-3.5-turbo', 1);
  }

  // 插入默认好评模板
  const templateExists = db.prepare('SELECT COUNT(*) as count FROM review_templates').get();
  if (templateExists.count === 0) {
    const templates = [
      { platform: 'meituan', template: '这家店真的太棒了！{product}味道超好，分量足，服务态度也特别好，环境干净整洁，下次还会再来！强烈推荐给大家~' },
      { platform: 'douyin', template: '打卡{product}！真的绝了，口感一级棒，拍照也超好看，店员小哥哥小姐姐态度超好，已收藏已推荐！' },
      { platform: 'dianping', template: '慕名而来尝了{product}，果然名不虚传！食材新鲜，做工讲究，性价比很高，环境也很舒适，五星好评！' }
    ];
    const stmt = db.prepare('INSERT INTO review_templates (id, platform, template) VALUES (?, ?, ?)');
    const { v4: uuidv4 } = require('uuid');
    templates.forEach(t => stmt.run(uuidv4(), t.platform, t.template));
  }

  console.log('[DB] 数据库初始化完成');
}

initDB();

module.exports = db;
