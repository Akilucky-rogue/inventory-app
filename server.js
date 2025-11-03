require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/api/items', inventoryRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Inventory app running at http://localhost:${PORT}`);
});
