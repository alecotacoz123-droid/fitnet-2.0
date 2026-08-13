const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true, // Null for anonymous actions (e.g. failed login attempts)
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false, // e.g. 'LOGIN', 'REGISTER', 'CREATE_POST', 'JOIN_GROUP', 'CHATBOT_QUERY'
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = ActivityLog;
