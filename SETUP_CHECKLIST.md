# ✅ Transcend 应用设置检查清单

## 📋 实时订阅设置步骤

### 🔴 必须完成

- [ ] **1. 进入复制设置**
  - 访问 [Supabase 项目](https://supabase.com/dashboard)
  - 点击 **Database** → **Replication**

- [ ] **2. 启用表的实时功能**
  - 找到 **Supabase Realtime** 部分
  - 点击 **Manage realtime** 或 **Tables**
  - 启用这些表：
    - [ ] `public.posts`
    - [ ] `public.comments`
    - [ ] `public.likes`
    - [ ] `public.friendships`

- [ ] **3. 验证连接**
  - 打开应用：[http://localhost:5173](http://localhost:5173)
  - 按 F12 打开浏览器开发者工具
  - 查看 **Console** 标签页
  - 检查是否有 `✅ Supabase 连接成功！`

### 🟢 可选但推荐

- [ ] **启用其他表**（可选）
  - [ ] `public.users`
  - [ ] `public.agents`

- [ ] **配置事件类型**（可选）
  - [ ] `INSERT` - 新记录
  - [ ] `UPDATE` - 更新记录
  - [ ] `DELETE` - 删除记录
  - 建议全选

## 🔍 验证测试

### 测试 1: 基础连接
- [ ] 打开浏览器控制台（F12）
- [ ] 刷新页面
- [ ] 看到日志：`🔍 正在测试 Supabase 连接...`
- [ ] 看到日志：`✅ Supabase 连接成功！`

### 测试 2: 实时功能
- [ ] 打开两个浏览器窗口
- [ ] 都访问 [http://localhost:5173](http://localhost:5173)
- [ ] 在窗口 A 发布新帖子
- [ ] 观察窗口 B 是否自动显示新帖子
- [ ] 控制台应有：`📡 实时更新收到: ...`

### 测试 3: 用户认证
- [ ] 点击 "创建账号" 注册新用户
- [ ] 验证能正常登录
- [ ] 验证能发布帖子

## 🛠️ 如果遇到问题

### 问题 1: 提示 "表不存在"
**解决**：确认已在 SQL Editor 执行了完整的 [DATABASE_DESIGN.md](file:///workspace/DATABASE_DESIGN.md) 中的 SQL

### 问题 2: RLS 策略阻止操作
**解决**：检查是否已登录，以及表的 RLS 策略配置

### 问题 3: 实时更新不工作
**解决**：
1. 确认已在 Replication 设置中启用了表
2. 检查浏览器控制台的 WebSocket 连接状态
3. 刷新页面重试

## 📝 当前配置

| 配置项 | 状态 |
|--------|------|
| 环境变量 | ✅ 已配置 |
| 数据库表 | ⏳ 需要确认 |
| RLS 策略 | ⏳ 需要确认 |
| 实时订阅 | ⏳ 需要设置 |

## 🚀 完成后

一旦所有项目都勾选了，你的应用就具备了：
- ✅ 完整的用户认证
- ✅ 实时数据同步
- ✅ 好友系统
- ✅ 帖子发布和管理
- ✅ 点赞收藏功能

享受你的社交应用吧！🎉
