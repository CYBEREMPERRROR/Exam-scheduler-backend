// routes/faculty.js
import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

/*
===========================
  SESSIONS
===========================
*/

// Add new session
router.post('/sessions', async (req, res) => {
  try {
    const { label, start_time, end_time } = req.body;

    if (!label || !start_time || !end_time) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const query = `
      INSERT INTO sessions (label, start_time, end_time)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [label, start_time, end_time]);
    res.status(201).json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating session' });
  }
});

// Get all sessions
router.get('/sessions', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM sessions ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching sessions' });
  }
});


/*
===========================
  VENUES
===========================
*/

// Add new venue
router.post('/venues', async (req, res) => {
  try {
    const { name, capacity } = req.body;

    if (!name || !capacity) {
      return res.status(400).json({ error: 'Name and capacity required' });
    }

    const query = `
      INSERT INTO venues (name, capacity)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [name, capacity]);
    res.status(201).json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: 'Error creating venue' });
  }
});

// Get all venues
router.get('/venues', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM venues ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching venues' });
  }
});


/*
===========================
  SELECT ALLOWED VENUES
===========================
*/

// Faculty selects venue for departments
router.post('/select-venue', async (req, res) => {
  try {
    const { venue_id } = req.body;

    if (!venue_id) {
      return res.status(400).json({ error: 'Venue ID required' });
    }

    const query = `
      INSERT INTO faculty_selected_venues (venue_id)
      VALUES ($1)
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [venue_id]);
    res.status(201).json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: 'Error selecting venue' });
  }
});


/*
===========================
  INVIGILATORS
===========================
*/

// Add invigilator
router.post('/invigilators', async (req, res) => {
  try {
    const { name, invigilator_code } = req.body;

    if (!name || !invigilator_code) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const query = `
      INSERT INTO invigilators (name, invigilator_code)
      VALUES ($1, $2)
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [name, invigilator_code]);
    res.status(201).json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: 'Error creating invigilator' });
  }
});

// Get invigilators
router.get('/invigilators', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM invigilators ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching invigilators' });
  }
});

export default router;
