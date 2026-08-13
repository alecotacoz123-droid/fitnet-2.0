const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Achievement = sequelize.define('Achievement', {
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
  icon_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  trigger_type: {
    type: DataTypes.ENUM('first_workout', 'first_week', 'first_kg_lost', 'ten_workouts', 'consistent_user'),
    allowNull: false,
    unique: true,
  }
});

const UserAchievement = sequelize.define('UserAchievement', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  achievement_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  earned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});

module.exports = { Achievement, UserAchievement };
