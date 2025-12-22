import { adminOnly, verifyUser } from "../middleware/authUser.js";
import express from 'express';
import {
  getManualRates,
  getManualRateById,
  getActiveRateForCurrency,
  createManualRate,
  updateManualRate,
  deactivateManualRate,
  bulkUpsertRates,
  getRateStatistics,
  validateConversion
} from '../controllers/manualRateController.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// These routes are accessible without authentication for leaderboard use

router.get('/active', getActiveRateForCurrency);
router.get('/validate', validateConversion);

// ==================== PROTECTED ROUTES ====================
// All routes below require authentication

router.get('/', verifyUser, adminOnly, getManualRates);
router.get('/statistics', verifyUser, adminOnly, getRateStatistics);
router.get('/:id', verifyUser, adminOnly, getManualRateById);
router.post('/', verifyUser, adminOnly, createManualRate);
router.put('/:id', verifyUser, adminOnly, updateManualRate);
router.delete('/:id', verifyUser, adminOnly, deactivateManualRate);
router.post('/bulk', verifyUser, adminOnly, bulkUpsertRates);

export default router;