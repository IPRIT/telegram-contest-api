import Promise from 'bluebird';
import { getEntries } from './parser/entries-list';
import { createOrUpdateEntries, getOutdatedEntries } from './utils/entries';
import { getIssues } from './parser/issues-list';
import { createOrUpdateIssues } from './utils/issues';

const platformTypes = [
  'js', 'android', 'ios'
];

let lastTickAt = 0;
let tickTimeout = null;
const tickIntervalMs = 5000;

export function run () {
  nextTick();
}

function nextTick () {
  if (tickTimeout) {
    clearTimeout( tickTimeout );
    tickTimeout = null;
  }

  const oldTickAt = lastTickAt;
  const curTimeMs = Date.now();
  const timeRemainingMs = Math.max( 1000, tickIntervalMs - ( curTimeMs - oldTickAt ) );

  tickTimeout = setTimeout( tick, timeRemainingMs );
}

function tick () {
  lastTickAt = Date.now();

  return Promise.resolve( platformTypes ).map(platformType => {
    return getEntries( platformType ).catch( console.log );
  }, { concurrency: 3 }).reduce((globalEntries, entries) => {
    return !entries
      ? globalEntries
      : globalEntries.concat( entries );
  }, []).then(entries => {
    return createOrUpdateEntries( entries );
  }).then(_ => {
    return getOutdatedEntries();
  }).tap(entries => {
    console.log( 'updating entries:', entries.map(v => v.externalId) );
  }).map(outdatedEntry => {
    console.log( 'fetching issues from entry:', outdatedEntry.externalId );
    return getIssues( outdatedEntry );
  }, { concurrency: 20 }).reduce((globalIssues, issues) => {
    return !issues
      ? globalIssues
      : globalIssues.concat( issues );
  }, []).then(issues => {
    return createOrUpdateIssues( issues );
  }).catch( console.log ).finally( nextTick );
}