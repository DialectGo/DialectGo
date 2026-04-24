import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase, connectDB } from './config/db.js';
import userRoutes from "./routes/userRoutes.js";
import errorHandling from './middlewares/errorHandler.js';
import translationRoutes from './routes/translationRoutes.js';
import dictionaryRoutes from './routes/dictionaryRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import progressRoutes from './routes/progressRoutes.js';


dotenv.config(); 

const app = express();
const port = process.env.PORT || 5001;

// Middlewares
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Routes
app.use('/api', userRoutes);
app.use('/api/users', userRoutes);

app.use('/api', translationRoutes); // 2. Add this
// ... other middlewares
app.use('/api/dictionary', dictionaryRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/progress', progressRoutes);

// Testing Supabase connection
app.get('/test-supabase', async (req, res) => {
    try {
        const { data, error } = await supabase.from('cebuano').select('*');
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Error handling middleware
app.use(errorHandling);

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
