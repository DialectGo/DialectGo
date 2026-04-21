import express from 'express';
import * as UserController from '../controller/userController.js';
import verifyToken from '../middlewares/auth.js';
// Assume you create/import an authorizeRole middleware
import { authorizeRole } from '../middlewares/roleMiddleware.js'; 

const router = express.Router();

// Public Routes
router.post("/auth/register", UserController.register);
router.post("/auth/login", UserController.login);

// Authenticated User Routes
router.get("/profile", verifyToken, UserController.getProfile);
router.put("/profile", verifyToken, UserController.updateProfile);

// Admin Restricted Routes
// Chain the middlewares: verify user is logged in, then verify they are an admin
router.get("/admin/users", verifyToken, authorizeRole('admin'), UserController.getAllUsers);
router.get("/admin/user/:id", verifyToken, authorizeRole('admin'), UserController.getUserById);
router.put("/admin/user/:id", verifyToken, authorizeRole('admin'), UserController.updateUser);
router.delete("/admin/user/:id", verifyToken, authorizeRole('admin'), UserController.deleteUser);

export default router;