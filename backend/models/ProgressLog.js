const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProgressLog = sequelize.define('ProgressLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  weight_kg: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
});

module.exports = ProgressLog;
