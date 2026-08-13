const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Follower = sequelize.define('Follower', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  follower_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  following_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

module.exports = Follower;
