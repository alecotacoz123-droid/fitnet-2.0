const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TrainingSession = sequelize.define('TrainingSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  exercise_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  repetitions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  duration_seconds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  calories_burned: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  accuracy_percentage: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 100.0,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

module.exports = TrainingSession;
