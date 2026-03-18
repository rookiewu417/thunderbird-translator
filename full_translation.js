document.addEventListener('DOMContentLoaded', async () => {
  const els = {
    loading: document.getElementById('loading'),
    loadingText: document.getElementById('loadingText'),
    error: document.getElementById('error'),
    errorText: document.getElementById('errorText'),
    content: document.getElementById('content'),
    translatedOutput: document.getElementById('translatedOutput'),
    originalOutput: document.getElementById('originalOutput'),
    copyBtn: document.getElementById('copyBtn')
  };

  function updateStatus(state, msg) {
    els.loading.classList.add('hidden');
    els.error.classList.add('hidden');
    els.content.classList.add('hidden');
    els.copyBtn.style.display = 'none';

    if (state === 'loading') {
      els.loading.classList.remove('hidden');
      if (msg) els.loadingText.textContent = msg;
      // Also update background status text
    } else if (state === 'error') {
      els.error.classList.remove('hidden');
      if (msg) els.errorText.textContent = msg;
    } else if (state === 'success') {
      els.content.classList.remove('hidden');
      els.copyBtn.style.display = 'inline-block';
    }
  }

  // 渲染翻译结果
  function renderTranslation(data) {
    if (data.status === 'loading') {
      updateStatus('loading', data.progress || '正在获取并翻译邮件内容，请稍候...');
    } else if (data.status === 'error') {
      updateStatus('error', data.errorMsg);
    } else if (data.status === 'success') {
      // 这里的 data.translated 包含全文
      els.translatedOutput.textContent = data.translated;
      els.originalOutput.textContent = data.original;
      updateStatus('success');
    }
  }

  // 初次加载尝试获取 storage
  try {
    const store = await browser.storage.local.get('lastTranslation');
    if (store && store.lastTranslation) {
      renderTranslation(store.lastTranslation);
    }
  } catch (e) {
    updateStatus('error', '无法读取翻译数据: ' + e.message);
  }

  // 监听后台的 storage 变化，以便实时更新加载进度或最终结果
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.lastTranslation) {
      renderTranslation(changes.lastTranslation.newValue);
    }
  });

  // 复制功能
  els.copyBtn.addEventListener('click', () => {
    const textToCopy = els.translatedOutput.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalText = els.copyBtn.textContent;
      els.copyBtn.textContent = '✅ 已复制';
      els.copyBtn.classList.add('copied');
      setTimeout(() => {
        els.copyBtn.textContent = originalText;
        els.copyBtn.classList.remove('copied');
      }, 2000);
    });
  });
});
