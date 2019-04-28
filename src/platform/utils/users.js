import * as models from '../../models';
import { createFile } from './files';

const usersMap = new Map();

/**
 * @param {*} userObject
 * @return {Promise<Entry>}
 */
export async function findOrCreateUser (userObject) {
  let user = null;

  if (usersMap.has( userObject.displayName )) {
    user = usersMap.get( userObject.displayName );
  } else {
    [ user ] = await models.User.findOrCreate({
      where: {
        displayName: userObject.displayName
      },
      defaults: {
        displayName: userObject.displayName,
        colorScheme: userObject.colorScheme,
        displayZoo: userObject.displayZoo,
      }
    });

    usersMap.set( userObject.displayName, user );
  }

  if (userObject.photo && !user.photoId) {
    const photo = await createFile( userObject.photo );
    await user.setPhoto( photo );
  }

  return user;
}