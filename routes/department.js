// routes/department.js
import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

/**
 * GET /api/department/venues
 * Return venues assigned by faculty exam officer
 * The department exam officer should only see venues faculty selected
 */
router.get('/venues', async (req, res) => {
  try {
    // If the role is attached by validateKey middleware
    const facultyId = req.role === 'faculty' ? null : req.accessKey;

    // Only return venues configured by faculty
    const query = `
      SELECT v.id, v.name, v.capacity
      FROM venues v
      JOIN exams e ON e.venue_id = v.id
      WHERE e.faculty_key = $1
      GROUP BY v.id
    `;

    const { rows } = await pool.query(query, [facultyId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching department venues:', err);
    res.status(500).json({ error: 'Server error fetching venues' });
  }
});

/**
 * GET /api/department/sessions
 * Return sessions assigned by faculty exam officer
 */
router.get('/sessions', async (req, res) => {
  try {
    // Only sessions created by faculty for this department
    const query = `
      SELECT s.id, s.label, s.start_time, s.end_time
      FROM sessions s
      JOIN exams e ON e.session_id = s.id
      WHERE e.faculty_key = $1
      GROUP BY s.id
    `;

    const { rows } = await pool.query(query, [req.accessKey]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching department sessions:', err);
    res.status(500).json({ error: 'Server error fetching sessions' });
  }
});

/**
 * POST /api/department/exams
 * Department exam officer schedules an exam
 * Validates “fair play” rules before inserting
 */
router.post('/exams', async (req, res) => {
  try {
    const { course_code, course_title, venue_id, session_id, invigilators } = req.body;

    // Fair play checks
    const checkQuery = `
      SELECT * FROM exams
      WHERE venue_id = $1
        AND session_id = $2
        AND exam_date = CURRENT_DATE
    `;
    const { rows } = await pool.query(checkQuery, [venue_id, session_id]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'This venue/session is already booked today.' });
    }

    // Insert exam
    const insertQuery = `
      INSERT INTO exams (course_code, course_title, venue_id, session_id, created_by, exam_date)
      VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [course_code, course_title, venue_id, session_id, req.accessKey]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error scheduling exam:', err);
    res.status(500).json({ error: 'Server error scheduling exam' });
  }
});

export default router;
