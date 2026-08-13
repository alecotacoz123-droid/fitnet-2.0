const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

module.exports = Like;
