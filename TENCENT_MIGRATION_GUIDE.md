# 腾讯云迁移指南

## 概述

本文档介绍如何将 Transcend AI 应用从 Supabase 迁移到腾讯云基础设施。

## 技术栈对比

| 组件 | Supabase | 腾讯云 |
|------|----------|--------|
| 数据库 | PostgreSQL + Supabase | 腾讯云 PostgreSQL (TDSQL-C) |
| 认证 | Supabase Auth | 自建 JWT + bcrypt |
| 文件存储 | Supabase Storage | 腾讯云 COS |
| 实时功能 | Supabase Realtime | 自建 WebSocket |

## 部署步骤

### 1. 创建腾讯云数据库

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 搜索 **TDSQL-C for PostgreSQL**
3. 创建新的 PostgreSQL 实例：
   - 地域：选择靠近你的用户的地域
   - 数据库版本：PostgreSQL 13+
   - 实例规格：根据业务需求选择
   - 存储空间：建议 50GB+

4. 创建完成后，在实例详情页面获取：
   - 内外网地址（Host）
   - 端口（默认为 5432）
   - 用户名和密码

### 2. 配置数据库白名单

1. 在腾讯云控制台进入数据库实例的 **安全组** 或 **白名单设置**
2. 添加你的服务器 IP 地址和本地开发环境 IP
3. 确保防火墙允许 5432 端口访问

### 3. 初始化数据库

1. 连接到你的腾讯云 PostgreSQL 数据库
2. 运行 `TENCENT_SETUP.sql` 脚本：
   ```bash
   psql -h your-tencent-db-host.gz.tencentcdb.com -U your_db_user -d transcend -f TENCENT_SETUP.sql
   ```

### 4. 配置环境变量

1. 复制 `.env.example` 为 `.env`
2. 填写你的腾讯云数据库配置：
   ```env
   # 腾讯云 PostgreSQL 配置
   VITE_TENCENT_DB_HOST=your-tencent-db-host.gz.tencentcdb.com
   VITE_TENCENT_DB_PORT=5432
   VITE_TENCENT_DB_NAME=transcend
   VITE_TENCENT_DB_USER=your_db_user
   VITE_TENCENT_DB_PASSWORD=your_db_password
   
   # 服务器端数据库配置
   TENCENT_DB_HOST=your-tencent-db-host.gz.tencentcdb.com
   TENCENT_DB_PORT=5432
   TENCENT_DB_NAME=transcend
   TENCENT_DB_USER=your_db_user
   TENCENT_DB_PASSWORD=your_db_password
   
   # JWT 密钥（生产环境请务必修改）
   JWT_SECRET=your-secure-jwt-secret-key-here
   ```

### 5. 安装依赖

```bash
npm install
```

### 6. 启动服务

```bash
# 启动前端
npm run dev

# 启动 API 服务器
npm run dev:server
```

## API 变更说明

### 认证接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/auth/register` | POST | 用户注册 |
| `/auth/login` | POST | 用户登录 |
| `/auth/validate` | GET | 验证 Agent Token |

## 数据迁移

如果你之前有 Supabase 数据，可以按以下步骤迁移：

1. 从 Supabase 导出数据为 SQL 或 CSV
2. 根据新的表结构调整数据格式
3. 导入到腾讯云 PostgreSQL

## 下一步

- 配置腾讯云 CDN 加速
- 设置自动备份策略
- 配置监控告警
- 优化数据库查询性能

## 技术支持

如有问题，请查看：
- [腾讯云 PostgreSQL 文档](https://cloud.tencent.com/document/product/409)
- [Express.js 官方文档](https://expressjs.com/)
