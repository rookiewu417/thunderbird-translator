/**
 * background.js - 邮件翻译助手后台脚本
 * 负责：
 *  1. 右键菜单注册（翻译选中文字 + 翻译整封邮件）
 *  2. 百度翻译 API 调用（含 MD5 签名）
 *  3. 翻译结果存储（供 popup 读取）
 *  4. 响应 content.js 的划词翻译请求
 *  5. 响应 options.js 的测试连接请求
 */

// ─────────────────────────────────────────
// MD5 工具函数（不依赖外部库）
// ─────────────────────────────────────────
function md5(string) {
  function md5_Cycle(x, k) {
    var a = x[0], b = x[1], c = x[2], d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }

  function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }

  function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }

  function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }

  function add32(a, b) {
    return (a + b) & 0xFFFFFFFF;
  }

  function md5_1(s) {
    var txt = '';
    var n = s.length,
      state = [1732584193, -271733879, -1732584194, 271733878],
      i;
    for (i = 64; i <= s.length; i += 64) {
      md5_Cycle(state, md5_blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++)
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5_Cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5_Cycle(state, tail);
    return state;
  }

  function md5_blk(s) {
    var md5blks = [],
      i;
    for (i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  var hex_chr = '0123456789abcdef'.split('');

  function rhex(n) {
    var s = '',
      j = 0;
    for (; j < 4; j++)
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
    return s;
  }

  function hex(x) {
    for (var i = 0; i < x.length; i++)
      x[i] = rhex(x[i]);
    return x.join('');
  }

  // UTF-8 encoding
  string = unescape(encodeURIComponent(string));
  return hex(md5_1(string));
}

// ─────────────────────────────────────────
// 翻译引擎配置
// ─────────────────────────────────────────
const ENGINES = {
  baidu: {
    name: '百度翻译',
    translate: async (text, fromLang, toLang, config) => {
      const { appid, key } = config;
      if (!appid || !key) throw new Error('请先在选项页配置百度翻译的 AppID 和密钥');
      const salt = Date.now().toString();
      const sign = md5(appid + text + salt + key);
      const params = new URLSearchParams({
        q: text, from: fromLang, to: toLang, appid, salt, sign
      });
      const url = `https://fanyi-api.baidu.com/api/trans/vip/translate?${params}`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP 错误：${resp.status}`);
      const data = await resp.json();
      if (data.error_code) {
        throw new Error(`百度翻译错误[${data.error_code}]：${data.error_msg}`);
      }
      return {
        translated: data.trans_result.map(r => r.dst).join('\n'),
        lines: data.trans_result.map(r => r.dst),
        detectedFrom: data.from
      };
    }
  }
  // 未来可在此添加其他引擎，例如 deepl, google 等
};

// ─────────────────────────────────────────
// 注册右键菜单
// ─────────────────────────────────────────
function registerContextMenu() {
  messenger.menus.removeAll().then(() => {

    // ────── 2. 翻译整封邮件 ──────
    messenger.menus.create({
      id: 'translate-full-message',
      title: '翻译整封邮件',
      contexts: ['message_list', 'page', 'frame'],
      icons: { '16': 'icons/icon-48.svg' }
    });
  });
}

// ─────────────────────────────────────────
// 执行翻译（核心函数）
// ─────────────────────────────────────────
async function doTranslate(text, toLang) {
  const config = await browser.storage.local.get(['engine', 'appid', 'key', 'toLang']);
  const engineId = config.engine || 'baidu';
  const engine = ENGINES[engineId];
  if (!engine) throw new Error(`未知翻译引擎：${engineId}`);

  const targetLang = toLang || 'zh';
  const { translated, lines, detectedFrom } = await engine.translate(
    text, 'auto', targetLang, { appid: config.appid, key: config.key }
  );

  return {
    original: text,
    translated,
    lines,
    from: detectedFrom || 'auto',
    to: targetLang,
    engine: engine.name,
    time: Date.now(),
    status: 'success'
  };
}

// ─────────────────────────────────────────
// Manage Content Script Ports
// ─────────────────────────────────────────
const translatorPorts = new Set();
browser.runtime.onConnect.addListener(port => {
  if (port.name === 'translator_content') {
    translatorPorts.add(port);
    port.onDisconnect.addListener(() => {
      translatorPorts.delete(port);
    });

    // 处理来自 content.js 的翻译请求（通过 port 双向通信）
    // 注意：不使用 async 回调，改用 .then/.catch 以兼容 Thunderbird 的 port 实现
    port.onMessage.addListener((message) => {
      if (message.type === 'translate_request' && message.reqId != null) {
        doTranslate(message.text, 'zh')
          .then(result => {
            port.postMessage({ type: 'translate_result', reqId: message.reqId, result });
          })
          .catch(err => {
            port.postMessage({
              type: 'translate_result',
              reqId: message.reqId,
              result: {
                status: 'error',
                errorMsg: err.message,
                original: message.text,
                time: Date.now()
              }
            });
          });
      }
    });
  }
});

// ─────────────────────────────────────────
// 分段翻译（处理超长文本）
// ─────────────────────────────────────────
const MAX_CHUNK_SIZE = 5000;

function splitTextIntoChunks(text, maxSize) {
  const chunks = [];
  const lines = text.split('\n');
  let currentChunk = '';
  for (const line of lines) {
    if ((currentChunk + '\n' + line).length > maxSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = line;
    } else {
      currentChunk += (currentChunk ? '\n' : '') + line;
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks;
}

async function doTranslateLongText(text, toLang) {
  if (text.length <= MAX_CHUNK_SIZE) return doTranslate(text, toLang);

  const chunks = splitTextIntoChunks(text, MAX_CHUNK_SIZE);
  const translatedParts = [];
  let detectedFrom = 'auto';

  for (let i = 0; i < chunks.length; i++) {
    await browser.storage.local.set({
      lastTranslation: {
        original: text.substring(0, 200) + '…',
        translated: '',
        status: 'loading',
        progress: `正在翻译第 ${i + 1}/${chunks.length} 段…`,
        time: Date.now()
      }
    });

    const result = await doTranslate(chunks[i], toLang);
    translatedParts.push(result.translated);
    if (result.from !== 'auto') detectedFrom = result.from;

    if (i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1100));
    }
  }

  return {
    original: text,
    translated: translatedParts.join('\n'),
    from: detectedFrom,
    to: toLang || 'zh',
    engine: ENGINES[(await browser.storage.local.get('engine')).engine || 'baidu'].name,
    time: Date.now(),
    status: 'success'
  };
}

// ─────────────────────────────────────────
// 从邮件的 MIME 结构提取纯文本
// ─────────────────────────────────────────
function extractTextFromPart(part) {
  if (part.contentType === 'text/plain' && part.body) return part.body;

  if (part.contentType === 'text/html' && part.body) {
    return part.body
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  if (part.parts && part.parts.length > 0) {
    for (const subpart of part.parts) {
      const text = extractTextFromPart(subpart);
      if (text) return text;
    }
  }
  return '';
}

// ─────────────────────────────────────────
// 翻译整封邮件
// ─────────────────────────────────────────
async function translateFullMessage(messageId, toLang) {
  try {
    await browser.storage.local.set({
      lastTranslation: {
        original: '正在读取邮件内容…',
        translated: '',
        status: 'loading',
        time: Date.now()
      }
    });

    const fullMsg = await messenger.messages.getFull(messageId);
    const bodyText = extractTextFromPart(fullMsg);

    if (!bodyText || !bodyText.trim()) {
      throw new Error('无法提取邮件正文内容');
    }

    const result = await doTranslateLongText(bodyText.trim(), toLang);
    await browser.storage.local.set({ lastTranslation: result });
    console.log('[翻译助手] 整封邮件翻译成功');
    return result;
  } catch (err) {
    console.error('[翻译助手] 整封邮件翻译失败：', err);
    const errorResult = {
      original: '邮件正文',
      translated: '',
      status: 'error',
      errorMsg: err.message,
      time: Date.now()
    };
    await browser.storage.local.set({ lastTranslation: errorResult });
    return errorResult;
  }
}

messenger.menus.onClicked.addListener(async (info, tab) => {
  const broadcastToActivePorts = (msg) => {
    translatorPorts.forEach(port => {
      try {
        port.postMessage(msg);
      } catch(e) {
        console.error(e);
      }
    });
  };


  if (info.menuItemId === 'translate-full-message') {
    let messageId = null;
    
    // 1. 尝试从选中的消息列表中获取 (邮件列表视图)
    if (info.selectedMessages && info.selectedMessages.messages && info.selectedMessages.messages.length > 0) {
      messageId = info.selectedMessages.messages[0].id;
    } 
    // 2. 尝试从当前显示的邮件获取 (邮件阅读窗口)
    else if (info.displayedMessageId) {
      messageId = info.displayedMessageId;
    }

    if (messageId) {
      await browser.storage.local.set({
        lastTranslation: {
          original: '正在读取邮件内容…',
          translated: '',
          status: 'loading',
          time: Date.now()
        }
      });
      browser.tabs.create({ url: 'full_translation.html' });
      translateFullMessage(messageId, 'zh');
    } else {
      console.warn('[翻译助手] 未能获取邮件 ID');
      await browser.storage.local.set({
        lastTranslation: {
          original: '',
          translated: '',
          status: 'error',
          errorMsg: '无法识别当前邮件，请在邮件列表或邮件窗口中右键重试',
          time: Date.now()
        }
      });
      browser.tabs.create({ url: 'full_translation.html' });
    }
    return;
  }
});

// ─────────────────────────────────────────
// 监听来自 content.js / options.js 的消息
// ─────────────────────────────────────────
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // ────── 处理划词气泡翻译请求 (异步需要 return true) ──────
  if (message.type === 'translate_bubble') {
    doTranslate(message.text, message.toLang || 'zh')
      .then(result => sendResponse(result))
      .catch(err => {
        sendResponse({
          status: 'error',
          errorMsg: err.message,
          original: message.text,
          time: Date.now()
        });
      });
    return true; // Keep channel open
  }

  // ────── 响应 content.js 的批量翻译请求（已废弃但可保留兼容性） ──────
  if (message.type === 'translate_batch') {
    doTranslate(message.text, 'zh').then(result => {
      sendResponse({ success: true, lines: result.lines });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true; 
  }

  // ────── 测试连接请求（来自 options.js）──────
  if (message.type === 'testConnection') {
    doTranslate(message.text || 'hello', message.toLang || 'zh').then(result => {
      sendResponse({ success: true, translated: result.translated });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
});

// ─────────────────────────────────────────
// 初始化
// ─────────────────────────────────────────
registerContextMenu();
console.log('[翻译助手] 后台脚本已加载');
