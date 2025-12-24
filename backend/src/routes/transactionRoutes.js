import express from "express";
import {
  createTransaction,
  handleNotification,
  getTransactionStatus,
  getUserTransactions,
  generateInvoice,
  getInvoiceData,
  forceSyncTransaction,
  syncFromDashboard,
  autoFixPastTransactions,
  cancelTransaction,
  getTransactionToken,
  getAllTransactions,
  getTransactionStatistics
} from "../controllers/transactionController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";
import { validateTransactionStatus } from "../middleware/transactionValidation.js";

const router = express.Router();

router.post("/create", verifyUser, createTransaction);
router.get("/user", verifyUser, getUserTransactions);
router.post('/:orderId/cancel', verifyUser, cancelTransaction);
router.post("/sync/:orderId", verifyUser, validateTransactionStatus, forceSyncTransaction);
router.get("/status/:orderId", verifyUser, getTransactionStatus);
router.get('/invoice/:orderId', verifyUser, getInvoiceData);
router.get("/token/:orderId", verifyUser, getTransactionToken);
router.get('/invoice-pdf/:orderId', verifyUser, generateInvoice);
router.post("/notification", handleNotification);
router.post('/sync-dashboard/:orderId', verifyUser, syncFromDashboard);
router.post('/auto-fix', autoFixPastTransactions);

router.get("/", verifyUser, adminOnly, getAllTransactions);
router.get("/statistics", verifyUser, adminOnly, getTransactionStatistics);

export default router;
