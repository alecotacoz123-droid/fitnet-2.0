require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const { sequelize } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

// Servir la carpeta uploads como estática para ver imágenes y videos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // Desactivar temporalmente las llaves foráneas para SQLite
    await sequelize.query('PRAGMA foreign_keys = OFF');
    
    // Manual alter para evitar el bug de SQLite de Sequelize con 'alter: true' en la tabla users
    try { await sequelize.query('ALTER TABLE fitness_profiles ADD COLUMN current_streak INTEGER DEFAULT 0;'); } catch(e) {}
    try { await sequelize.query('ALTER TABLE fitness_profiles ADD COLUMN max_streak INTEGER DEFAULT 0;'); } catch(e) {}
    try { await sequelize.query('ALTER TABLE fitness_profiles ADD COLUMN total_workouts INTEGER DEFAULT 0;'); } catch(e) {}

    await sequelize.sync(); // Sin alter: true
    await sequelize.query('PRAGMA foreign_keys = ON');
    
    console.log('Database synced successfully');
    app.listen(PORT, () => console.log(`Server on port ${PORT}`));
  } catch (err) {
    console.error('Failed to sync database:', err);
  }
};

startServer();
