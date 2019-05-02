import Promise from 'bluebird';
import * as models from '../../models';
import { findOrCreateUser } from './users';
import { TIME_PERIODS } from '../../utils';

const entriesMap = new Map();

export function createOrUpdateEntries (entries) {
  return Promise.resolve( entries ).map(async entryObject => {
    let cache = null;
    let created = false;
    let entry = null;

    if (entriesMap.has( entryObject.externalId )) {
      cache = entriesMap.get( entryObject.externalId );
      entry = cache.entry;
    } else {
      [ entry, created ] = await findOrCreateEntry( entryObject );
      const nextForceUpdateAfter = getNextUpdateTime();

      cache = {
        update: false,
        entry,
        nextForceUpdateAfter
      };

      entriesMap.set( entry.externalId, cache );
    }

    const curTimeMs = Date.now();
    const updateNeeded = created
      || entry.issuesNumber !== entryObject.issuesNumber
      || curTimeMs >= cache.nextForceUpdateAfter;

    cache.update = updateNeeded;

    if (updateNeeded) {
      cache.nextForceUpdateAfter = getNextUpdateTime();
    }

    // if rating or issues number are updated
    if (entry.rating !== entryObject.rating
      || entry.issuesNumber !== entryObject.issuesNumber) {
      await entry.update({
        rating: entryObject.rating,
        issuesNumber: entryObject.issuesNumber
      });
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
  const readyEntry = {
    externalId: entryObject.externalId,
    platformType: entryObject.platformType,
    rating: entryObject.rating,
    issuesNumber: entryObject.issuesNumber
  };

  const [ entry, created ] = await models.Entry.findOrCreate({
    where: {
      externalId: entryObject.externalId
    },
    defaults: readyEntry
  });

  if (entryObject.user && !entry.userId) {
    const user = await findOrCreateUser( entryObject.user );
    await entry.setUser( user );
  }

  return [ entry, created ];
}

/**
 * @return {number}
 */
function getNextUpdateTime () {
  return Date.now() + TIME_PERIODS.minute * 3 + TIME_PERIODS.minute * 10 * Math.random();
}