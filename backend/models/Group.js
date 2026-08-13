const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  creator_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false, // e.g. Cardio, Fuerza, Nutrición, Yoga
  },
});

module.exports = Group;
