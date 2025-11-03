const express = require('express');
const router = express.Router();
const Model = require('../models/inventoryModel');

router.get('/', async (req, res) => {
  try {
    const items = await Model.getAllItems();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await Model.getStats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Model.getItemById(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, quantity, price, category } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const { insertId } = await Model.createItem({ name, quantity, price, category });
    const newItem = await Model.getItemById(insertId);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, quantity, price, category } = req.body;
    await Model.updateItem(req.params.id, { name, quantity, price, category });
    const updated = await Model.getItemById(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Model.deleteItem(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
