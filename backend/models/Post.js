const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  media_url: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  media_type: {
    type: DataTypes.ENUM('video', 'image', 'text'),
    defaultValue: 'text',
    allowNull: false,
  },
  ai_tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null, // e.g. { exercise_type: 'Squats', muscle_group: 'Quads', intensity: 'High' }
  },
});

module.exports = Post;
