const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Challenge = sequelize.define('Challenge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  target_value: {
    type: DataTypes.INTEGER,
    allowNull: false, // e.g. 3 (workouts), 10000 (steps)
  },
  type: {
    type: DataTypes.ENUM('workout_count', 'water_intake', 'steps', 'weight_loss'),
    allowNull: false,
  },
  duration_days: {
    type: DataTypes.INTEGER,
    defaultValue: 7, // Weekly challenge by default
  }
});

const UserChallenge = sequelize.define('UserChallenge', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  challenge_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  current_value: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'failed'),
    defaultValue: 'active',
  },
  started_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  }
});

module.exports = { Challenge, UserChallenge };
