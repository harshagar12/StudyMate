import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    next();
});

import termRoutes from './routes/terms';
import subjectRoutes from './routes/subjects';
import resourceRoutes from './routes/resources';
import chatRoutes from './routes/chat';
import notesRoutes from './routes/notes';

app.use('/api/terms', termRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notes', notesRoutes);

app.get('/', (req, res) => {
  res.send('StudyMate API is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
