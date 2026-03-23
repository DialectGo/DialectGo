import express from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../controller/userController.js';
import validateUser from '../middlewares/inputValidator.js';

const router = express.Router();

router.post("/users", validateUser, createUser);
router.get("/users", getAllUsers);
router.get("/user/:id", getUserById);
router.put("/user/:id", validateUser, updateUser);
router.delete("/user/:id", deleteUser);

export default router;