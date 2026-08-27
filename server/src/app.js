import express from 'express';
import cors from 'cors';

import authRouter from './routes/auth.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sessionMiddleware } from './config/session.js';
import workoutRouter from './routes/workout.routes.js';



const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,

}));

app.use(express.json());
app.use(sessionMiddleware);



app.use('/api/auth', authRouter);
app.use('/api/workouts', workoutRouter);



app.get("/api/health", (req, res) => {
    return res.json({ status: "ok" });
});






app.use(errorHandler);

export default app;