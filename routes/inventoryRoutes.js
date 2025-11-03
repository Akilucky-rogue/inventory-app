import express from "express";
import * as inventoryModel from "../models/inventoryModel.js";

const router = express.Router();

// Get all items
router.get("/", async (req, res) => {
  try {
    const [rows] = await inventoryModel.getAllItems();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new item
router.post("/", async (req, res) => {
  try {
    const { name, category, quantity, price } = req.body;
    const result = await inventoryModel.addItem({ name, category, quantity, price });
    res.status(201).json({ id: result.insertId, name, category, quantity, price });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update item
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, price } = req.body;
    await inventoryModel.updateItem(id, { name, category, quantity, price });
    res.json({ message: "Item updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete item
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await inventoryModel.deleteItem(id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
