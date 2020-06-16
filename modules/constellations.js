//  Clinets => Core <=>|
//                     |=> Strage
//                     |<= Book <= Aggregators
//                     |<= Peer
//
import * as Core from "./core.js";
import * as Book from "./core.js";
import * as Storage from "./storage.js";
import * as Peer from "./peer.js";


const Constellations = class {
  constructor(options) {
    super();
    this.options = options;
    this.core = new Core();
    this.book = new Book.Book(options);
    this.storage = new Storage.Storage(options);
    this.peer = null;
  }
  static async start(node, options = {}) {
    const self = new this(options);
    // restore states
    const links = await self.storage.getAll();
    for (const {url, point, names} of links) {
      self.publish(url, point, names);
    }
    //TBD: restore book states

    // start peer
    self.peer = new Peer.Peer(node);

    // connect events
    self.core.addEventListener("stardust-arrived", ev => {
      const {url, point, names} = ev.detail;
      self.storage.post({url, point, names});
      self.peer.publishLink({url, point, names});
    });
    self.book.addEventListener("stardust-arrived", ev => {
      const {url, point, names} = ev.detail;
      self.core.publish(url, point, names);
    });
    self.peer.addEventListener("stardust-arrived", ev => {
      const {url, point, names} = ev.detail;
      self.core.publish(url, point, names);
    });
    
    // activate
    await self.peer.start();
    await self.book.start(options.strategy || Book.RollingStrategy);
  }
  async stop() {
    await Promise.all([this.book.stop(), this.peer.stop()]);
  }

  subscribe(...args) {
    return this.core.subscribe(...args);
  }
};
