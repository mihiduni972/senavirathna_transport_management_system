const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database load කරනවා
const db = require('./db/database');
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Senavirathna Transport Backend Running...' });
});

// Server start කරනවා
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


const hiresRoutes = require('./routes/hires');
const fuelRoutes = require('./routes/fuel');
const expensesRoutes = require('./routes/expenses');

app.use('/api/hires', hiresRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/expenses', expensesRoutes);

const summaryRoutes = require('./routes/summary');
app.use('/api/summary', summaryRoutes);

const routesRoutes = require('./routes/routes');
const callsRoutes = require('./routes/calls');

app.use('/api/routes', routesRoutes);
app.use('/api/calls', callsRoutes);

const vehiclesRoutes = require('./routes/vehicles');
app.use('/api/vehicles', vehiclesRoutes);