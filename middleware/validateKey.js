// middleware/validateKey.js
import { pool } from '../db.js';

/**
 * validateKey middleware
 * @param {string} roleRequired - 'faculty' or 'department' or undefined (any valid key)
 */
export const validateKey = (roleRequired) => {
  return async (req, res, next) => {
    try {
      // Access key should come from header
      const accessKey = req.header('x-access-key');
      if (!accessKey) {
        return res.status(401).json({ error: 'Access key required' });
      }

      // Query the roles table to validate key
      const query = 'SELECT * FROM roles WHERE access_key = $1';
      const { rows } = await pool.query(query, [accessKey]);

      if (rows.length === 0) {
        return res.status(403).json({ error: 'Invalid access key' });
      }

      const role = rows[0];

      // Check if role matches required role (faculty/department)
      if (roleRequired && role.role_type !== roleRequired) {
        return res.status(403).json({ error: 'Access denied for this role' });
      }

      // Attach role info to request for downstream routes
      req.role = role.role_type;            // 'faculty' or 'department'
      req.department = role.department_name || null; // department if department role
      req.accessKey = accessKey;

      next();
    } catch (err) {
      console.error('Error validating access key:', err);
      res.status(500).json({ error: 'Server error during key validation' });
    }
  };
};
