const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false, // Who receives the notification
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false, // Who triggered the action
  },
  type: {
    type: DataTypes.ENUM('like', 'comment', 'follow', 'group_join', 'group_approve'),
    allowNull: false,
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  group_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
});

module.exports = Notification;
