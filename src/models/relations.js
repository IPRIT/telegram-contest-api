import debug from 'debug';
import { sequelize } from "./instance";
import { Entry } from './Entry';
import { User } from './User';
import { Issue } from './Issue';
import { MediaFile } from './MediaFile';
import { Money } from './Money';

const logger = debug( 'Sequelize' );

export function makeRelations () {
  /**
   * Defining relatives between models
   */
  User.hasOne(Entry, { foreignKey: 'userId' });
  Entry.belongsTo(User, { foreignKey: 'userId' });

  User.hasOne(Money, { foreignKey: 'userId' });
  Money.belongsTo(User, { foreignKey: 'userId' });

  User.hasMany(Issue, { foreignKey: 'authorId', as: 'Author' });
  Issue.belongsTo(User, { foreignKey: 'authorId', as: 'Author' });

  Issue.hasOne(Issue, { foreignKey: 'parentIssueId', targetKey: 'id', as: 'ParentIssue', constraints: false });

  Entry.hasMany(Issue, { foreignKey: 'entryId' });
  Issue.belongsTo(Entry, { foreignKey: 'entryId' });

  MediaFile.hasOne(User, { foreignKey: 'photoId', as: "Photo" });
  User.belongsTo(MediaFile, { foreignKey: 'photoId', as: "Photo" });

  Issue.belongsToMany(MediaFile, {
    through: 'IssuesAndFiles',
    foreignKey: 'issueId'
  });

  MediaFile.belongsToMany(Issue, {
    through: 'IssuesAndFiles',
    foreignKey: 'fileId'
  });

  console.log( 'Sequelize: models are syncing...' );
  return sequelize.sync(/**{ force: true }/**/).then(() => {
    console.log( 'Sequelize: models synced!' );
  }).catch( console.error.bind( console, 'Fatal error:' ) );
}