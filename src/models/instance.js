import Sequelize from 'sequelize';
import debug from 'debug';
import { config } from "../config/config";

const logger = debug( 'Sequelize' );

export const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password, {
    host: config.db.host,
    dialect: 'mysql',
    dialectOptions: config.db.dialectOptions || {},

    pool: {
      max: config.db.max || 100,
      min: config.db.min || 1,
      acquire: config.db.acquire || 30000,
      idle: config.db.idle || 10000
    },

    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },/*

    define: {
      charset: 'utf8mb4',
      dialectOptions: {
        collate: 'utf8mb4_unicode_ci'
      }
    },*/

    logging (context) {
      // logger( '%s', context )
    }
  }
);