-- ========================================
-- Transcend AI - 腾讯云 MySQL 数据库架构
-- MySQL 5.7 兼容版本
-- ========================================

-- ========================================
-- 用户表
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(255),
    avatar VARCHAR(500),
    phone VARCHAR(20),
    region VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 资料/实体表
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    user_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    is_agent TINYINT(1) DEFAULT 0,
    type VARCHAR(50) DEFAULT 'human',
    status VARCHAR(50) DEFAULT 'Active',
    lv INT DEFAULT 1,
    sync_rate FLOAT DEFAULT 0.0,
    bio TEXT,
    traits JSON,
    model VARCHAR(255),
    active_hooks JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_profiles_user_id (user_id),
    INDEX idx_profiles_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 关系/好友表
-- ========================================
CREATE TABLE IF NOT EXISTS contacts (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    initiator_id VARCHAR(36),
    target_id VARCHAR(36),
    status VARCHAR(50) DEFAULT 'accepted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_connection (initiator_id, target_id),
    INDEX idx_contacts_initiator_id (initiator_id),
    INDEX idx_contacts_target_id (target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 帖子/动态表
-- ========================================
CREATE TABLE IF NOT EXISTS posts (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    user_id VARCHAR(36),
    twin_id VARCHAR(36),
    content TEXT NOT NULL,
    image_url VARCHAR(500),
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    author_data JSON,
    is_ai_post TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_posts_user_id (user_id),
    INDEX idx_posts_twin_id (twin_id),
    INDEX idx_posts_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 点赞表
-- ========================================
CREATE TABLE IF NOT EXISTS likes (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    user_id VARCHAR(36),
    post_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, post_id),
    INDEX idx_likes_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 书签表
-- ========================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    user_id VARCHAR(36),
    post_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_bookmark (user_id, post_id),
    INDEX idx_bookmarks_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 数字孪生表
-- ========================================
CREATE TABLE IF NOT EXISTS digital_twins (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    user_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    bio TEXT,
    personality_signature TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_digital_twins_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- Agent Token表
-- ========================================
CREATE TABLE IF NOT EXISTS agent_tokens (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    twin_id VARCHAR(36),
    user_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    permissions JSON NOT NULL DEFAULT (JSON_OBJECT('read', 1, 'post', 0, 'chat', 0)),
    is_active TINYINT(1) DEFAULT 1,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    UNIQUE KEY agent_tokens_token_hash_key (token_hash),
    INDEX idx_agent_tokens_twin_id (twin_id),
    INDEX idx_agent_tokens_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 聊天消息表
-- ========================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    twin_id VARCHAR(36),
    user_id VARCHAR(36),
    content TEXT NOT NULL,
    is_from_twin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat_messages_twin_id (twin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 速率限制表
-- ========================================
CREATE TABLE IF NOT EXISTS rate_limits (
    id VARCHAR(36) PRIMARY KEY DEFAULT UUID(),
    identifier VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    count INT DEFAULT 0,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY rate_limits_identifier_action_key (identifier, action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 触发器：创建用户时自动创建 profile
-- ========================================
DELIMITER //

CREATE TRIGGER IF NOT EXISTS on_user_created
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO profiles (id, user_id, name, avatar, is_agent, type)
    VALUES (
        NEW.id, 
        NEW.id, 
        COALESCE(NEW.nickname, '用户'), 
        CONCAT('https://picsum.photos/seed/', NEW.id, '/200'), 
        0, 
        'human'
    );
END//

DELIMITER ;
