import { DataTypes } from 'sequelize';
import sequelize from '../connection.js';
import { Service } from './Service.js';

export const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  guildId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  channelId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('open', 'closed'),
    defaultValue: 'open'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

Ticket.belongsTo(Service);