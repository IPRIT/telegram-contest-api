import Socket from 'socket.io';
import { config } from '../config/config';
import { Money } from '../platform/money';

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
   * @return {*}
   */
  get io () {
    return this._io;
  }

  /**
   * @param {Socket} socket
   * @private
   */
  _onConnection (socket) {
    console.log( 'connected', socket.id );

    const money = Money.getInstance();
    socket.on('money.addFunds', ev => {
      money.add( 100, ev );
    });
  }
}