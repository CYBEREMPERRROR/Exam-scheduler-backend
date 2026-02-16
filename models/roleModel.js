// models/roleModel.js
import { pool } from '../db.js';

/**
 * Role Model
 * Handles role lookup and validation
 */

export const RoleModel = {
  // Get role by access key
  async getByAccessKey(accessKey) {
    const query = `SELECT * FROM roles WHERE access_key = $1`;
    const { rows } = await pool.query(query, [accessKey]);
    return rows[0]; // undefined if not found
  },

  // Get all departmental roles
  async getDepartmentRoles() {
    const query = `
      SELECT * FROM roles
      WHERE role_type = 'department'
      ORDER BY department_name;
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  // Create a new role
  async createRole({ role_type, department_name, access_key }) {
    const query = `
      INSERT INTO roles (role_type, department_name, access_key)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [role_type, department_name || null, access_key];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Optional: get role type for a user (faculty/department)
  async getRoleType(accessKey) {
    const role = await this.getByAccessKey(accessKey);
    return role?.role_type || null;
  },
};
