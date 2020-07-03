//  Clinets => Core <=>|
//                     |=> Strage
//                     |<= Book <= Collectors
//                     |<= Peer
//
import * as Core from "./core.js";
import * as Book from "./book.js";
import * as Storage from "./storage.js";
import * as Peer from "./peer.js";


export const Constellations = class extends EventTarget {
  constructor(options) {
    super();
    this.options = options;
    this.core = new Core.Core();
    this.book = new Book.Book(options);
    this.peer = null;
 
    this.listeners = {};
    // TBD: collect errors as event 
    this.listeners.arrivedCore = ev => {
      const {url, point, names} = ev.detail;
      this.storage.post({url, point, names});
      this.peer.publishLink({url, point, names});
    };
    this.listeners.arrivedBook = ev => {
      const {url, point, names} = ev.detail;
      this.core.publish(url, point, names);
    };
    this.listeners.arrivedPeer = ev => {
      const {url, point, names} = ev.detail;
      this.core.publish(url, point, names);
    };
    this.listeners.collected = ev => {
      const {pageUrl, lastUrl} = ev.detail;
      this.storage.putPage(pageUrl, lastUrl);
    };
    this.listeners.pageAdded = ev => {
      const {pageUrl} = ev.detail;
      this.storage.putPage(pageUrl);
    };
    this.listeners.pageRemoved = ev => {
      const {pageUrl} = ev.detail;
      this.storage.deletePage(pageUrl);
    };
  }
  static async start(node, options = {}) {
    const self = new this(options);
    // restore states
    self.storage = await Storage.Storage.open(options);
    const links = await self.storage.getAll();
    for (const {url, point, names} of links) {
      self.core.publish(url, point, names);
    }
    // restore book states
    const pages = await self.storage.getAllPages();
    for (const {pageUrl, lastUrl} of links) {
      self.book.add(pageUrl, lastUrl);
    }
    
    // start peer
    self.peer = new Peer.Peer(node);

    // connect events
    self.core.addEventListener("stardust-arrived", self.listeners.arrivedCore);
    self.book.addEventListener("stardust-arrived", self.listeners.arrivedBook);
    self.peer.addEventListener("stardust-arrived", self.listeners.arrivedPeer);
    self.book.addEventListener("collected", self.listeners.collected);
    self.book.addEventListener("page-added", self.listeners.pageAdded);
    self.book.addEventListener("page-removed", self.listeners.pageRemoved);
    
    // activate
    await self.peer.start();
    await self.book.start(options.strategy || new Book.RollingStrategy());
    return self;
  }
  async stop() {
    await Promise.all([
      this.book.stop(), this.peer.stop(), this.storage.close()]);
    this.core.removeEventListener(
      "stardust-arrived", this.listeners.arrivedCore);
    this.book.removeEventListener(
      "stardust-arrived", this.listeners.arrivedBook);
    this.peer.removeEventListener(
      "stardust-arrived", this.listeners.arrivedPeer);
    this.book.removeEventListener("collected", this.listeners.collected);
    this.book.removeEventListener("page-added", this.listeners.pageAdded);
    this.book.removeEventListener("page-removed", this.listeners.pageRemoved);
  }

  // for client 
  subscribe(...args) {
    return this.core.subscribe(...args);
  }
  addPage(pageUrl) {
    this.book.add(pageUrl);
  }
  deletePage(pageUrl) {
    this.book.delete(pageUrl);    
  }
};
