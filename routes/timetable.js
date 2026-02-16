// routes/timetable.js
import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET all exams (read-only timetable)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT e.id, e.course_code, e.course_title, e.department, 
             e.venue_id, v.venue_name, v.capacity,
             e.exam_date, e.start_time, e.end_time, e.session_label,
             e.number_of_students, i.invigilator_name, i.invigilator_id
      FROM exams e
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN exam_invigilators ei ON ei.exam_id = e.id
      LEFT JOIN invigilators i ON ei.invigilator_id = i.id
      ORDER BY e.exam_date, e.start_time;
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching timetable:', err);
    res.status(500).json({ error: 'Server error fetching timetable' });
  }
});

export default router;
