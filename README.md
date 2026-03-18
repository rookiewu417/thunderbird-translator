# 邮件翻译助手 (Mail Translator)

一款简约的 Thunderbird 邮件翻译插件，支持一键翻译邮件内容为中文。

## 功能特点

- 🚀 **一键翻译**：选中邮件文字，右键点击即可翻译
- 🌐 **多语言支持**：自动检测源语言，翻译为中文
- ⚙️ **灵活配置**：支持自定义翻译 API 设置

## 安装方法

### 方式一：手动安装（推荐）

1. 下载本插件源码或压缩包
2. 打开 Thunderbird，点击右上角菜单 → **附加组件和主题**
3. 点击右上角齿轮图标 → **从文件安装附加组件**
4. 选择插件目录或 `.xpi` 文件
5. 启用插件

### 方式二：开发者模式安装

1. 打开 Thunderbird，按 `Alt` 键显示菜单栏
2. 点击 **工具** → **开发者工具**
3. 点击 **临时调试** 按钮
4. 选择插件目录中的 `manifest.json` 文件

## 使用说明

1. **配置 API**（首次使用）：
   - 点击插件图标打开设置页面
   - 填写百度翻译 API 的 APP ID 和密钥
   - 保存设置

2. **翻译邮件**：
   - 在 Thunderbird 中右键需要翻译的邮件
   - 点击一键翻译

3. **复制译文**：
   - 翻译完成后点击「复制译文」按钮
   - 即可粘贴到其他地方

## 技术栈

- Thunderbird WebExtension API
- 原生 JavaScript (ES6+)
- CSS3
- 百度翻译 API

## 项目结构

```
thunderbird-translator/
├── manifest.json          # 插件配置文件
├── background.js          # 后台脚本，处理 API 请求
├── content.js            # 内容脚本，处理页面交互
├── popup.html/js/css     # 弹出窗口界面
├── options.html/js/css   # 设置页面
├── full_translation.*    # 全文翻译功能
└── icons/                # 插件图标
```

## API 配置

本插件使用百度翻译 API，需要自行申请：

1. 访问 [百度翻译开放平台](https://fanyi-api.baidu.com/)
2. 注册账号并创建应用
3. 获取 APP ID 和密钥
4. 在插件设置中填写即可

## 开发

```bash
# 克隆项目
git clone https://github.com/rookiewu417/thunderbird-translator.git

# 进入目录
cd thunderbird-translator

# 在 Thunderbird 中加载插件（见安装方法）
```


## 作者

- IvenWu
