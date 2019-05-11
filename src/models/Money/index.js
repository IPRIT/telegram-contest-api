import Sequelize from 'sequelize';
import { sequelize } from "../instance";

export const Money = sequelize.define('Money', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  balance: {
    type: Sequelize.BIGINT( 16 ),
    defaultValue: 0
  }
}, {
  paranoid: false,
  engine: 'INNODB'
});