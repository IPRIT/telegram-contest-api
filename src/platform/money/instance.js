import Promise from 'bluebird';
import { SocketManager } from '../../network/socket-manager';
import * as models from '../../models';

export class Money {

  /**
   * @type {Map<number, *>}
   */
  balanceMap = new Map();

  /**
   * @type {*}
   */
  updateInterval = null;

  /**
   * @type {number}
   */
  ticks = 0;

  /**
   * @type {Money}
   * @private
   */
  static _instance = null;

  /**
   * @return {Money}
   */
  static getInstance () {
    if (!this._instance) {
      return ( this._instance = new Money() );
    }
    return this._instance;
  }

  constructor () {
    this.sync()
      .then(_ => this.start());
  }

  start () {
    this.updateInterval = setInterval(_ => this.tick(), 200);
  }

  stop () {
    if (this.updateInterval) {
      clearInterval( this.updateInterval );
      this.updateInterval = null;
    }
  }

  async tick () {
    this.ticks++;
    if (this.ticks % 10 === 0) {
      await this.commit().catch( console.log );
    }
    this.pushAll();
  }

  /**
   * @return {Promise<Money>}
   */
  sync () {
    console.log( '[syncing...]' );
    return models.Money.findAll().map(instance => {
      this.balanceMap.set( instance.userId, { updated: false, instance } );
      return this.balanceMap;
    });
  }

  commit () {
    const promises = [];

    for (let [ userId, object ] of this.balanceMap) {
      if (object.updated) {
        promises.push(
          object.instance.save()
        );
      }
    }

    if (promises.length) {
      console.log( `[commit] elements: ${promises.length}` );
    }

    return Promise.all( promises );
  }

  pushAll () {
    const manager = SocketManager.getManager();
    const updatesBatch = [];

    for (let [ userId, object ] of this.balanceMap) {
      if (object.updated) {
        updatesBatch.push({
          balance: object.instance.balance,
          userId
        });
        object.updated = false;
      }
    }

    if (updatesBatch.length) {
      manager.io.emit('money.update', updatesBatch);
    }
  }

  add (funds = 1, userId) {
    userId = Number( userId );
    funds = Number( funds );

    const object = this.balanceMap.get( userId );

    if (!object) {
      return;
    }

    const { instance } = object;

    instance.balance = parseInt( instance.balance ) + funds;
    object.updated = true;

    console.log( '[Add funds]', `+$${funds} to [id:${userId}]. Balance: $${instance.balance}` );
  }
}