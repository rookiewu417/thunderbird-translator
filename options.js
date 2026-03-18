/**
 * options.js - 设置页面逻辑
 * 管理翻译引擎配置、API 凭据存储、连接测试
 */

const DEFAULTS = {
  engine: 'baidu',
  appid: '',
  key: ''
};

const els = {
  engine:    document.getElementById('engine'),
  appid:     document.getElementById('appid'),
  key:       document.getElementById('key'),
  saveBtn:   document.getElementById('saveBtn'),
  testBtn:   document.getElementById('testBtn'),
  resetBtn:  document.getElementById('resetBtn'),
  toggleKey: document.getElementById('toggleKey'),
  statusBar: document.getElementById('statusBar'),
  statusIcon: document.getElementById('statusIcon'),
  statusMsg: document.getElementById('statusMsg')
};

// ── 状态提示 ──
function showStatus(type, msg) {
  els.statusBar.className = `status ${type}`;
  const icons = { success: '✅', error: '❌', warning: '⚠️', loading: '⏳' };
  els.statusIcon.textContent = icons[type] || '';
  els.statusMsg.textContent = msg;
  els.statusBar.classList.remove('hidden');
  if (type !== 'loading') {
    setTimeout(() => {
      els.statusBar.classList.add('hidden');
    }, 4000);
  }
}

// ── 加载配置 ──
async function loadConfig() {
  const config = await browser.storage.local.get(Object.keys(DEFAULTS));
  els.engine.value = config.engine || DEFAULTS.engine;
  els.appid.value  = config.appid  || DEFAULTS.appid;
  els.key.value    = config.key    || DEFAULTS.key;
}

// ── 保存配置 ──
async function saveConfig() {
  const config = {
    engine: els.engine.value,
    appid:  els.appid.value.trim(),
    key:    els.key.value.trim()
  };

  if (!config.appid || !config.key) {
    showStatus('warning', '请填写 AppID 和密钥');
    return false;
  }

  await browser.storage.local.set(config);
  showStatus('success', '设置已保存');
  return true;
}

// ── 测试连接 ──
async function testConnection() {
  const appid = els.appid.value.trim();
  const key   = els.key.value.trim();

  if (!appid || !key) {
    showStatus('warning', '请先填写 AppID 和密钥');
    return;
  }

  showStatus('loading', '正在测试连接…');
  els.testBtn.disabled = true;

  try {
    // 先保存再测试
    await browser.storage.local.set({
      engine: els.engine.value,
      appid, key
    });

    // 发送测试翻译请求到后台
    const result = await browser.runtime.sendMessage({
      type: 'testConnection',
      text: 'hello',
      toLang: 'zh'
    });

    if (result && result.success) {
      showStatus('success', `连接成功！测试翻译："hello" → "${result.translated}"`);
    } else {
      showStatus('error', result.error || '连接失败，请检查 API 配置');
    }
  } catch (err) {
    showStatus('error', `连接失败：${err.message}`);
  } finally {
    els.testBtn.disabled = false;
  }
}

// ── 重置配置 ──
async function resetConfig() {
  if (!confirm('确定要重置所有设置吗？')) return;
  await browser.storage.local.set(DEFAULTS);
  await loadConfig();
  showStatus('success', '设置已重置为默认值');
}

// ── 密码显示/隐藏 ──
els.toggleKey.addEventListener('click', () => {
  const input = els.key;
  if (input.type === 'password') {
    input.type = 'text';
    els.toggleKey.textContent = '🙈';
  } else {
    input.type = 'password';
    els.toggleKey.textContent = '👁';
  }
});

// ── 事件绑定 ──
els.saveBtn.addEventListener('click', saveConfig);
els.testBtn.addEventListener('click', testConnection);
els.resetBtn.addEventListener('click', resetConfig);

// ── 初始化 ──
loadConfig();
