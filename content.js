/**
 * content.js - 划词翻译（气泡小窗口）
 * 通过 messageDisplayScripts 注入到邮件阅读页面
 * 使用 runtime.connect 长连接与后台双向通信
 */
(function () {
  'use strict';

  if (window.__translatorInjected) return;
  window.__translatorInjected = true;

  let currentBubble = null;
  let pendingResolve = null;
  let requestId = 0;
  const pendingRequests = {};

  // ── 建立长连接 ──
  const port = browser.runtime.connect({ name: 'translator_content' });

  // 接收后台消息
  port.onMessage.addListener((message) => {
    // 右键菜单触发的划词翻译
    if (message.type === 'translate_selection_bubble') {
      triggerSelectionBubble();
      return;
    }
    // 翻译结果回调
    if (message.type === 'translate_result' && message.reqId != null) {
      const resolve = pendingRequests[message.reqId];
      if (resolve) {
        delete pendingRequests[message.reqId];
        resolve(message.result);
      }
    }
  });

  // 通过 port 发送翻译请求并等待回调
  function requestTranslation(text) {
    return new Promise((resolve) => {
      const reqId = ++requestId;
      pendingRequests[reqId] = resolve;
      port.postMessage({ type: 'translate_request', text, reqId });
      // 超时兜底
      setTimeout(() => {
        if (pendingRequests[reqId]) {
          delete pendingRequests[reqId];
          resolve({ status: 'error', errorMsg: '翻译超时，请重试' });
        }
      }, 30000);
    });
  }

  // ── 创建翻译气泡 ──
  function createBubble(x, y) {
    removeBubble();
    const bubble = document.createElement('div');
    bubble.className = 'translator-bubble';
    bubble.innerHTML = `
      <div class="translator-bubble-header">
        <span class="translator-bubble-title">翻译助手</span>
        <button class="translator-bubble-close" title="关闭">✕</button>
      </div>
      <div class="translator-bubble-body">
        <div class="translator-bubble-loading">
          <div class="translator-bubble-spinner"></div>
          <span>翻译中…</span>
        </div>
      </div>
    `;
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y + 10}px`;

    bubble.querySelector('.translator-bubble-close').addEventListener('click', (e) => {
      e.stopPropagation();
      removeBubble();
    });

    document.body.appendChild(bubble);
    currentBubble = bubble;

    requestAnimationFrame(() => {
      const rect = bubble.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (rect.right > vw) bubble.style.left = `${vw - rect.width - 10}px`;
      if (rect.left < 0) bubble.style.left = '10px';
      if (rect.bottom > vh) bubble.style.top = `${y - rect.height - 10}px`;
    });
    return bubble;
  }

  function updateBubbleResult(bubble, original, translated, engine) {
    if (!bubble || !document.body.contains(bubble)) return;
    const body = bubble.querySelector('.translator-bubble-body');
    body.innerHTML = `
      <div class="translator-bubble-section">
        <div class="translator-bubble-label">原文 <span class="translator-bubble-engine">${engine || '翻译'}</span></div>
        <div class="translator-bubble-text original">${escapeHtml(original)}</div>
      </div>
      <div class="translator-bubble-divider"><span class="translator-bubble-arrow">→ 中文</span></div>
      <div class="translator-bubble-section">
        <div class="translator-bubble-label">译文</div>
        <div class="translator-bubble-text translated">${escapeHtml(translated)}</div>
      </div>
      <div class="translator-bubble-actions">
        <button class="translator-bubble-copy">📋 复制译文</button>
      </div>
    `;
    body.querySelector('.translator-bubble-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(translated).then(() => {
        const btn = body.querySelector('.translator-bubble-copy');
        btn.textContent = '✅ 已复制';
        setTimeout(() => { btn.textContent = '📋 复制译文'; }, 1500);
      });
    });
  }

  function updateBubbleError(bubble, errMsg) {
    if (!bubble || !document.body.contains(bubble)) return;
    const body = bubble.querySelector('.translator-bubble-body');
    body.innerHTML = `<div class="translator-bubble-error"><span class="translator-bubble-error-icon">⚠️</span><p>${escapeHtml(errMsg || '翻译失败')}</p></div>`;
  }

  function removeBubble() {
    if (currentBubble && document.body.contains(currentBubble)) {
      currentBubble.classList.add('translator-bubble-fadeout');
      setTimeout(() => {
        if (currentBubble && document.body.contains(currentBubble)) currentBubble.remove();
        currentBubble = null;
      }, 200);
    }
    currentBubble = null;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ── 触发选中文字气泡 ──
  async function triggerSelectionBubble() {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : '';
    if (!text || text.length < 1) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const x = rect.left + window.scrollX;
    const y = rect.bottom + window.scrollY;

    const bubble = createBubble(x, y);

    const result = await requestTranslation(text);
    if (result && result.status === 'success') {
      updateBubbleResult(bubble, result.original, result.translated, result.engine);
    } else {
      updateBubbleError(bubble, (result && result.errorMsg) || '翻译失败');
    }
  }

  // ── 鼠标检测 ──
  document.addEventListener('mouseup', (e) => {
    // 1. 如果点击的是气泡内部，不做任何销毁动作
    if (currentBubble && currentBubble.contains(e.target)) return;

    // 延迟 100ms 确保浏览器选区 API 已就绪
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : '';
      
      console.log('[翻译助手] MouseUp 文本:', text);

      if (!text || text.length < 1) {
        // 如果点击非气泡区域且没有选中文字，清除旧气泡
        if (currentBubble && !currentBubble.contains(e.target)) {
          removeBubble();
        }
        return;
      }

      // 如果有文字，触发翻译
      triggerSelectionBubble();
    }, 100);
  });

  // 快捷键支持
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') removeBubble();
  });

})();
