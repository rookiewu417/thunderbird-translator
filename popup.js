/**
 * popup.js - 工具栏弹窗逻辑
 * 从 storage 读取翻译结果，渲染到界面
 */

const LANG_NAMES = {
  zh: '中文', en: '英文', jp: '日文',
  kor: '韩文', fra: '法文', de: '德文',
  auto: '自动检测', ru: '俄文', spa: '西班牙文'
};

// 所有状态容器
const states = {
  empty:   document.getElementById('stateEmpty'),
  loading: document.getElementById('stateLoading'),
  error:   document.getElementById('stateError'),
  result:  document.getElementById('stateResult')
};

function showState(name) {
  Object.entries(states).forEach(([key, el]) => {
    el.classList.toggle('hidden', key !== name);
  });
}

function formatTime(ts) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
}

function renderResult(data) {
  document.getElementById('originalText').textContent  = data.original;
  document.getElementById('translatedText').textContent = data.translated;
  document.getElementById('fromLangLabel').textContent  = '原文（' + (LANG_NAMES[data.from] || data.from) + '）';
  document.getElementById('toLangBadge').textContent    = '→ ' + (LANG_NAMES[data.to] || data.to);
  document.getElementById('engineTag').textContent      = data.engine || '翻译';
  document.getElementById('timeLabel').textContent      = formatTime(data.time);
  showState('result');
}

function renderError(msg) {
  document.getElementById('errorMsg').textContent = msg || '翻译失败，请检查 API 配置';
  showState('error');
}

async function refreshDisplay() {
  const config = await browser.storage.local.get('lastTranslation');
  const data = config.lastTranslation;

  if (!data) {
    showState('empty');
    return;
  }

  switch (data.status) {
    case 'loading':
      showState('loading');
      // 显示分段翻译进度
      if (data.progress) {
        document.querySelector('.loading-text').textContent = data.progress;
      } else {
        document.querySelector('.loading-text').textContent = '正在翻译…';
      }
      break;
    case 'error':
      renderError(data.errorMsg);
      break;
    case 'success':
      renderResult(data);
      break;
    default:
      showState('empty');
  }
}

// ── 复制功能 ──
document.getElementById('copyBtn').addEventListener('click', () => {
  const text = document.getElementById('translatedText').textContent;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 1900);
  });
});

// ── 前往设置 ──
document.getElementById('settingsBtn').addEventListener('click', () => {
  browser.runtime.openOptionsPage();
  window.close();
});
document.getElementById('goSettings').addEventListener('click', () => {
  browser.runtime.openOptionsPage();
  window.close();
});

// ── 监听 storage 变化（翻译完成时自动刷新）──
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.lastTranslation) {
    refreshDisplay();
  }
});

// 初始化
refreshDisplay();
