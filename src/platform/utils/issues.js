import Promise from 'bluebird';
import * as models from '../../models';
import { createFiles } from './files';
import { findOrCreateUser } from './users';
import { SocketManager } from '../../network/socket-manager';

const issuesMap = new Map();
let handledIssues = 0;
let allIssues = 0;

/**
 * @param {*} issues
 */
export async function createOrUpdateIssues (issues) {
  handledIssues = 0;
  allIssues = issues.length;

  return Promise.resolve( issues ).map(issueObject => {
    return findOrCreateIssue( issueObject );
  }, { concurrency: 1 });
}

export async function findOrCreateIssue (issueObject, parent = null) {
  const issueCacheKey = getIssueCacheKey( issueObject );

  const authorObject = issueObject.user;
  const author = await findOrCreateUser( authorObject );

  let issue = null;
  let created = false;

  if (issuesMap.has( issueCacheKey )) {
    issue = issuesMap.get( issueCacheKey );
  } else {
    [ issue, created ] = await models.Issue.findOrCreate({
      where: {
        externalId: issueObject.externalId,
        authorId: author.id
      },
      defaults: {
        externalId: issueObject.externalId,
        displayMessage: issueObject.displayMessage,
        displayDevice: issueObject.displayDevice,
        rating: issueObject.rating,
        entryId: issueObject.entryId || parent.entryId,
        parentIssueId: parent && parent.id || null,
        createdAt: issueObject.createdAt
      }
    });
    issuesMap.set( issueCacheKey, issue );
  }

  if (created) {
    const socketManager = SocketManager.getManager();
    const fullIssue = await resolveFullIssue( issue );
    socketManager.io.emit( 'issues.update', fullIssue.get({ plain: true }) );
  }

  if (created && issueObject.files.length) {
    const files = await createFiles( issueObject.files );
    await issue.setMediaFiles( files );
  }

  if (issueObject.reply) {
    console.log( 'creating reply:', issueObject.reply.externalId );
    await findOrCreateIssue( issueObject.reply, issue );
  }

  if (!parent) {
    handledIssues++;
    console.log( `Issues progress: \t${( handledIssues / allIssues * 100 ).toFixed( 2 )}%`, '\tIssue external id:', issueObject.externalId );
  }

  return issue;
}

/**
 * @param issueObject
 * @return {string}
 */
function getIssueCacheKey (issueObject) {
  return `${issueObject.externalId}::${issueObject.user.displayName}`;
}

async function resolveFullIssue (issue) {
  return models.Issue.findByPk(issue.id, {
    include: [
      models.MediaFile, {
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
}