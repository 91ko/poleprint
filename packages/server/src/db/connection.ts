import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'poleprint',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'UTF8MB4_UNICODE_CI',
});

export async function initDatabase(): Promise<void> {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  // Ensure UTF-8 on connection
  await pool.execute("SET NAMES 'utf8mb4'");

  // Create database if not exists
  const tempPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    charset: 'UTF8MB4_UNICODE_CI',
  });

  await tempPool.execute(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'poleprint'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await tempPool.end();

  // Run schema
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await pool.execute(stmt);
  }

  // Seed sample data if empty
  const [rows] = await pool.execute('SELECT COUNT(*) as cnt FROM main_table');
  const count = (rows as any)[0].cnt;

  if (count === 0) {
    const seed = readFileSync(join(__dirname, 'seed.sql'), 'utf-8');
    const seedStatements = seed
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of seedStatements) {
      await pool.execute(stmt);
    }
    console.log('Seed data inserted');
  }

  console.log('Database initialized');
}

export default pool;
