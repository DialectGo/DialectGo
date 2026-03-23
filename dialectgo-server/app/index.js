import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import supabase from './config/db.js';
import userRoutes from "./routes/userRoutes.js";
import errorHandling from './middlewares/errorHandler.js';
import translationRoutes from './routes/translationRoutes.js';

dotenv.config(); 

const app = express();
const port = process.env.PORT || 5001;

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use('/api', userRoutes);

app.use('/api', translationRoutes); // 2. Add this

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

// Server running
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`📱 For Expo Go, use: http://YOUR_IP_ADDRESS:${port}`);
});
