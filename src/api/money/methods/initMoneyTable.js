import Promise from 'bluebird';
import Sequelize from 'sequelize';

import * as models from '../../../models';
import { ensureNumber, ensureString, wrapRequest } from "../../../utils";

const isProduction = process.env.NODE_ENV === 'production';
const Op = Sequelize.Op;

/**
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @return {Promise<any>}
 */
export function initMoneyTableRequest (req, res, next) {
  return wrapRequest( initMoneyTable, req, res, next );
}

/**
 * @param {*} params
 * @return {Promise<any>|*}
 */
export async function initMoneyTable (params) {
  return models.User.findAll({
    where: {
      displayZoo: {
        [Op.not]: null
      },
      displayName: {
        [Op.and]: {
          [Op.notLike]: 'Fair %',
          [Op.ne]: 'Groovy Puma'
        }
      }
    }
  }).map(user => {
    return models.Money.findOrCreate({
      where: {
        userId: user.id
      },
      defaults: {
        userId: user.id
      }
    })
  });
}