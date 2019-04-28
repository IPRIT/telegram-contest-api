import Sequelize from 'sequelize';
import { sequelize } from "../instance";

export const Issue = sequelize.define('Issue', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  externalId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  displayMessage: {
    type: Sequelize.TEXT,
    defaultValue: '(message encrypted)'
  },
  displayDevice: {
    type: Sequelize.STRING
  },
  rating: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
}, {
  paranoid: true,
  engine: 'INNODB',
  indexes: [{
    name: 'externalId_index',
    method: 'BTREE',
    fields: [ 'externalId' ]
  }]
});