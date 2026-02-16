// models/invigilatorModel.js
import { pool } from '../db.js';

/**
 * Invigilator Model
 * Functions to interact with invigilators and their assignment to exams
 */

export const InvigilatorModel = {
  // Add a new invigilator
  async addInvigilator({ invigilator_name, invigilator_id }) {
    const query = `
      INSERT INTO invigilators (invigilator_name, invigilator_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [invigilator_name, invigilator_id]);
    return rows[0];
  },

  // Get all invigilators
  async getAllInvigilators() {
    const query = `SELECT * FROM invigilators ORDER BY invigilator_name;`;
    const { rows } = await pool.query(query);
    return rows;
  },

  // Assign invigilators to an exam
  async assignToExam({ exam_id, invigilator_ids }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Clear existing assignments for this exam
      await client.query('DELETE FROM exam_invigilators WHERE exam_id = $1', [exam_id]);

      // Insert new assignments
      for (const inv_id of invigilator_ids) {
        await client.query(
          'INSERT INTO exam_invigilators (exam_id, invigilator_id) VALUES ($1, $2)',
          [exam_id, inv_id]
        );
      }

      await client.query('COMMIT');
      return { success: true };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error assigning invigilators:', err);
      throw err;
    } finally {
      client.release();
    }
  },

  // Get invigilators assigned to a specific exam
  async getByExam(exam_id) {
    const query = `
      SELECT i.invigilator_name, i.invigilator_id
      FROM invigilators i
      INNER JOIN exam_invigilators ei ON i.id = ei.invigilator_id
      WHERE ei.exam_id = $1
    `;
    const { rows } = await pool.query(query, [exam_id]);
    return rows;
  },
};
