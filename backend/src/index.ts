import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.routes';

import { modelRouter } from './routes/model.routes';
import { dynamicRouter } from './routes/dynamic.routes';
import { errorHandler } from './middleware/error.middleware';
import { ModelLoader } from './services/model-loader.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/models', modelRouter);
app.use('/api', dynamicRouter); // Dynamic CRUD routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Initialize model loader and start server
async function startServer() {
  try {
    // Load all existing models on startup
    const modelLoader = ModelLoader.getInstance();
    await modelLoader.loadAllModels();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📁 Models loaded: ${modelLoader.getModelCount()}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app };
