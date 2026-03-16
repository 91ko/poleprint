import pool from '../db/connection.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

interface MainTableDbRow {
  id: number;
  date: string;
  client_name: string;
  remarks: string;
  total_qty: number;
  unit_price: number;
  amount: number;
  pole_type: number;
  constructor: string;
  website: string;
  mgmt: string;
  mgmt1: string;
  mgmt2: string;
}

function toApiRow(row: MainTableDbRow) {
  return {
    id: row.id,
    date: row.date,
    clientName: row.client_name,
    remarks: row.remarks,
    totalQty: row.total_qty,
    unitPrice: row.unit_price,
    amount: row.amount,
    poleType: row.pole_type,
    constructor: row.constructor,
    website: row.website,
    mgmt: row.mgmt,
    mgmt1: row.mgmt1,
    mgmt2: row.mgmt2,
  };
}

// Detail table mapping by pole type
const DETAIL_TABLE_MAP: Record<number, string> = {
  0: 'detail_jju',
  1: 'detail_jjung',
  2: 'detail_deung',
  4: 'detail_kiki',
  6: 'detail_cable',
  7: 'detail_cable_label',
  8: 'detail_cable2',
  9: 'detail_etc',
};

export async function findAll(search?: string) {
  let query = 'SELECT * FROM main_table';
  const params: string[] = [];

  if (search) {
    query += ' WHERE client_name LIKE ? OR remarks LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY id ASC';

  const [rows] = await pool.execute(query, params) as unknown as [MainTableDbRow[], any];
  return rows.map(toApiRow);
}

export async function findById(id: number) {
  const [rows] = await pool.execute(
    'SELECT * FROM main_table WHERE id = ?',
    [id]
  ) as unknown as [MainTableDbRow[], any];

  if (rows.length === 0) return null;

  const row = rows[0];

  // Compute totalQty from detail table
  const detailTable = DETAIL_TABLE_MAP[row.pole_type];
  let totalQty = 0;
  if (detailTable) {
    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as cnt FROM ${detailTable} WHERE management_id = ?`,
      [id]
    );
    totalQty = countRows[0].cnt;
  }

  return { ...toApiRow(row), totalQty };
}

export async function getNextId() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM main_table'
  );
  return rows[0].next_id;
}

export async function create(data: {
  clientName?: string;
  remarks?: string;
  unitPrice?: number;
  amount?: number;
  poleType: number;
  constructor?: string;
  website?: string;
  mgmt?: string;
  mgmt1?: string;
  mgmt2?: string;
}) {
  const nextId = await getNextId();

  await pool.execute<ResultSetHeader>(
    `INSERT INTO main_table (id, date, client_name, remarks, total_qty, unit_price, amount, pole_type, constructor, website, mgmt, mgmt1, mgmt2)
     VALUES (?, CURDATE(), ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nextId,
      data.clientName || '',
      data.remarks || '',
      data.unitPrice || 0,
      data.amount || 0,
      data.poleType,
      data.constructor || '',
      data.website || '',
      data.mgmt || '',
      data.mgmt1 || '',
      data.mgmt2 || '',
    ]
  );

  return findById(nextId);
}

export async function update(
  id: number,
  data: Record<string, any>
) {
  const fieldMap: Record<string, string> = {
    date: 'date',
    clientName: 'client_name',
    remarks: 'remarks',
    unitPrice: 'unit_price',
    amount: 'amount',
    poleType: 'pole_type',
    constructor: 'constructor',
    website: 'website',
    mgmt: 'mgmt',
    mgmt1: 'mgmt1',
    mgmt2: 'mgmt2',
  };

  const sets: string[] = [];
  const values: any[] = [];

  for (const [key, val] of Object.entries(data)) {
    const col = fieldMap[key];
    if (col) {
      sets.push(`${col} = ?`);
      values.push(val);
    }
  }

  if (sets.length === 0) return findById(id);

  values.push(id);
  await pool.execute(
    `UPDATE main_table SET ${sets.join(', ')} WHERE id = ?`,
    values
  );

  return findById(id);
}

export async function remove(id: number) {
  if (id <= 6) {
    throw new Error('샘플 데이터(ID 1~6)는 삭제할 수 없습니다.');
  }

  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM main_table WHERE id = ?',
    [id]
  );

  return result.affectedRows > 0;
}
