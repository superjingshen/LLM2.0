# 聊天应用项目

## 一、项目概述
本项目是一个基于React的前端聊天应用，旨在为用户提供高效便捷的交互体验。项目使用了现代化的技术栈，包括Remix框架、TailwindCSS等，并集成了Coze API来提供稳定可靠的聊天服务。

## 二、主要功能
1. **文件上传**：支持多种类型文件的上传功能，满足不同的业务需求。

2. **图片上传**：提供便捷的图片上传功能，方便用户分享和展示图片内容。

3. **多种返回格式**：
   - 支持Markdown格式输出，便于文档编辑和展示
   - 支持图片生成，提供更丰富的视觉体验
   - 提供问题建议功能，帮助用户更好地与系统交互

4. **流式输出**：实现了流式数据传输，提高数据传输效率，使用户能更快获得结果。

5. **请求前缀切换**：支持在`coze.com`和`coze.cn`之间切换请求前缀，满足不同用户的访问需求。

6. **Coze API集成**：项目已完整集成Coze API，提供稳定可靠的服务支持。

7. **认证方式**：
   - 支持个人认证
   - 支持OAuth PKCE认证
   确保用户数据的安全性

## 三、技术特点
1. **现代化技术栈**：
   - 使用React作为核心框架
   - 采用Remix构建工具
   - 使用TailwindCSS进行样式管理
   - 集成多个实用的React组件库

2. **优秀的用户体验**：
   - 响应式设计
   - 流畅的交互体验
   - 支持暗色/亮色主题切换

## 四、快速开始

1. 安装依赖：
```bash
pnpm install
```

2. 开发环境运行：
```bash
pnpm run dev
```

3. 生产环境构建：
```bash
pnpm run build
```

4. 启动服务：
```bash
pnpm start
```

## 三、配置说明

### 认证方式
1. **个人认证**
   - 需要提供 Personal Access Token 和 Bot ID
   - Personal Access Token 可在 Coze 开发者页面获取
   - Bot ID 可在机器人开发页面URL中获取，格式如：https://www.coze.cn/space/xxxx/bot/[bot_id]

2. **OAuth PKCE认证**
   - 需要提供 Client ID 和 Bot ID
   - 需要在 Coze 平台创建 OAuth 应用并设置回调地址
   - 支持自动刷新 Token

### API调用
1. **接口地址**
   - 默认使用 https://www.coze.cn/
   - 支持切换到 https://www.coze.com/

2. **调用格式**
   ```
   POST https://api.coze.cn/v3/chat
   ```

### 安全说明
- 所有认证信息仅保存在本地，不会上传至服务器
- 建议妥善保管 Token 等敏感信息
- 建议定期更新 Token
