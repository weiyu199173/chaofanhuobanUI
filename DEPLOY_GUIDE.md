# Transcend AI 部署指南

## 服务器配置
- **配置**：2核 2GB 内存 40GB SSD
- **用途**：应用服务器 + MySQL数据库（测试环境）

## 一、基础环境准备

### 1. 系统更新
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. 安装必要工具
```bash
sudo apt install -y git curl wget vim
```

## 二、安装 Node.js

```bash
# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v
npm -v
```

## 三、安装 MySQL 5.7

### 1. 安装 MySQL
```bash
# 下载 MySQL APT 配置
wget https://dev.mysql.com/get/mysql-apt-config_0.8.33-1_all.deb
sudo dpkg -i mysql-apt-config_0.8.33-1_all.deb

# 更新并安装
sudo apt update
sudo apt install -y mysql-server

# 启动 MySQL
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. 安全配置
```bash
sudo mysql_secure_installation
```

### 3. 创建数据库和用户
```bash
# 登录 MySQL
sudo mysql -u root -p

# 在 MySQL 中执行以下命令：
CREATE DATABASE transcend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'transcend'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON transcend.* TO 'transcend'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. 导入数据库架构
```bash
# 将 TENCENT_MYSQL_SETUP.sql 上传到服务器，然后执行：
mysql -u transcend -p transcend < TENCENT_MYSQL_SETUP.sql
```

## 四、部署应用

### 1. 克隆代码
```bash
cd ~
git clone <your-repository-url>
cd transcend
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件
vim .env
```

### 4. 环境变量配置内容
```env
# 服务器配置
PORT=3001
NODE_ENV=development

# JWT 密钥（生成一个强密钥）
JWT_SECRET=your_very_secure_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# 本地 MySQL 配置
TENCENT_DB_HOST=localhost
TENCENT_DB_PORT=3306
TENCENT_DB_NAME=transcend
TENCENT_DB_USER=transcend
TENCENT_DB_PASSWORD=your_secure_password_here
```

### 5. 启动应用
```bash
# 开发模式
npm run dev

# 生产模式（需要先构建）
npm run build
npm start
```

## 五、使用 PM2 管理进程（推荐）

### 1. 安装 PM2
```bash
sudo npm install -g pm2
```

### 2. 启动应用
```bash
# 在项目目录下
pm2 start npm --name "transcend-api" -- start

# 设置开机自启
pm2 startup
pm2 save
```

### 3. PM2 常用命令
```bash
pm2 status              # 查看状态
pm2 logs transcend-api  # 查看日志
pm2 restart transcend-api  # 重启
pm2 stop transcend-api     # 停止
```

## 六、配置 Nginx 反向代理（可选但推荐）

### 1. 安装 Nginx
```bash
sudo apt install -y nginx
```

### 2. 创建配置文件
```bash
sudo vim /etc/nginx/sites-available/transcend
```

### 3. 配置内容
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 改成你的域名或服务器IP

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. 启用配置
```bash
sudo ln -s /etc/nginx/sites-available/transcend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 七、防火墙配置

```bash
# 允许 SSH
sudo ufw allow 22/tcp

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable
```

## 八、MySQL 性能优化（测试环境可选）

编辑 MySQL 配置文件：
```bash
sudo vim /etc/mysql/mysql.conf.d/mysqld.cnf
```

添加或修改以下配置：
```ini
[mysqld]
# 内存相关
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 150

# 查询缓存（MySQL 5.7 支持）
query_cache_size = 64M
query_cache_type = 1

# 字符集
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

重启 MySQL：
```bash
sudo systemctl restart mysql
```

## 九、备份策略

### 1. 数据库备份脚本
创建 `backup.sh`：
```bash
#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u transcend -p'your_password' transcend | gzip > $BACKUP_DIR/transcend_$DATE.sql.gz

# 保留最近 7 天的备份
find $BACKUP_DIR -name "transcend_*.sql.gz" -mtime +7 -delete
```

### 2. 设置定时任务
```bash
crontab -e

# 添加：每天凌晨 2 点备份
0 2 * * * ~/backup.sh
```

## 十、验证部署

```bash
# 检查应用是否运行
curl http://localhost:3001/health

# 应该返回：{"status":"ok","timestamp":"...","database":"connected"}
```

---

## 快速启动命令汇总

```bash
# 1. 系统更新
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git mysql-server

# 3. 配置 MySQL（手动执行SQL）
sudo mysql -u root

# 4. 部署应用
cd ~
git clone <repo-url>
cd transcend
npm install
cp .env.example .env
# 编辑 .env

# 5. 启动
npm run dev
```

祝你部署顺利！🚀
