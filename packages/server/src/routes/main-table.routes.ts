import { Router, Request, Response } from 'express';
import * as mainTableService from '../services/main-table.service.js';

const router = Router();

// GET /api/main-table
router.get('/', async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const rows = await mainTableService.findAll(search);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/main-table/next-id
router.get('/next-id', async (_req: Request, res: Response) => {
  try {
    const nextId = await mainTableService.getNextId();
    res.json({ nextId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/main-table/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const row = await mainTableService.findById(Number(req.params.id));
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/main-table
router.post('/', async (req: Request, res: Response) => {
  try {
    const row = await mainTableService.create(req.body);
    res.status(201).json(row);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/main-table/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const row = await mainTableService.update(Number(req.params.id), req.body);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/main-table/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await mainTableService.remove(Number(req.params.id));
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err: any) {
    if (err.message.includes('샘플')) {
      return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
