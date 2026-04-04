import express from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../controller/userController.js';
import validateUser from '../middlewares/inputValidator.js';
import verifyToken from '../middlewares/auth.js';

const router = express.Router();

// Public: Anyone can sign up
router.post("/users", validateUser, createUser);

// Private: Only authenticated admins/users can see or modify data
router.get("/users", verifyToken, getAllUsers);
router.get("/user/:id", verifyToken, getUserById);
router.put("/user/:id", verifyToken, validateUser, updateUser);
router.delete("/user/:id", verifyToken, deleteUser);

export default router;