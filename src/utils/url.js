import { BASE_DOMAIN } from './constants';

/**
 * @param {string} pathTo
 * @return {string}
 */
export function getURL (pathTo) {
  if (!pathTo.startsWith( '/' )) {
    pathTo = '/' + pathTo;
  }
  return `https://${BASE_DOMAIN}${pathTo}`;
}