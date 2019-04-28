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
export function getIssuesRequest (req, res, next) {
  return wrapRequest( getIssues, req, res, next );
}

/**
 * @param {*} params
 * @return {Promise<any>|*}
 */
export async function getIssues (params) {
  let {
    offset = 0,
    limit = 50,
    entryIds
  } = params;

  offset = Math.max(0, ensureNumber( offset ));
  limit = Math.max(0, Math.min( 100, ensureNumber( limit ) ));

  const where = {};

  if (entryIds) {
    entryIds = ensureString( entryIds ).split( ',' ).map(entryId => {
      return parseInt( entryId.trim() );
    }).filter(v => !!v);

    const entries = await models.Entry.findAll({
      where: {
        externalId: {
          [Op.in]: entryIds
        }
      }
    });

    Object.assign(where, {
      entryId: {
        [Op.in]: entries.map(e => e.id)
      }
    });
  }

  const issues = models.Issue.findAll({
    where,
    order: [
      [ 'createdAt', 'DESC' ]
    ],
    offset, limit,
    include: [
      models.MediaFile, /*{
        model: models.Issue,
        as: 'ParentIssue',
        required: false,
        where: {
          parentIssueId: Sequelize.col( 'Issue.id' )
        }
      },*/ {
        model: models.User,
        as: 'Author',
        required: true,
        include: [{
          model: models.MediaFile,
          as: 'Photo',
          required: false
        }]
      }, {
        model: models.Entry,
        attributes: [ 'platformType', 'externalId' ]
      }
    ]
  });

  return issues;
}