import Socket from 'socket.io';
import { SocketEvents } from "./socket-events";
import { config } from '../config/config';

export class SocketManager {

  /**
   * @type {*}
   * @private
   */
  _io = null;

  /**
   * @type {SocketManager}
   * @private
   */
  static _instance = null;

  /**
   * @return {SocketManager}
   */
  static getManager () {
    if (this._instance) {
      return this._instance;
    }
    return ( this._instance = new SocketManager() );
  }

  /**
   * @param {Server} server
   */
  initialize (server) {
    this._io = Socket( server, config.socket );
    this._io.on( 'connection', socket => this._onConnection( socket ) );
  }

  /**
   * @return {boolean}
   */
  get isInitialized () {
    return !!this._io;
  }

  /**
   * @param {Socket} socket
   * @private
   */
  _onConnection (socket) {
    return this._addOrRepairPlayer( socket ).catch(error => {
      socket.emit( SocketEvents.SYSTEM_ERROR, error.message );
    });
  }

  /**
   * @param {Socket} socket
   * @returns {Player}
   * @private
   */
  async _addOrRepairPlayer (socket) {
    /**
     * @var {Session} userSession
     */
    const userSession = socket.userSession;
    const userId = userSession.User.id;

    const players = Players.getPlayers();

    if (players.hasPlayer( userId )) {
      players.repairPlayer( userId, socket, userSession );
    } else {
      const player = new Player( socket, userSession );
      players.addPlayer( player );
    }

    const player = players.getPlayer( userId );

    if (!player.isCharacterSelected && player.isConnected) {
      player.selectCharacter();
    }

    return player;
  }
}