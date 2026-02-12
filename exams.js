// Full backend code: app.js
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

// PostgreSQL pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Access key middleware
const requireAccessKey = (req, res, next) => {
    const key = req.headers['x-access-key'];
    if (!key) return res.status(401).json({ message: 'Access key required' });
    if (key !== process.env.SECURITY_ACCESS_KEY)
        return res.status(403).json({ message: 'Invalid access key' });
    next();
};

// Exams POST route
app.post('/exams', requireAccessKey, async (req, res) => {
    const { course_code, department, level, venue_id, exam_date, start_time, end_time, number_of_students } = req.body;

    if (!course_code || !department || !level || !venue_id || !exam_date || !start_time || !end_time || !number_of_students) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check venue capacity
        const venueRes = await client.query('SELECT capacity FROM venues WHERE id = $1', [venue_id]);
        if (!venueRes.rows.length) return res.status(400).json({ message: 'Venue not found' });

        if (number_of_students > venueRes.rows[0].capacity) {
            return res.status(400).json({ errorType: 'CAPACITY_EXCEEDED', message: 'Number of students exceeds venue capacity' });
        }

        // Clash detection
        const clashQuery = `
            SELECT * FROM exams 
            WHERE exam_date = $1 
            AND (
                venue_id = $2
                OR (department = $3 AND level = $4)
            )
            AND NOT (end_time <= $5 OR start_time >= $6)
        `;
        const clashRes = await client.query(clashQuery, [exam_date, venue_id, department, level, start_time, end_time]);

        if (clashRes.rows.length > 0) {
            return res.status(400).json({ errorType: 'CLASH_DETECTED', message: 'Exam clash detected for venue or department/level' });
        }

        // Insert exam
        await client.query(
            `INSERT INTO exams (course_code, department, level, venue_id, exam_date, start_time, end_time, number_of_students)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [course_code, department, level, venue_id, exam_date, start_time, end_time, number_of_students]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Exam scheduled successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    } finally {
        client.release();
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
