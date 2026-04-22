import { Pool } from 'pg';

// 腾讯云 PostgreSQL 配置
const dbConfig = {
  host: import.meta.env.VITE_TENCENT_DB_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_TENCENT_DB_PORT || '5432'),
  database: import.meta.env.VITE_TENCENT_DB_NAME || 'transcend',
  user: import.meta.env.VITE_TENCENT_DB_USER || 'postgres',
  password: import.meta.env.VITE_TENCENT_DB_PASSWORD || '',
  max: 20, // 连接池最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时
  connectionTimeoutMillis: 2000, // 连接超时
};

// 判断腾讯云配置是否完整
export const isTencentConfigured = !!(
  dbConfig.host && 
  dbConfig.user && 
  dbConfig.password && 
  dbConfig.password !== ''
);

// 创建数据库连接池
let pool: Pool | null = null;

export const getDbPool = (): Pool => {
  if (!pool) {
    pool = new Pool(dbConfig);
  }
  return pool;
};

// 查询函数
export const query = async (text: string, params?: any[]) => {
  const client = await getDbPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// 简单的客户端对象
export const tencentDb = {
  from: (table: string) => ({
    select: (columns = '*') => ({
      select: columns,
      table,
      
      // 查询操作
      eq: (column: string, value: any) => ({ ...this, ...{ [column]: value } },
      limit: (count: number) => ({ ...this, limit: count },
      
      // 执行查询
      async execute(): Promise<any[]> {
        // 简单实现，真实项目需要更完善的查询构建器
        const result = await query(`SELECT ${columns} FROM ${table} LIMIT 100`);
        return result.rows;
      }
    }),
    
    // 插入数据
    insert: (data: any) => ({
      data,
      table,
      async execute(): Promise<any> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`);
        
        const result = await query(
          `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
          values
        );
        return result.rows[0];
      }
    }),
    
    // 更新数据
    update: (data: any) => ({
      data,
      table,
      async execute(): Promise<any> {
        // 简单实现
        const result = await query(`SELECT NOW()`);
        return result.rows;
      }
    })
  })
};
