import { Router, Request, Response } from 'express';
import * as detailService from '../services/detail.service.js';

const router = Router();

// GET /api/detail/:table/:managementId
router.get('/:table/:managementId', async (req: Request, res: Response) => {
  try {
    const rows = await detailService.findByManagementId(
      req.params.table,
      Number(req.params.managementId)
    );
    res.json(rows);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/detail/:table
router.post('/:table', async (req: Request, res: Response) => {
  try {
    const row = await detailService.create(req.params.table, req.body);
    // Update total_qty in main_table
    if (req.body.management_id) {
      await detailService.updateTotalQty(req.body.management_id, req.params.table);
    }
    res.status(201).json(row);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/detail/:table/:rowid
router.put('/:table/:rowid', async (req: Request, res: Response) => {
  try {
    const row = await detailService.update(
      req.params.table,
      Number(req.params.rowid),
      req.body
    );
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/detail/:table/:rowid
router.delete('/:table/:rowid', async (req: Request, res: Response) => {
  try {
    // Get management_id before deleting
    const row = await detailService.findOne(req.params.table, Number(req.params.rowid));
    const deleted = await detailService.remove(
      req.params.table,
      Number(req.params.rowid)
    );
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    // Update total_qty
    if (row?.management_id) {
      await detailService.updateTotalQty(row.management_id, req.params.table);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
