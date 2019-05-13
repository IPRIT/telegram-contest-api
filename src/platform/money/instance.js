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
    this.updateInterval = setInterval(_ => this.tick(), 100);
  }

  stop () {
    if (this.updateInterval) {
      clearInterval( this.updateInterval );
      this.updateInterval = null;
    }
  }

  async tick () {
    this.commit()
      .then(_ => this.pushAll())
      .catch( console.log );
  }

  /**
   * @return {Promise<Money>}
   */
  sync () {
    console.log( '[syncing...]' );
    return models.Money.findAll().map(instance => {
      this.balanceMap.set( instance.userId, { updated: false, instance, lastDepositAt: Date.now() } );
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

    let sum = 0;

    for (let [ userId, object ] of this.balanceMap) {
      if (object.updated) {
        updatesBatch.push({
          balance: object.instance.balance,
          userId
        });
        object.updated = false;
      }
      sum += object.instance.balance;
    }

    if (updatesBatch.length) {
      manager.io.emit('money.update', updatesBatch);
      manager.io.emit('money.setPrizePool', sum);
    }
  }

  add (funds = 1, userId) {
    userId = Number( userId );
    funds = Number( funds );

    const object = this.balanceMap.get( userId );

    if (!object) {
      return;
    }

    const curTimeMs = Date.now();
    const lastDepositMs = object.lastDepositAt || 0;
    const timeoutMs = 15;

    if (lastDepositMs + timeoutMs > curTimeMs) {
      return;
    }

    const { instance } = object;

    instance.balance = parseInt( instance.balance ) + funds;
    object.updated = true;
    object.lastDepositAt = curTimeMs;

    // console.log( '[Add funds]', `+$${funds} to [id:${userId}]. Balance: $${instance.balance}` );
  }
}