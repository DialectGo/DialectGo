import dotenv from 'dotenv';
dotenv.config(); // MUST be first line

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import userRoutes from './routes/user.route.js';
import errorHandler from './middlewares/error.middleware.js';
import { supabase, connectDB } from './config/db.js';
import translationRoutes from './routes/translation.route.js';
import dictionaryRoutes from './routes/dictionary.route.js';
import gameRoutes from './routes/game.route.js';
import sessionRoutes from './routes/session.route.js';
import progressRoutes from './routes/progress.route.js';

const app = express();
const port = process.env.PORT || 5001;

app.use(helmet());
app.use(cors({ origin: ['http://localhost:5001'] }));

app.use(express.json());

// Rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

app.use('/api/v1/users', userRoutes);

// babaguhin ko pa toh
app.use('/api', translationRoutes); // 2. Add this
// ... other middlewares
app.use('/api/dictionary', dictionaryRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/progress', progressRoutes);
// babaguhin ko pa toh

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(errorHandler);

const startServer = async () => {
    await connectDB();

    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server is running on http://localhost:${port}`);
        console.log(`📱 For Expo Go, use: http://YOUR_IP_ADDRESS:${port}`);
    });
};

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
export default app;