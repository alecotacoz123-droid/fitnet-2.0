const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FitnessProfile = sequelize.define('FitnessProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true, // 1:1 relationship
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false,
  },
  weight_kg: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  height_cm: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  activity_level: {
    type: DataTypes.ENUM('sedentary', 'lightly_active', 'moderately_active', 'very_active'),
    allowNull: false,
  },
  goal: {
    type: DataTypes.ENUM('lose_weight', 'build_muscle', 'maintain_weight', 'improve_fitness'),
    allowNull: false,
  },
  training_location: {
    type: DataTypes.ENUM('home', 'gym', 'park'),
    allowNull: false,
  },
  available_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
  },
  physical_restrictions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  calculated_bmi: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  calculated_tdee: {
    type: DataTypes.INTEGER, // Total Daily Energy Expenditure (Calories)
    allowNull: true,
  },
  current_streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  max_streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  total_workouts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
});

module.exports = FitnessProfile;
