import Sequelize from 'sequelize';
import { sequelize } from "../instance";

export const Entry = sequelize.define('Entry', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  externalId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  platformType: {
    type: Sequelize.ENUM('js', 'android', 'ios'),
    allowNull: false
  },
  rating: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  issuesNumber: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
}, {
  paranoid: true,
  engine: 'INNODB',
  indexes: [{
    name: 'platformType_index',
    method: 'BTREE',
    fields: [ 'platformType' ]
  }, {
    name: 'externalId_index',
    method: 'BTREE',
    fields: [ 'externalId' ]
  }]
});