import Sequelize from 'sequelize';
import { sequelize } from "../instance";

export const Money = sequelize.define('Money', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  balance: {
    type: Sequelize.DECIMAL( 10, 2 ),
    defaultValue: 0
  }
}, {
  paranoid: false,
  engine: 'INNODB'
});