// app.js
const express = require('express');
require('dotenv').config();
const examsRouter = require('./routes/exams');

const app = express();
app.use(express.json());

// Routes
app.use('/exams', examsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
