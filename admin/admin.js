// ====== 碰一碰好评后台管理系统 ======
const API = '';
const apiBase = '';

const state = {
  currentTab: 'dashboard',
  loading: true,
  stats: {},
  merchants: [],
  products: [],
  aiConfigs: [],
  templates: [],
  records: [],
  merchantFilter: '',
  productMerchantFilter: '',
  editingMerchant: null,
  showAiForm: false,
  editingAi: null,
  aiForm: { name:'', api_url:'https://api.openai.com/v1/chat/completions', api_key:'', model:'gpt-3.5-turbo', temperature:0.8, max_tokens:500, is_active:true },
  showTemplateForm: false,
  templateForm: { platform:'meituan', category:'', template:'' }
};

const menuItems = [
  { key:'dashboard', label:'仪表盘', icon:'📊' },
  { key:'merchant', label:'商家管理', icon:'🏪' },
  { key:'product', label:'产品管理', icon:'📦' },
  { key:'ai', label:'AI接口配置', icon:'🤖' },
  { key:'template', label:'好评模板', icon:'📝' },
  { key:'records', label:'碰一碰记录', icon:'📱' }
];

const platformNames = { meituan:'美团', douyin:'抖音', dianping:'大众点评', xiaohongshu:'小红书' };
const statusMap = { pending:'待审核', approved:'已通过', rejected:'已拒绝' };

// ====== API ======
async function api(url, method='GET', body=null) {
  try {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API + url, opts);
    return await res.json();
  } catch(e) {
    console.error('API error:', url, e);
    return { code: 1, msg: '网络请求失败' };
  }
}

// ====== 数据加载 ======
async function loadStats() { const r = await api('/api/ai/stats'); state.stats = r.data || {}; }
async function loadMerchants() { const r = await api('/api/merchant'); state.merchants = r.data || []; }
async function loadProducts() {
  state.products = [];
  if (state.productMerchantFilter) {
    const r = await api('/api/product/merchant/' + state.productMerchantFilter);
    state.products = r.data || [];
  } else {
    for (const m of state.merchants) {
      const r = await api('/api/product/merchant/' + m.id);
      if (r.data) state.products.push(...r.data);
    }
  }
}
async function loadAiConfigs() { const r = await api('/api/ai/config'); state.aiConfigs = r.data || []; }
async function loadTemplates() { const r = await api('/api/ai/templates'); state.templates = r.data || []; }
async function loadRecords() { const r = await api('/api/ai/records'); state.records = r.data || []; }

// ====== 操作 ======
async function auditMerchant(id, status) { await api('/api/merchant/'+id+'/audit','PUT',{status}); await loadMerchants(); render(); }
async function deleteMerchant(id) { if(!confirm('确认删除该商家？')) return; await api('/api/merchant/'+id,'DELETE'); await loadMerchants(); render(); }

async function editMerchantByIndex(idx) {
 const r = await api('/api/merchant/' + state.merchants[idx].id);
 if (r.code !== 0) { alert(r.msg || '读取失败'); return; }
 state.editingMerchant = r.data; state.editingMerchant.actionMap = {};
 for (const item of r.data.actions || []) state.editingMerchant.actionMap[item.platform + ':' + item.action] = item.url;
 render();
}
async function saveMerchant() {
  const m = state.editingMerchant;
  const entries = Object.entries(m.actionMap || {}).map(([key,url]) => { const [platform, action] = key.split(':'); return {platform, action, url: url.trim()}; });
  const a = await api('/api/merchant/'+m.id+'/actions','PUT',{actions:entries});
  if (a.code !== 0) { alert(a.msg || '操作链接保存失败'); return; }
  const r = await api('/api/merchant/'+m.id,'PUT',m);
  if (r.code !== 0) { alert(r.msg || '商家保存失败'); return; }
  state.editingMerchant=null; await loadMerchants(); render();
}

function editAiByIndex(idx) {
  state.editingAi = state.aiConfigs[idx];
  state.aiForm = JSON.parse(JSON.stringify(state.aiConfigs[idx]));
  state.aiForm.is_active = !!state.aiForm.is_active;
  state.showAiForm = true; render();
}
async function saveAi() {
  if(state.editingAi) await api('/api/ai/config/'+state.editingAi.id,'PUT',state.aiForm);
  else await api('/api/ai/config','POST',state.aiForm);
  state.showAiForm=false; state.editingAi=null; await loadAiConfigs(); render();
}
async function deleteAi(id) { if(!confirm('确认删除？')) return; await api('/api/ai/config/'+id,'DELETE'); await loadAiConfigs(); render(); }

