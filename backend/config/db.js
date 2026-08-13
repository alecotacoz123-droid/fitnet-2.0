const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const storagePath = process.env.DB_STORAGE 
  ? path.resolve(__dirname, '..', process.env.DB_STORAGE)
  : path.resolve(__dirname, '..', '../database/fitnet.sqlite');

console.log('Connecting to database at:', storagePath);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false, // Set to console.log if you want to debug SQL queries
  define: {
    timestamps: true,
    underscored: true,
  }
});

module.exports = sequelize;
