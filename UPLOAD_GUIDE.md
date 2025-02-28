# 项目上传指南

## 一、项目配置信息

### 1. 环境配置

项目使用了以下主要配置：

```env
# Coze API配置
COZE_DEFAULT_TOKEN="pat_Y0y7T02wubyquotV8CsyLiCjLxSTv8WhL1gHuRrHf5kVAESXytYQaGyWYAozHQE4"
COZE_DEFAULT_URL="https://www.coze.cn/"
COZE_DEFAULT_BOT_ID="7476032503284351014"
```

### 2. API认证方式

项目支持两种认证方式：

1. **个人认证**
   - Personal Access Token: eb3549ca9b7efd0e50fe81b3b0a2d819
   - Bot ID: 74760325032843510140
   - 配置位置：.env文件

2. **OAuth PKCE认证**
   - 需要在Coze平台创建OAuth应用
   - 设置回调地址：http://175.178.3.60:3000/
   - 支持Token自动刷新机制

## 二、API接口配置

### 1. 基础配置

```typescript
// app/apis/data.ts
export const cn_proxy_url = "https://api.coze.cn";
export const ncn_proxy_url = "https://api.coze.com";

// 生产环境回调地址
const redirect_uri = "http://175.178.3.60:3000/";
```

### 2. 文件上传实现

```typescript
export const asyncFileUpload = async (file: File) => {
  try {
    const form_data = new FormData();
    form_data.append("file", file);
    const res = await fetch(`${getCustomProxyUrl()}/v1/files/upload`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + getToken(),
      },
      body: form_data,
    });
    const jsonData = await res.json();
    
    // Token过期处理
    if (jsonData.code == 700012006 && getStorageSetting()?.auth_type === "two") {
      const tokenRes = await asyncRefreshToken();
      const tokenData = await tokenRes.json();
      updateTwoToken(tokenData.access_token, tokenData.refresh_token);
      await asyncFileUpload(file);
    }
    return jsonData;
  } catch (err) {
    console.error(err);
  }
};
```

## 三、遇到的问题和解决方案

### 1. Token认证问题

**问题描述**：
- 使用个人访问令牌时可能会遇到token过期
- OAuth认证方式需要处理token刷新

**解决方案**：
1. 实现了token自动刷新机制
2. 使用localStorage存储认证信息
3. 添加了token失效的错误处理

### 2. 跨域请求问题

**问题描述**：
- API请求可能遇到跨域限制
- 不同域名(coze.cn/coze.com)需要不同的处理

**解决方案**：
1. 实现了自定义请求前缀
2. 根据不同域名自动切换代理URL

```typescript
export function getCustomProxyUrl() {
  return getStorageSetting()?.custom_url === "https://www.coze.cn/"
    ? cn_proxy_url
    : ncn_proxy_url;
}
```

### 3. 文件上传失败处理

**问题描述**：
- 文件上传可能因token失效而失败
- 需要处理上传超时情况

**解决方案**：
1. 添加了完整的错误处理机制
2. 实现了上传失败后的重试逻辑
3. 使用FormData正确处理文件上传

## 四、安全性考虑

1. **敏感信息保护**
   - 配置信息存储在.env文件中
   - 已将.env添加到.gitignore
   - 认证信息仅保存在本地localStorage

2. **Token管理**
   - 实现了token自动刷新
   - 避免了token硬编码
   - 支持多种认证方式切换

## 五、后续优化建议

1. 添加请求重试机制
2. 实现完整的错误日志记录
3. 优化文件上传进度显示
4. 添加文件类型和大小限制
5. 实现断点续传功能

## 六、注意事项

1. 本文档包含敏感信息，已添加到.gitignore
2. 生产环境部署时需要更新配置信息
3. 建议定期更新token和认证信息
4. 请勿在公共场合泄露认证信息