import pool from "./db/db.js";

(async () => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS current_time");
    console.log("✅ Connected to MySQL! Current time:", rows[0].current_time);
  } catch (err) {
    console.error("❌ MySQL Connection Error:", err);
  } finally {
    process.exit();
  }
})();
