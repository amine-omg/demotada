import express from "express";
const router = express.Router();
import * as userController from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import multer from 'multer';

// Configuration Multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } // Limite à 2Mo pour la sécurité
});

// --- ROUTES PERSONNELLES (Utilisateur connecté) ---
router.get("/profile", protect, userController.getUserProfile);
router.put("/profile", protect, userController.updateUserProfile);
router.put("/onboard-profile", protect, userController.onboardUserProfile);
router.post("/change-password", protect, userController.changePassword);

router.get('/me/formations', protect, userController.getUserFormations);

// Photo de profil (Self)
router.post(
  '/profile/photo',
  protect,
  upload.single('profilePhoto'),
  userController.uploadProfilePhoto
);

// --- ROUTES ADMINISTRATIVES (Admin uniquement) ---
router.route("/")
    .get(protect, authorize(['admin']), userController.getUsers);

router.get('/by-email/:email', protect, authorize(['admin']), userController.getUserByEmail);

// Photo de profil d'un tiers (Admin)
router.post(
  '/:id/photo', 
  protect,
  authorize(['admin']),
  upload.single('profilePhoto'), 
  userController.updateUserPhotoByAdmin 
);

router.route('/:id')
    .get(protect, authorize(['admin']), userController.getUser)
    .put(protect, authorize(['admin']), userController.updateUser)
    .delete(protect, authorize(['admin']), userController.deleteUser);

export default router;