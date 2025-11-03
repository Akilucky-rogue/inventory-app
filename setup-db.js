import pool from "./db/db.js";

(async () => {
  try {
    console.log("🔗 Connecting to MySQL...");

    // Create table if it doesn’t exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        quantity INT DEFAULT 0,
        price DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableQuery);
    console.log("✅ Table 'items' created or already exists.");

    // Optional: insert demo data if table empty
    const [rows] = await pool.query("SELECT COUNT(*) AS count FROM items;");
    if (rows[0].count === 0) {
      console.log("🌱 Seeding initial data...");
      await pool.query(`
        INSERT INTO items (name, category, quantity, price)
        VALUES 
          ('Notebook', 'Stationery', 50, 45.00),
          ('Pen', 'Stationery', 120, 10.00),
          ('Pencil', 'Stationery', 100, 5.00),
          ('Marker', 'Office', 30, 35.00);
      `);
      console.log("✅ Seed data inserted.");
    } else {
      console.log("ℹ️ Table already has data — skipping seed.");
    }

    console.log("🎉 Setup complete! Your app is ready to use.");
  } catch (err) {
    console.error("❌ Setup error:", err);
  } finally {
    process.exit();
  }
})();
