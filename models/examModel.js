// models/examModel.js
import { pool } from '../db.js';

/**
 * Exam Model
 * Functions to interact with the exams table
 */

export const ExamModel = {
  // Create a new exam
  async createExam(exam) {
    const {
      course_code,
      course_title,
      department,
      venue_id,
      exam_date,
      start_time,
      end_time,
      session_label,
      number_of_students,
    } = exam;

    const query = `
      INSERT INTO exams
      (course_code, course_title, department, venue_id, exam_date, start_time, end_time, session_label, number_of_students)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *;
    `;

    const values = [
      course_code,
      course_title,
      department,
      venue_id,
      exam_date,
      start_time,
      end_time,
      session_label,
      number_of_students,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Get all exams
  async getAllExams() {
    const query = `
      SELECT e.id, e.course_code, e.course_title, e.department,
             e.venue_id, v.venue_name, v.capacity,
             e.exam_date, e.start_time, e.end_time, e.session_label,
             e.number_of_students
      FROM exams e
      LEFT JOIN venues v ON e.venue_id = v.id
      ORDER BY e.exam_date, e.start_time;
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  // Get exams by department
  async getExamsByDepartment(department) {
    const query = `
      SELECT * FROM exams
      WHERE department = $1
      ORDER BY exam_date, start_time;
    `;
    const { rows } = await pool.query(query, [department]);
    return rows;
  },

  // Check for exam clashes
  async checkClash({ exam_date, venue_id, start_time, end_time, department }) {
    const query = `
      SELECT * FROM exams
      WHERE exam_date = $1
        AND venue_id = $2
        AND NOT (end_time <= $3 OR start_time >= $4)
        OR (department = $5 AND NOT (end_time <= $3 OR start_time >= $4))
    `;
    const { rows } = await pool.query(query, [exam_date, venue_id, start_time, end_time, department]);
    return rows;
  },
};
