const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profile_picture: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}, // e.g. training goals, dietary preference
  },
  role: {
    type: DataTypes.ENUM('user', 'trainer', 'admin'),
    defaultValue: 'user',
    allowNull: false,
  },
});

module.exports = User;
