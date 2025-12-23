import express from "express";
import multer from "multer";
import path from "path";
import {
  getUsers,
  getUserById,
  getTotalUsers,
  createUser,
  updateUser,
  deleteUser,
  addAdmin,
  listAdmin,
  editAdmin,
  getUsersByRole,
  getUsersStats, // Tambahkan ini
} from "../controllers/usersController.js";
import { verifyUser, adminOnly } from "../middleware/authUser.js";

const router = express.Router();

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

router.get("/users", verifyUser, adminOnly, getUsers);
router.get("/list-admin", verifyUser, adminOnly, listAdmin);
router.get("/user/:id", verifyUser, adminOnly, getUserById);
router.get("/total-users", verifyUser, getTotalUsers);
router.get("/by-role", verifyUser, adminOnly, getUsersByRole);
router.get("/stats", verifyUser, adminOnly, getUsersStats); // Tambahkan route stats
router.post("/user", verifyUser, adminOnly, createUser);
router.post("/add-admin", verifyUser, adminOnly, upload.single('photo_profile'), addAdmin);
router.patch("/user/:id", verifyUser, adminOnly, updateUser);
router.patch("/user/:id/edit-admin", verifyUser, adminOnly, upload.single('photo_profile'), editAdmin);
router.delete("/user/:id", verifyUser, adminOnly, deleteUser);

export default router;