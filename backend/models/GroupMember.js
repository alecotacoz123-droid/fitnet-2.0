const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GroupMember = sequelize.define('GroupMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  group_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  },
});

module.exports = GroupMember;
