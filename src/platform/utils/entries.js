import Promise from 'bluebird';
import * as models from '../../models';
import { findOrCreateUser } from './users';

const entriesMap = new Map();

export function createOrUpdateEntries (entries) {
  return Promise.resolve( entries ).map(async entryObject => {
    let cache = null;
    let forceUpdate = false;
    let entry = null;

    if (entriesMap.has( entryObject.externalId )) {
      cache = entriesMap.get( entryObject.externalId );
      entry = cache.entry;
    } else {
      [ entry, forceUpdate ] = await findOrCreateEntry( entryObject );
      cache = { update: true, entry };
      entriesMap.set( entry.externalId, cache );
    }

    if (entry.rating !== entryObject.rating
      || entry.issuesNumber !== entryObject.issuesNumber) {

      if (entry.issuesNumber !== entryObject.issuesNumber) {
        cache.update = true;
      }

      await entry.update({
        rating: entryObject.rating,
        issuesNumber: entryObject.issuesNumber
      });
    } else {
      cache.update = forceUpdate;
    }

    return entry;
  });
}

/**
 * @return {Entry[]}
 */
export function getOutdatedEntries (forceUpdate = false) {
  return [ ...entriesMap.values() ].filter(cache => {
    return cache.update || forceUpdate;
  }).map(cache => cache.entry);
}

/**
 * @param entryObject
 * @return {Promise<*[]>}
 */
export async function findOrCreateEntry (entryObject) {
  const [ entry, created ] = await models.Entry.findOrCreate({
    where: {
      externalId: entryObject.externalId
    },
    defaults: {
      externalId: entryObject.externalId,
      platformType: entryObject.platformType,
      rating: entryObject.rating,
      issuesNumber: entryObject.issuesNumber
    }
  });

  if (entryObject.user && !entry.userId) {
    const user = await findOrCreateUser( entryObject.user );
    await entry.setUser( user );
  }

  return [ entry, created ];
}