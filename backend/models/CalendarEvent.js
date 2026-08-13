const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CalendarEvent = sequelize.define('CalendarEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  exercises: {
    type: DataTypes.TEXT, // Store JSON string of exercises
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'missed', 'rest'),
    defaultValue: 'pending'
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  calories_burned: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'calendar_events',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'date'] // Un usuario solo puede tener un plan activo por día
    }
  ]
});

module.exports = CalendarEvent;
