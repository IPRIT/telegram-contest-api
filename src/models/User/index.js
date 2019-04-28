import Sequelize from 'sequelize';
import { sequelize } from "../instance";

export const User = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  displayName: {
    type: Sequelize.STRING,
    defaultValue: 'Unfair Cat',
    collate: 'utf8mb4_unicode_ci'
  },
  colorScheme: {
    type: Sequelize.STRING
  },
  displayZoo: {
    type: Sequelize.STRING
  }
}, {
  paranoid: true,
  engine: 'INNODB',
  indexes: [{
    name: 'displayName_index',
    method: 'BTREE',
    fields: [ 'displayName' ]
  }]
});