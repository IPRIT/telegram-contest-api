import Promise from 'bluebird';
import Sequelize from 'sequelize';

import * as models from '../../../models';
import { ensureNumber, ensureString, wrapRequest } from "../../../utils";
import { Money } from '../../../platform/money';

const isProduction = process.env.NODE_ENV === 'production';
const Op = Sequelize.Op;

/**
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @return {Promise<any>}
 */
export function getTableRequest (req, res, next) {
  return wrapRequest( getTable, req, res, next );
}

/**
 * @param {*} params
 * @return {Promise<any>|*}
 */
export async function getTable (params) {
  const money = Money.getInstance();
  const mapping = money.balanceMap;

  return models.Money.findAll({
    include: [{
      model: models.User
    }],
    order: [
      [ 'balance', 'DESC' ]
    ],
  }).map(money => {
    const { instance } = mapping.get( money.userId ) || {};
    money.balance = Number( instance && instance.balance || money.balance );
    return money;
  })
}