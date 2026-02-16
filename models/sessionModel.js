// models/sessionModel.js
import { pool } from '../db.js';

/**
 * Session Model
 * Handles exam sessions (time ranges) created by faculty
 */

export const SessionModel = {
  // Create a new session
  async createSession({ session_label, start_time, end_time }) {
    const query = `
      INSERT INTO sessions (session_label, start_time, end_time)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [session_label, start_time, end_time]);
    return rows[0];
  },

  // Get all sessions
  async getAllSessions() {
    const query = `SELECT * FROM sessions ORDER BY start_time;`;
    const { rows } = await pool.query(query);
    return rows;
  },

  // Get a session by label
  async getSessionByLabel(session_label) {
    const query = `SELECT * FROM sessions WHERE session_label = $1`;
    const { rows } = await pool.query(query, [session_label]);
    return rows[0];
  },

  // Get session time range for display
  async getTimeRange(session_label) {
    const session = await this.getSessionByLabel(session_label);
    if (!session) return null;
    return { start_time: session.start_time, end_time: session.end_time };
  },

  // Optional: delete a session
  async deleteSession(session_label) {
    const query = `DELETE FROM sessions WHERE session_label = $1 RETURNING *;`;
    const { rows } = await pool.query(query, [session_label]);
    return rows[0]; // returns deleted session
  },
};