async function saveTemplate() {
  await api('/api/ai/templates','POST',state.templateForm);
  state.showTemplateForm=false; state.templateForm={platform:'meituan',category:'',template:''};
  await loadTemplates(); render();
}
async function deleteTemplate(id) { if(!confirm('确认删除？')) return; await api('/api/ai/templates/'+id,'DELETE'); await loadTemplates(); render(); }

// ====== 工具 ======
function formatTime(t) { return t ? String(t).replace('T',' ').substring(0,16) : '-'; }
function parseImages(imgs) { if(typeof imgs==='string'){try{return JSON.parse(imgs)}catch(e){return[]}} return imgs||[]; }
function esc(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function switchTab(key) {
  state.currentTab = key;
  state.loading = true;
  render();
  const loaders = {
    dashboard: () => loadStats(),
    merchant: () => loadMerchants(),
    product: () => loadMerchants().then(() => loadProducts()),
    ai: () => loadAiConfigs(),
    template: () => loadTemplates(),
    records: () => loadRecords()
  };
  if (loaders[key]) {
    loaders[key]().then(() => { state.loading = false; render(); }).catch(() => { state.loading = false; render(); });
  }
}

// ====== 渲染 ======
function render() {
  const app = document.getElementById('app');
  const cur = menuItems.find(m => m.key === state.currentTab) || menuItems[0];
  app.innerHTML = `
    <div class="sidebar">
      <div class="logo"><span class="logo-icon">📱</span><span class="logo-text">碰一碰</span></div>
      <div class="logo-subtitle">好评管理系统</div>
      <nav class="nav-menu">
        ${menuItems.map(m=>`<a class="nav-item ${state.currentTab===m.key?'active':''}" onclick="switchTab('${m.key}')"><span class="nav-icon">${m.icon}</span><span>${m.label}</span></a>`).join('')}
      </nav>
    </div>
    <div class="main-content">
      <div class="topbar"><h1>${cur.label}</h1><div class="topbar-right"><span class="status-dot"></span><span>服务运行中</span></div></div>
      <div class="content-area">${state.loading ? '<div class="loading">加载中...</div>' : renderTab()}</div>
    </div>`;
}

function renderTab() {
  switch(state.currentTab) {
    case 'dashboard': return renderDashboard();
    case 'merchant': return renderMerchant();
    case 'product': return renderProduct();
    case 'ai': return renderAi();
    case 'template': return renderTemplate();
    case 'records': return renderRecords();
  }
  return '';
}

function renderDashboard() {
  const s = state.stats;
  return `<div class="stats-grid">
    <div class="stat-card"><div class="stat-icon">🏪</div><div><div class="stat-value">${s.merchantCount||0}</div><div class="stat-label">入驻商家</div></div></div>
    <div class="stat-card"><div class="stat-icon">📦</div><div><div class="stat-value">${s.productCount||0}</div><div class="stat-label">产品总数</div></div></div>
    <div class="stat-card"><div class="stat-icon">📱</div><div><div class="stat-value">${s.tapCount||0}</div><div class="stat-label">文案生成次数</div></div></div>
    <div class="stat-card"><div class="stat-icon">⏳</div><div><div class="stat-value">${s.pendingCount||0}</div><div class="stat-label">待审核商家</div></div></div>
  </div>
  <div class="panel"><div class="panel-title">平台碰一碰统计</div><div class="platform-stats">
    ${(s.platformStats||[]).map(ps=>`<div class="platform-stat-item"><span class="platform-badge badge-${ps.platform}">${platformNames[ps.platform]||ps.platform}</span><span class="platform-count">${ps.count}</span>次</div>`).join('')||'<div class="empty-text">暂无数据</div>'}
  </div></div>
  <div class="panel"><div class="panel-title">系统说明</div><div class="info-list">
    <div class="info-item"><span class="info-icon">✅</span> 商家通过小程序入驻，填写产品信息并上传图片</div>
    <div class="info-item"><span class="info-icon">✅</span> 系统生成二维码和 NFC 标签链接；标签需使用写卡工具写入</div>
    <div class="info-item"><span class="info-icon">✅</span> 客户进入门店页面后可选择已配置的平台链接</div>
    <div class="info-item"><span class="info-icon">✅</span> 顾客根据真实体验填写并复制文字，在平台自主发布</div>
    <div class="info-item"><span class="info-icon">⚙️</span> 请在「AI接口配置」中配置大模型API以启用AI生成功能</div>
  </div></div>`;
}

function renderMerchant() {
  const list = state.merchants.filter(m => !state.merchantFilter || m.status === state.merchantFilter);
  return `<div class="panel"><div class="panel-header"><div class="panel-title">商家列表</div>
    <div class="filter-bar">
      <select class="filter-select" onchange="state.merchantFilter=this.value;render()">
        <option value="">全部状态</option><option value="pending">待审核</option><option value="approved">已通过</option><option value="rejected">已拒绝</option>
      </select>
      <button class="btn btn-primary" onclick="loadMerchants().then(render)">刷新</button>
    </div></div>
    <table><thead><tr><th>商家名称</th><th>手机号</th><th>分类</th><th>地址</th><th>状态</th><th>入驻时间</th><th>操作</th></tr></thead><tbody>
    ${list.map((m,i)=>`<tr><td>${esc(m.name)}</td><td>${esc(m.phone)}</td><td>${esc(m.category)||'-'}</td><td>${esc(m.address)||'-'}</td>
      <td><span class="status-tag status-${escAttr(m.status)}">${statusMap[m.status]||m.status}</span></td><td>${formatTime(m.created_at)}</td><td>
      ${m.status==='pending'?`<button class="btn btn-sm btn-success" onclick="auditMerchant('${escAttr(m.id)}','approved')">通过</button><button class="btn btn-sm btn-danger" onclick="auditMerchant('${escAttr(m.id)}','rejected')">拒绝</button>`:''}
      <button class="btn btn-sm btn-info" onclick="editMerchantByIndex(${state.merchants.indexOf(m)})">编辑</button>
      <button class="btn btn-sm btn-danger" onclick="deleteMerchant('${escAttr(m.id)}')">删除</button>
      </td></tr>`).join('')}
    ${list.length===0?'<tr><td colspan="7" class="empty-text">暂无商家数据</td></tr>':''}
    </tbody></table></div>${state.editingMerchant?renderMerchantModal():''}`;
}

function renderActionFields(m) {
  const platforms = [['xiaohongshu','小红书'],['douyin','抖音'],['meituan','美团'],['dianping','大众点评']];
  const actions = [['favorite','收藏'],['checkin','打卡'],['review','评价'],['publish','发布']];
  return '<p>操作链接可选填。请填写平台提供的 HTTPS 页面链接；留空时顾客从门店页自行操作。</p>' + platforms.map(([platform,label]) => '<h4>' + label + '</h4>' + actions.map(([action,title]) => { const key = platform + ':' + action; return '<div class="form-group"><label>' + title + '链接</label><input class="form-input" value="' + escAttr(m.actionMap[key] || '') + '" placeholder="https://..." oninput="state.editingMerchant.actionMap[&quot;' + key + '&quot;]=this.value"></div>'; }).join('')).join('');
}

function renderMerchantModal() {
  const m = state.editingMerchant;
  return `<div class="modal-overlay" onclick="if(event.target===this){state.editingMerchant=null;render()}">
    <div class="modal"><div class="modal-header"><h3>编辑商家</h3><button class="modal-close" onclick="state.editingMerchant=null;render()">×</button></div>
    <div class="modal-body">
      <div class="form-group"><label>商家名称</label><input class="form-input" value="${esc(m.name)}" oninput="state.editingMerchant.name=this.value"></div>
      <div class="form-group"><label>手机号</label><input class="form-input" value="${esc(m.phone)}" oninput="state.editingMerchant.phone=this.value"></div>
      <div class="form-group"><label>分类</label><input class="form-input" value="${esc(m.category)}" oninput="state.editingMerchant.category=this.value"></div>
      <div class="form-group"><label>地址</label><input class="form-input" value="${esc(m.address)}" oninput="state.editingMerchant.address=this.value"></div>
      <div class="form-group"><label>美团商家链接</label><input class="form-input" value="${esc(m.meituan_url)}" placeholder="https://..." oninput="state.editingMerchant.meituan_url=this.value"></div>
      <div class="form-group"><label>抖音商家链接</label><input class="form-input" value="${esc(m.douyin_url)}" placeholder="https://..." oninput="state.editingMerchant.douyin_url=this.value"></div>
      <div class="form-group"><label>大众点评商家链接</label><input class="form-input" value="${esc(m.dianping_url)}" placeholder="https://..." oninput="state.editingMerchant.dianping_url=this.value"></div>
      <div class="form-group"><label>门店参考文案（顾客可编辑）</label><textarea class="form-input" rows="4" oninput="state.editingMerchant.review_text=this.value">${esc(m.review_text)}</textarea></div>
      ${renderActionFields(m)}
      <div class="form-group"><label>小红书门店链接</label><input class="form-input" value="${esc(m.xiaohongshu_url)}" placeholder="https://..." oninput="state.editingMerchant.xiaohongshu_url=this.value"></div>
    </div>
    <div class="modal-footer"><button class="btn btn-default" onclick="state.editingMerchant=null;render()">取消</button><button class="btn btn-primary" onclick="saveMerchant()">保存</button></div>
  </div></div>`;
}

function renderProduct() {
  return `<div class="panel"><div class="panel-header"><div class="panel-title">产品列表</div>
    <select class="filter-select" onchange="state.productMerchantFilter=this.value;loadProducts().then(render)">
      <option value="">全部商家</option>${state.merchants.map(m=>`<option value="${escAttr(m.id)}" ${state.productMerchantFilter===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}
    </select></div>
    <div class="product-grid">
      ${state.products.map(p=>{const imgs=parseImages(p.images);return `<div class="product-card">
        <div class="product-images">${imgs.slice(0,3).map(i=>`<img class="product-img" src="${escAttr(apiBase+i)}" onerror="this.style.display='none'">`).join('')}</div>
        <div class="product-info"><div class="product-name">${esc(p.name)}</div><div class="product-desc">${esc(p.description)||'暂无描述'}</div><div class="product-price">¥${p.price||0}</div></div>
      </div>`;}).join('')}
      ${state.products.length===0?'<div class="empty-text" style="grid-column:1/-1">暂无产品数据</div>':''}
    </div></div>`;
}

function renderAi() {
  return `<div class="panel"><div class="panel-header"><div class="panel-title">大模型接口配置</div>
    <button class="btn btn-primary" onclick="state.editingAi=null;state.aiForm={name:'',api_url:'https://api.openai.com/v1/chat/completions',api_key:'',model:'gpt-3.5-turbo',temperature:0.8,max_tokens:500,is_active:true};state.showAiForm=true;render()">+ 新增配置</button></div>
    <table><thead><tr><th>名称</th><th>API地址</th><th>模型</th><th>温度</th><th>状态</th><th>操作</th></tr></thead><tbody>
    ${state.aiConfigs.map((c,i)=>`<tr><td>${esc(c.name)}</td><td class="url-cell" title="${escAttr(c.api_url)}">${esc(c.api_url)}</td><td>${esc(c.model)}</td><td>${c.temperature}</td>
      <td><span class="status-tag ${c.is_active?'status-approved':'status-pending'}">${c.is_active?'使用中':'未启用'}</span></td><td>
      <button class="btn btn-sm btn-info" onclick="editAiByIndex(${i})">编辑</button>
      <button class="btn btn-sm btn-danger" onclick="deleteAi(${c.id})">删除</button></td></tr>`).join('')}
    ${state.aiConfigs.length===0?'<tr><td colspan="6" class="empty-text">暂无配置，请添加大模型API接口</td></tr>':''}
    </tbody></table></div>
    <div class="panel"><div class="panel-title">配置说明</div><div class="info-list">
      <div class="info-item"><span class="info-icon">📌</span> 支持OpenAI兼容格式（OpenAI、DeepSeek、通义千问、文心一言等）</div>
      <div class="info-item"><span class="info-icon">📌</span> API地址格式：https://api.openai.com/v1/chat/completions</div>
      <div class="info-item"><span class="info-icon">📌</span> 配置后，客户碰一碰时自动调用AI生成好评文案</div>
      <div class="info-item"><span class="info-icon">📌</span> 未配置API时，系统使用内置模板生成好评</div>
      <div class="info-item"><span class="info-icon">🔐</span> API Key安全存储在服务端，不暴露给前端</div>
    </div></div>${state.showAiForm?renderAiModal():''}`;
}

function renderAiModal() {
  const f = state.aiForm;
  return `<div class="modal-overlay" onclick="if(event.target===this){state.showAiForm=false;render()}">
    <div class="modal"><div class="modal-header"><h3>${state.editingAi?'编辑':'新增'}AI接口配置</h3><button class="modal-close" onclick="state.showAiForm=false;render()">×</button></div>
    <div class="modal-body">
      <div class="form-group"><label>配置名称</label><input class="form-input" value="${esc(f.name)}" placeholder="如：OpenAI GPT-4" oninput="state.aiForm.name=this.value"></div>
      <div class="form-group"><label>API地址</label><input class="form-input" value="${esc(f.api_url)}" placeholder="https://api.openai.com/v1/chat/completions" oninput="state.aiForm.api_url=this.value"></div>
      <div class="form-group"><label>API Key</label><input class="form-input" type="password" value="${esc(f.api_key)}" placeholder="sk-..." oninput="state.aiForm.api_key=this.value"></div>
      <div class="form-group"><label>模型名称</label><input class="form-input" value="${esc(f.model)}" placeholder="gpt-3.5-turbo" oninput="state.aiForm.model=this.value"></div>
      <div class="form-row">
        <div class="form-group" style="flex:1"><label>温度(0-2)</label><input class="form-input" type="number" step="0.1" min="0" max="2" value="${f.temperature}" oninput="state.aiForm.temperature=parseFloat(this.value)"></div>
        <div class="form-group" style="flex:1"><label>最大Token</label><input class="form-input" type="number" value="${f.max_tokens}" oninput="state.aiForm.max_tokens=parseInt(this.value)"></div>
      </div>
      <div class="form-group"><label class="checkbox-label"><input type="checkbox" ${f.is_active?'checked':''} onchange="state.aiForm.is_active=this.checked"> 设为当前使用配置</label></div>
    </div>
    <div class="modal-footer"><button class="btn btn-default" onclick="state.showAiForm=false;render()">取消</button><button class="btn btn-primary" onclick="saveAi()">保存</button></div>
  </div></div>`;
}

function renderTemplate() {
  return `<div class="panel"><div class="panel-header"><div class="panel-title">好评模板管理</div>
    <button class="btn btn-primary" onclick="state.showTemplateForm=true;render()">+ 新增模板</button></div>
    <table><thead><tr><th>平台</th><th>分类</th><th>模板内容</th><th>操作</th></tr></thead><tbody>
    ${state.templates.map(t=>`<tr><td><span class="platform-badge badge-${escAttr(t.platform)}">${platformNames[t.platform]||t.platform}</span></td><td>${esc(t.category)||'通用'}</td><td class="template-cell">${esc(t.template)}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteTemplate('${escAttr(t.id)}')">删除</button></td></tr>`).join('')}
    ${state.templates.length===0?'<tr><td colspan="4" class="empty-text">暂无模板</td></tr>':''}
    </tbody></table></div>${state.showTemplateForm?renderTemplateModal():''}`;
}

function renderTemplateModal() {
  const f = state.templateForm;
  return `<div class="modal-overlay" onclick="if(event.target===this){state.showTemplateForm=false;render()}">
    <div class="modal"><div class="modal-header"><h3>新增好评模板</h3><button class="modal-close" onclick="state.showTemplateForm=false;render()">×</button></div>
    <div class="modal-body">
      <div class="form-group"><label>平台</label><select class="form-input" onchange="state.templateForm.platform=this.value">
        <option value="meituan" ${f.platform==='meituan'?'selected':''}>美团</option>
        <option value="douyin" ${f.platform==='douyin'?'selected':''}>抖音</option>
        <option value="dianping" ${f.platform==='dianping'?'selected':''}>大众点评</option>
      </select></div>
      <div class="form-group"><label>分类（可选）</label><input class="form-input" value="${esc(f.category)}" placeholder="如：餐饮、丽人、娱乐" oninput="state.templateForm.category=this.value"></div>
      <div class="form-group"><label>模板内容</label><textarea class="form-input" rows="4" placeholder="使用{product}代替产品名称" oninput="state.templateForm.template=this.value">${esc(f.template)}</textarea></div>
    </div>
    <div class="modal-footer"><button class="btn btn-default" onclick="state.showTemplateForm=false;render()">取消</button><button class="btn btn-primary" onclick="saveTemplate()">保存</button></div>
  </div></div>`;
}

function renderRecords() {
  return `<div class="panel"><div class="panel-header"><div class="panel-title">碰一碰记录</div>
    <button class="btn btn-primary" onclick="loadRecords().then(render)">刷新</button></div>
    <table><thead><tr><th>时间</th><th>商家</th><th>产品</th><th>平台</th><th>好评内容</th><th>来源</th></tr></thead><tbody>
    ${state.records.map(r=>`<tr><td>${formatTime(r.created_at)}</td><td>${esc(r.merchant_name)||'-'}</td><td>${esc(r.product_name)||'-'}</td>
      <td><span class="platform-badge badge-${escAttr(r.platform)}">${platformNames[r.platform]||r.platform}</span></td>
      <td class="template-cell">${esc(r.review_content)}</td><td>${esc(r.review_status)}</td></tr>`).join('')}
    ${state.records.length===0?'<tr><td colspan="6" class="empty-text">暂无碰一碰记录</td></tr>':''}
    </tbody></table></div>`;
}

// ====== 初始化 ======
switchTab('dashboard');
