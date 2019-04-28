import * as account from '../account';
import { getPlatformKey } from './entries-list';
import { shortMonths } from '../../utils';

/**
 * @param entry
 * @return {*}
 */
export function getIssues (entry) {
  const pathTo = `/${getPlatformKey( entry.platformType )}/entry${entry.externalId}`;

  return account.getPage( pathTo, { sort: 'date' } ).then($ => {
    const $issues = $( '.cd-issue' );
    const $items = [];
    for (let i = 0, len = $issues.length; i < len; ++i) {
      $items.push( $issues.eq( i ) );
    }
    return $items;
  }).mapSeries($issue => {
    const issue = extractIssue( $issue );

    Object.assign(issue, {
      entryId: entry.id
    });

    return issue;
  });
}

/**
 * @param $issue
 * @param isReply
 * @return {{displayMessage: *, displayDevice: *, rating: number, externalId: number, files: Array, reply: *, user: {displayZoo: string, displayName: string, photo: {src, displayName, type}, colorScheme: string}}}
 */
export function extractIssue ($issue, isReply = false) {
  let externalId = null;

  const $buttons = $issue.find( '.cd-issue-voting-buttons' ).eq(0);
  if ($buttons.length) {
    externalId = parseInt( $buttons.eq( 0 ).attr( 'data-issue-id' ) );
  }

  const displayMessage = $issue.find( '.cd-issue-text' ).eq(0).html();
  const displayDevice = $issue.find( '.cd-issue-device' ).eq(0).text();
  const rating = parseInt( $issue.find( '.cd-issue-like' ).eq(0).text() || '0' );

  const curDate = new Date();
  const dateText = $issue.find( '.cd-issue-date' ).eq(0).text().trim();
  const dateParts = dateText.split( ' ' );
  const monthText = dateParts[ 0 ];
  const dateNumber = parseInt( dateParts[ 1 ] );
  const timeText = dateParts[ 3 ];
  const timeParts = timeText.split( ':' );
  const hoursNumber = parseInt( timeParts[ 0 ] ) - curDate.getTimezoneOffset() / 60;
  const minutesNumber = parseInt( timeParts[ 1 ] );
  const curYear = curDate.getFullYear();
  const monthsIndex = shortMonths.indexOf( monthText );

  const createdAt = new Date( curYear, monthsIndex, dateNumber, hoursNumber, minutesNumber );

  const $files = $issue.find( '.cd-issue-files' ).eq(0).find( '.cd-issue-file' );

  const files = extractFiles( $files );
  const user = extractUser( $issue );
  let reply = null;

  if (!isReply) {
    const $reply = $issue.find( '.cd-issue-reply' );
    if ($reply.length) {
      reply = extractReply( $reply );
      Object.assign(reply, { externalId });
    }
  }

  return {
    externalId,
    displayMessage,
    displayDevice,
    rating,
    createdAt,
    files,
    user,
    reply
  };
}

/**
 * @param $reply
 * @return {*}
 */
export function extractReply ($reply) {
  return extractIssue( $reply, true );
}

/**
 * @param $files
 * @return {Array}
 */
export function extractFiles ($files) {
  const files = [];

  for (let i = 0; i < $files.length; ++i) {
    files.push(
      extractFile( $files.eq( i ) )
    );
  }

  return files;
}

/**
 * @param $file
 * @return {{thumbnailSrc: string, src: string, displayName: string, type: string, displaySize: string}}
 */
export function extractFile ($file) {
  let thumbResult = {};

  const src = $file.attr( 'href' );

  const thumbnailSrcStyle = $file.find( '.cd-issue-file-thumb' ).attr( 'style' );
  if (thumbnailSrcStyle) {
    const thumbRegex = /url\(['"](.+)['"]\)/i;
    thumbResult.thumbnailSrc = thumbnailSrcStyle.match( thumbRegex )[ 1 ];
  }

  const displayName = $file.find( '.cd-issue-file-title' ).attr( 'title' ).trim();
  const ext = $file.find( '.cd-issue-file-title > .ext' ).text();
  const type = detectFileType( ext );

  const displaySize = $file.find( '.cd-issue-file-label' ).text();

  return {
    type,
    displayName,
    displaySize,
    src,
    ...thumbResult
  };
}

/**
 * @param $issue
 * @return {{displayZoo: string, displayName: string, photo: {src, displayName, type}, colorScheme: string}}
 */
export function extractUser ($issue) {
  const displayName = $issue.find( '.cd-issue-author-name' ).eq(0).text().trim();

  let zooResult = {};
  const hasAnimal = $issue.find( '.cd-issue-photo' ).eq(0).find( '.animal-photo' ).length > 0;

  if (hasAnimal) {
    const animalClasses = $issue.find( '.cd-issue-photo' ).eq(0).find( '.animal-photo' ).attr( 'class' ).split( ' ' );
    const displayZoo = animalClasses.find(className => className !== 'animal-photo' && !className.startsWith( 'bc' ));
    const userBcClass = animalClasses.find(className => className.startsWith( 'bc' ));
    const userTcClass = $issue.find( '.cd-issue-author-name' ).eq(0).find( 'span' ).eq(0).attr( 'class' );
    const colorScheme = [ userTcClass, userBcClass ].join( '|' );

    Object.assign(zooResult, {
      displayZoo,
      colorScheme
    });
  }

  const $photo = $issue.find( '.cd-issue-photo' ).eq(0);
  const userPhoto = extractUserPhoto( $photo, displayName );

  return {
    displayName,
    photo: userPhoto,
    ...zooResult
  };
}

/**
 * @param $photo
 * @param {string} displayName
 * @return {*}
 */
export function extractUserPhoto ($photo, displayName) {
  if (!$photo) {
    return null;
  }
  const $img = $photo.find( 'img' );
  if (!$img.length) {
    return null;
  }

  const src = $img.attr( 'src' );

  return {
    type: 'image',
    displayName,
    src
  };
}

/**
 * @param {string} ext
 * @return {string}
 */
export function detectFileType (ext) {
  if (!ext) {
    return 'file';
  }

  ext = ext.startsWith( '.' )
    ? ext.substr( 1 )
    : ext;

  ext = ext.toLowerCase();

  const imageExts = [ 'jpg', 'webp', 'jpeg', 'png', 'gif', 'svg' ];
  const videoExts = [ 'mp4', 'avi' ];
  if (imageExts.includes( ext )) {
    return 'image';
  } else if (videoExts.includes( ext )) {
    return 'video';
  } else {
    return 'file';
  }
}