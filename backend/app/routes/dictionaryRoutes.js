import express from 'express';
import { getWordDefinition } from '../controller/dictionaryController.js';
// import verifyToken from '../middlewares/auth.js'; // Optional: if you want to protect this route

const router = express.Router();

router.get('/:word', getWordDefinition);

export default router;