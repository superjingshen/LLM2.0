# 字节聊天应用部署指南

## Vercel部署步骤

### 准备工作

1. 确保你有一个[Vercel账户](https://vercel.com/signup)，可以使用GitHub、GitLab、Bitbucket或邮箱注册
2. 确保项目已经推送到GitHub、GitLab或Bitbucket等代码托管平台

### 部署步骤

#### 方法一：通过Vercel网页界面部署

1. 登录[Vercel平台](https://vercel.com/dashboard)
2. 点击"New Project"按钮
3. 导入你的Git仓库（从GitHub、GitLab或Bitbucket）
4. 配置项目：
   - 构建命令：`npm run build`
   - 输出目录：`build`
   - 安装命令：`npm install`
5. 环境变量设置：
   - 添加以下环境变量：
     ```
     VITE_COZE_DEFAULT_TOKEN=pat_Y0y7T02wubyquotV8CsyLiCjLxSTv8WhL1gHuRrHf5kVAESXytYQaGyWYAozHQE4
     VITE_COZE_DEFAULT_URL=https://www.coze.cn/
     VITE_COZE_DEFAULT_BOT_ID=7476032503284351014
     ```
6. 点击"Deploy"按钮开始部署

#### 方法二：使用Vercel CLI部署

1. 全局安装Vercel CLI（需要管理员权限）：
   ```bash
   npm install -g vercel
   ```

2. 在项目根目录下登录Vercel：
   ```bash
   vercel login
   ```

3. 部署项目：
   ```bash
   vercel
   ```

4. 按照提示配置项目：
   - 设置构建命令：`npm run build`
   - 设置输出目录：`build`
   - 添加环境变量

### 注意事项

1. 确保`vercel.json`文件已正确配置，该文件已包含在项目中：
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "build/server/index.js"
       }
     ],
     "env": {
       "VITE_COZE_DEFAULT_TOKEN": "${VITE_COZE_DEFAULT_TOKEN}",
       "VITE_COZE_DEFAULT_URL": "${VITE_COZE_DEFAULT_URL}",
       "VITE_COZE_DEFAULT_BOT_ID": "${VITE_COZE_DEFAULT_BOT_ID}"
     }
   }
   ```

2. 部署完成后，Vercel会提供一个默认域名（例如：your-project.vercel.app）

3. 如果需要自定义域名，可以在Vercel项目设置中添加

4. 确保API跨域问题已解决，项目中已实现自动切换代理URL的功能

## 其他部署选项

### Netlify部署

1. 登录[Netlify](https://app.netlify.com/)
2. 点击"New site from Git"
3. 选择你的Git提供商并授权
4. 选择仓库
5. 配置构建设置：
   - 构建命令：`npm run build`
   - 发布目录：`build`
6. 添加环境变量
7. 点击"Deploy site"

### 自托管部署

1. 在服务器上克隆仓库
2. 安装依赖：`npm install`
3. 构建项目：`npm run build`
4. 使用PM2或其他进程管理工具启动服务：
   ```bash
   npm install -g pm2
   pm2 start npm --name "chat-app" -- start
   ```

## 故障排除

1. 如果部署后遇到API请求问题，检查环境变量是否正确设置
2. 确保Node.js版本兼容（项目要求Node.js >= 20.0.0）
3. 如果遇到构建错误，检查依赖是否完整安装