import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import route files
import facultyRoutes from './routes/faculty.js';
import departmentRoutes from './routes/department.js';
import timetableRoutes from './routes/timetable.js';

// Import middleware
import { validateKey } from './middleware/validateKey.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/faculty', validateKey('faculty'), facultyRoutes);
app.use('/api/department', validateKey('department'), departmentRoutes);
app.use('/api/timetable', validateKey(), timetableRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Exam Scheduler Backend is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
