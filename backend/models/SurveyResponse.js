const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SurveyResponse = sequelize.define('SurveyResponse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true // One response per user
  },
  q1_accompaniment: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  q2_adherence: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  q3_usability: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  q4_timbio_conn: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  q5_general_satisfaction: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'survey_responses',
  underscored: true
});

module.exports = SurveyResponse;
