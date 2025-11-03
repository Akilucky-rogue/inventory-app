import pool from "../db/db.js";

// Get all items
export async function getAllItems() {
  return pool.query("SELECT * FROM items ORDER BY id DESC");
}

// Add item
export async function addItem(item) {
  const { name, category, quantity, price } = item;
  return pool.query(
    "INSERT INTO items (name, category, quantity, price) VALUES (?, ?, ?, ?)",
    [name, category, quantity, price]
  );
}

// Update item
export async function updateItem(id, item) {
  const { name, category, quantity, price } = item;
  return pool.query(
    "UPDATE items SET name = ?, category = ?, quantity = ?, price = ? WHERE id = ?",
    [name, category, quantity, price, id]
  );
}

// Delete item
export async function deleteItem(id) {
  return pool.query("DELETE FROM items WHERE id = ?", [id]);
}
