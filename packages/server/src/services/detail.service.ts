import pool from '../db/connection.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

const VALID_TABLES = [
  'detail_jju', 'detail_jjung', 'detail_etc', 'detail_kiki',
  'detail_deung', 'detail_karo', 'detail_cable', 'detail_cable2', 'detail_cable_label',
] as const;

type DetailTable = (typeof VALID_TABLES)[number];

function validateTable(table: string): DetailTable {
  if (!VALID_TABLES.includes(table as DetailTable)) {
    throw new Error(`Invalid table: ${table}`);
  }
  return table as DetailTable;
}

export async function findByManagementId(table: string, managementId: number) {
  const validTable = validateTable(table);
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM ${validTable} WHERE management_id = ? ORDER BY sort_order ASC, rowid ASC`,
    [managementId]
  );
  return rows;
}

export async function findOne(table: string, rowid: number) {
  const validTable = validateTable(table);
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM ${validTable} WHERE rowid = ?`,
    [rowid]
  );
  return rows[0] || null;
}

export async function create(table: string, data: Record<string, any>) {
  const validTable = validateTable(table);
  const keys = Object.keys(data);
  const placeholders = keys.map(() => '?').join(', ');
  const values = Object.values(data);

  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO ${validTable} (${keys.join(', ')}) VALUES (${placeholders})`,
    values
  );

  return findOne(table, result.insertId);
}

export async function update(table: string, rowid: number, data: Record<string, any>) {
  const validTable = validateTable(table);
  const sets: string[] = [];
  const values: any[] = [];

  for (const [key, val] of Object.entries(data)) {
    if (key === 'rowid') continue;
    sets.push(`${key} = ?`);
    values.push(val);
  }

  if (sets.length === 0) return findOne(table, rowid);

  values.push(rowid);
  await pool.execute(
    `UPDATE ${validTable} SET ${sets.join(', ')} WHERE rowid = ?`,
    values
  );

  return findOne(table, rowid);
}

export async function remove(table: string, rowid: number) {
  const validTable = validateTable(table);
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM ${validTable} WHERE rowid = ?`,
    [rowid]
  );
  return result.affectedRows > 0;
}

export async function updateTotalQty(managementId: number, table: string) {
  const validTable = validateTable(table);
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) as cnt FROM ${validTable} WHERE management_id = ?`,
    [managementId]
  );
  const count = rows[0].cnt;
  await pool.execute('UPDATE main_table SET total_qty = ? WHERE id = ?', [count, managementId]);
  return count;
}
