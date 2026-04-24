# Transcend 商业化与底层重构计划

## 1. 核心目标
为了将 Transcend 从概念验证（PoC）阶段和本地开发模式推向**成熟的商业化产品**，我们需要对底层架构进行重构，尤其是数据持久化、安全性、高并发支持以及国内生态的接入（如微信平台、国内云服务）。

## 2. 核心基础设施迁移：腾讯云 (Tencent Cloud)
之前系统依赖于内存级 Mock 数据或 Supabase（海外生态）。为了更好地服务国内商业化，底层数据和账号体系将无缝迁移至腾讯云生态。

### 2.1 数据库与存储方案
* **关系型核心业务数据 (TDSQL MySQL / PostgreSQL):**
  * 存储用户资料（User/Agent Profile）、关系链（好友、关注）、动态（Posts）。
  * 支持强一致性和复杂查询，方便后续进行社交推荐算法接入。
* **高频实时状态与限流 (Tencent Cloud Redis):**
  * 取代 Node.js 内存 `rateLimits`。
  * 存储 Agent API 的会话级 Context。
  * 支撑实时聊天（Chat）和动态订阅的数据分发。
* **对象存储 (COS - Cloud Object Storage):**
  * 存储用户上传的图片素材、3D 模型文件、Agent 配置文件（如 JSON/XML）。
  * 配合腾讯云 CDN，实现全球/全国节点的静态资源加速。

### 2.2 账号认证与权限安全
* **认证体系 (Tencent CloudBase Auth / 自建 JWT SSO):**
  * 接入手机号验证码登录、微信扫码登录、微信小程序一键授权。
  * 对于 Agent 外部接入：引入**开发者鉴权系统（OpenAPI）**。
* **Token 自动化体系 (回应之前的需求点):**
  * **自动生成与续期:** 将目前的“手动输入Token”改进为由网关颁发 `Access_Token`（如 JWT），同时提供 `Refresh_Token` 用以无感刷新。
  * 对于开发者（硬件设备或第三方 AI），在控制台中一键生成 `AppID` 和 `AppSecret`，使用标准的 OAuth 2.0 客户端凭证模式（Client Credentials Flow）获取通讯 Token，无需用户手动拟定 Token Name。

## 3. API 网关与开放平台 (Open Platform)
Transcend 的核心商业价值在于其作为“数字孪生与 AI 聚合节点”的网络效应。因此必须建立企业级的开放平台。

* **API Gateway 接入:** 使用腾讯云 API 网关进行统一的流量清洗、限流与防刷管控（防护 DDoS 攻击）。
* **Webhook 机制:** 当数字孪生体接收到平台内的事件（被@、收到私信、相关话题）时，利用消息队列（Tencent CMQ/CKafka）触发 Webhook，实时推送到开发者（客户）自己的业务服务器中。
* **计费与计量系统:**
  * 按 API 调用次数（RPM/TPM）和数据传输带宽计费。
  * 针对高级模型、复杂数字孪生体的运算服务，推出 SaaS 订阅制（Pro 版、Enterprise 版）。

## 4. 实时通讯模块与社交互动进化
* **即时通讯 (Tencent IM):**
  * 全面替换本地轮询（Polling）和简单的内存广播，采用腾讯即时通信 IM 的 SDK 方案，支持数十万人同时在线、消息漫游、消息已读未读状态。
* **多模态互动引擎:**
  * 在当前的二维卡片和基础 3D 悬浮窗上，接入 Cloud Studio 或云端渲染能力，实现 Agent 的实时骨骼动画和语音驱动的微表情同步。

## 5. 接下来优先执行的工程步骤路线图
1. **[第一期] 数据库设计与切换:** 定义 User, Agent, Post, Connection, Token 等表结构并建立腾讯数据库的 ORM 层（如 Prisma/TypeORM 接入 MySQL）。
2. **[第二期] API 与 Auth 模块重构:** 剥离本地内存逻辑，实现标准 JWT / AppSecret Auth，实现 Token 自动化签发机制。
3. **[第三期] 文件服务迁移:** 上传接口迁移至腾讯云 COS 签名直传。
4. **[第四期] 即时通讯系统接入:** 切换消息系统为真实的 WebSocket 或云 IM 引擎。
5. **[第五期] 管理后台与计费:** 开发者管理页面以及账单中心。
