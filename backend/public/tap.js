(async () => {
  async function copyText(text, field) {
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } } catch {}
    try { field.focus(); field.select(); return document.execCommand('copy'); } catch { return false; }
  }
  const id = new URLSearchParams(location.search).get('m');
  const name = document.getElementById('name');
  try {
    const response = await fetch('/api/qrcode/store?m=' + encodeURIComponent(id || ''));
    const result = await response.json();
    if (!response.ok || result.code !== 0) throw new Error('门店不存在');
    const store = result.data;
    name.textContent = store.name;
    document.getElementById('address').textContent = store.address || '请向商家确认门店地址';
    document.getElementById('review').value = store.review_text || '';
    const container = document.getElementById('platforms');
    for (const [key, label] of [['xiaohongshu','小红书'],['douyin','抖音'],['meituan','美团'],['dianping','大众点评']]) {
      const group = document.createElement('div');
      const title = document.createElement('h3'); title.textContent = label; group.append(title);
      for (const [action, text] of [['favorite','收藏'],['checkin','打卡'],['review','评价'],['publish','发布']]) {
        const found = (store.actions || []).find(item => item.platform === key && item.action === action);
        let url; try { url = new URL(found ? found.url : store[key + '_url']); } catch {}
        const link = document.createElement('a');
        if (url && ['https:', 'http:'].includes(url.protocol)) {
          link.href = url.href; link.rel = 'noopener noreferrer';
          link.textContent = found ? text + '：打开对应页面' : text + '：进入门店后操作';
          if (key === 'xiaohongshu' && action === 'publish') {
            link.textContent = '复制文案并打开小红书';
            link.onclick = async event => {
              event.preventDefault();
              const field = document.getElementById('review');
              const status = document.getElementById('copy-status');
              const content = field.value.trim();
              if (!content) { status.textContent = '请先填写或修改文案，再点击小红书发布'; field.focus(); field.scrollIntoView(); return; }
              if (await copyText(content, field)) {
                status.textContent = '文案已复制。进入小红书发布页后，如未自动出现，请长按正文粘贴。';
                window.location.href = url.href;
              } else {
                status.textContent = '复制未成功，请长按文案选择复制，再点击小红书入口。';
                field.focus(); field.select(); field.scrollIntoView();
              }
            };
          }
        } else { link.textContent = text + '：暂未配置入口'; link.style.background = '#eee'; }
        group.append(link);
      }
      container.append(group);
    }
    function draw() {
      const box = document.getElementById('images'); box.replaceChildren();
      const imgs = [...store.images].sort(() => Math.random() - .5).slice(0, 3);
      if (!imgs.length) { box.textContent = '暂无商家图片'; return; }
      imgs.forEach(src => { const image = document.createElement('img'); image.src = src; image.alt = '商家图片'; box.append(image); });
    }
    draw(); document.getElementById('random').onclick = draw;
  } catch (err) { name.textContent = '门店加载失败'; document.getElementById('address').textContent = err.message; }
  let localUrls = [];
  document.getElementById('local-photos').onchange = e => {
    localUrls.forEach(URL.revokeObjectURL); localUrls = [];
    const box = document.getElementById('local-preview'); box.replaceChildren();
    Array.from(e.target.files).slice(0, 9).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const src = URL.createObjectURL(file); localUrls.push(src);
      const img = document.createElement('img'); img.src = src; img.alt = '自己选择的照片'; box.append(img);
    });
  };
  document.getElementById('copy').onclick = async () => {
    const text = document.getElementById('review').value.trim(), status = document.getElementById('copy-status');
    if (!text) { status.textContent = '请先填写体验'; return; }
    if (await copyText(text, document.getElementById('review'))) status.textContent = '已复制，请在目标平台粘贴';
    else { document.getElementById('review').select(); status.textContent = '请长按选择并复制文字'; }
  };
})();
