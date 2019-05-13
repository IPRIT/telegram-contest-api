import * as account from '../account';

/**
 * @param platformType
 * @return {*}
 */
export function getEntries (platformType) {
  const pathTo = `/${getPlatformKey( platformType )}`;
  return account.getPage( pathTo, { mode: 'all' } ).then($ => {
    const $entries = $( '.cd-entry' );
    const $items = [];
    for (let i = 0, len = $entries.length; i < len; ++i) {
      $items.push( $entries.eq( i ) );
    }
    return $items;
  }).mapSeries($entry => {
    return extractEntry( $entry, platformType );
  });
}

/**
 * @param {*} $entry
 * @param {string} platformType
 * @return {{rating: number, externalId: number, issuesNumber: number, user: {displayZoo: string, displayName: string, colorScheme: string}}}
 */
export function extractEntry ($entry, platformType) {
  const href = $entry.attr( 'href' ) || '';
  const id = parseInt( href.match( /entry(\d+)/i )[1] );
  const userName = $entry.find( '.cd-author' ).text().trim();
  const userTcClass = $entry.find( '.cd-author' ).find( 'span' ).eq(0).attr( 'class' );

  const animalClasses = $entry.find( '.cd-entry-photo' ).find( '.animal-photo' ).attr( 'class' ).split( ' ' );
  const zooClass = animalClasses.find(className => className !== 'animal-photo' && !className.startsWith( 'bc' ));
  const userBcClass = animalClasses.find(className => className.startsWith( 'bc' ));

  const labelText = $entry.find( '.cd-entry-label' ).text();
  const issuesNumberRegex = /^(\d+)/i;
  const issuesNumber = parseInt( labelText.match( issuesNumberRegex )[1] );

  const rating = parseInt( $entry.find( '.cd-entry-rating' ).text() );

  return {
    platformType,
    externalId: id,
    issuesNumber,
    rating,
    user: {
      displayName: userName,
      colorScheme: [ userTcClass, userBcClass ].join( '|' ),
      displayZoo: zooClass
    }
  };
}

/**
 * @param {string} platformType
 * @return {string}
 */
export function getPlatformKey (platformType) {
  return `chart-${platformType}`;
}