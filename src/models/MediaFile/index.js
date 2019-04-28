import Sequelize from 'sequelize';
import { sequelize } from "../instance";

export const MediaFile = sequelize.define('MediaFile', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  type: {
    type: Sequelize.ENUM( 'file', 'image', 'video' ),
    defaultValue: 'file'
  },
  displayName: {
    type: Sequelize.STRING
  },
  displaySize: {
    type: Sequelize.STRING
  },
  src: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  thumbnailSrc: {
    type: Sequelize.TEXT
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