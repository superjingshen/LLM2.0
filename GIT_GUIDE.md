# Git 配置与代码提交指南

## 一、环境配置

### 1. Git全局配置

```bash
# 配置用户名 准备初始化仓库。
git config --global user.name "jingshen0112"

# 配置邮箱
git config --global user.email "2695440341@qq.com"
```

### 2. Gitee认证配置

- 个人令牌：eb3549ca9b7efd0e50fe81b3b0a2d819
- 仓库地址：https://gitee.com/jingshen0112/LLM2.0.git

## 二、仓库初始化与配置

### 1. 初始化本地仓库

```bash
# 初始化Git仓库
git init

# 添加远程仓库
git remote add origin https://gitee.com/jingshen0112/LLM2.0.git
```

### 2. 配置.gitignore

```plaintext
# 环境配置文件
.env

# 敏感信息文档
GIT_GUIDE.md

# 其他不需要提交的文件
node_modules/
.DS_Store
```

## 三、代码提交流程

### 1. 基本提交步骤

```bash
# 添加所有文件到暂存区
git add .

# 提交代码
git commit -m "初始化项目并完成第一次提交"

# 推送到远程仓库
git push -u origin master
```

## 四、遇到的问题和解决方案

### 1. 认证失败问题

**问题描述**：
- 使用HTTPS推送时遇到认证失败
- 无法使用常规密码认证

**解决方案**：
1. 使用私人令牌进行认证
```bash
# 更新远程仓库URL，包含私人令牌
git remote set-url origin https://jingshen0112:eb3549ca9b7efd0e50fe81b3b0a2d819@gitee.com/jingshen0112/LLM2.0.git
```

### 2. 合并冲突问题

**问题描述**：
- 远程仓库已存在内容
- README.md文件发生冲突

**解决方案**：
1. 允许合并不相关的历史
```bash
git pull origin master --allow-unrelated-histories
```

2. 解决README.md冲突
```bash
# 保留本地版本
git checkout --ours README.md

# 添加并提交更改
git add README.md
git commit -m "合并远程仓库并保留本地README.md文件"
```

## 五、安全性考虑

1. **敏感信息保护**
   - 将包含私人令牌的文件添加到.gitignore
   - 避免在公共代码中硬编码认证信息

2. **认证管理**
   - 使用私人令牌而非密码认证
   - 定期更新私人令牌

## 六、注意事项

1. 本文档包含敏感信息，已添加到.gitignore
2. 建议定期更新私人令牌
3. 确保在提交代码前检查.gitignore配置
4. 重要文件修改前先pull最新代码