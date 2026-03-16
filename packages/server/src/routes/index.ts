import { Router } from 'express';
import mainTableRoutes from './main-table.routes.js';
import detailRoutes from './detail.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/main-table', mainTableRoutes);
router.use('/detail', detailRoutes);

export default router;
