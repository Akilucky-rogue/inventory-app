const { getPool } = require('../db/db');

async function getAllItems() {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM items ORDER BY id DESC');
  return rows;
}

async function getItemById(id) {
  const pool = await getPool();
  const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
  return rows[0];
}

async function createItem({ name, quantity, price, category }) {
  const pool = await getPool();
  const [result] = await pool.query(
    'INSERT INTO items (name, quantity, price, category, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
    [name, quantity, price, category]
  );
  return { insertId: result.insertId };
}

async function updateItem(id, { name, quantity, price, category }) {
  const pool = await getPool();
  await pool.query(
    'UPDATE items SET name = ?, quantity = ?, price = ?, category = ?, updated_at = NOW() WHERE id = ?',
    [name, quantity, price, category, id]
  );
}

async function deleteItem(id) {
  const pool = await getPool();
  await pool.query('DELETE FROM items WHERE id = ?', [id]);
}

async function getStats() {
  const pool = await getPool();
  const [rows] = await pool.query(`
    SELECT
      COUNT(*) AS total_items,
      SUM(quantity) AS total_quantity,
      ROUND(SUM(quantity * price), 2) AS total_value
    FROM items
  `);
  return rows[0];
}

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getStats
};
