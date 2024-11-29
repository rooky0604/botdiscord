import { DataTypes } from 'sequelize';
import sequelize from '../connection.js';

export const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  guildId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  roles: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  ticketTypes: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['guildId', 'number']
    }
  ]
});