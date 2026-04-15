import mysql from "mysql2/promise";
import { config } from "../config";
//创建MySQL连接池
export const db = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
//初始化数据库，创建必要的表
export async function initDatabase() {
  //创建用户表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  //创建任务记忆表
  await db.execute(`
    CREATE TABLE IF NOT EXISTS task_memories (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id INT UNSIGNED NOT NULL,
      task_type VARCHAR(64) NOT NULL,
      input_text TEXT NULL,
      has_image TINYINT(1) NOT NULL DEFAULT 0,
      has_audio TINYINT(1) NOT NULL DEFAULT 0,
      final_summary TEXT NOT NULL,
      modality_results JSON NOT NULL,
      success_count INT UNSIGNED NOT NULL DEFAULT 0,
      failure_count INT UNSIGNED NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_task_memories_user_created (user_id, created_at),
      CONSTRAINT fk_task_memories_user FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}
