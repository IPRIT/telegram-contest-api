import cleanDeep from 'clean-deep';
import Promise from 'bluebird';
import * as models from '../../models';

export function createFiles (fileObjects) {
  return Promise.resolve( fileObjects ).map(fileObject => {
    return createFile( fileObject );
  });
}

/**
 * @param {*} fileObject
 * @return {Promise<File>}
 */
export async function createFile (fileObject) {
  const file = cleanDeep({
    type: fileObject.type,
    displayName: fileObject.displayName,
    displaySize: fileObject.displaySize,
    src: fileObject.src,
    thumbnailSrc: fileObject.thumbnailSrc
  });

  return models.MediaFile.create( file );
}