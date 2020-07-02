// Book: scheduling collectors
import {Collector} from "./collector.js";

export const BookEvent = class extends CustomEvent {};
export const Book = class extends EventTarget {
  constructor(options) {
    super();
    this.options = options;
    this.book = new Map();
    this.listener = ({type, detail}) => {
      this.dispatchEvent(new BookEvent(type, {detail}));
    };
  }
  
  async start(strategy) {
    this.strategy = strategy;
    await strategy.start(this);
  }
  async stop() {
    await this.strategy.stop(this);
    this.strategy = null;
  }
  
  add(pageUrl, lastUrl = undefined) {
    const collector = new Collector(pageUrl, lastUrl);
    collector.addEventListener("stardust-arrived", this.listener);
    collector.addEventListener("collected", this.listener);
    this.book.set(pageUrl, collector);
    this.dispatchEvent(new BookEvent("page-added", {detail: {pageUrl}}));
    if (this.storategy) this.storategy.added(pageUrl);
  }
  delete(pageUrl) {
    if (!this.book.has(pageUrl)) return;
    const collector = this.book.get(pageUrl);
    collector.removeEventListener("stardust-arrived", this.listener);
    collector.removeEventListener("collected", this.listener);
    this.book.delete(pageUrl);
    this.dispatchEvent(new BookEvent("page-removed", {detail: {pageUrl}}));
    if (this.storategy) this.storategy.deleted(pageUrl);
  }
};

// rolling access storategy
export const RollingStrategy = class {
  constructor(minPeriod = 60 * 1000) {
    this.minPeriod = minPeriod;
  }
  async start(book) {
    this.active = true;
    this.promise = (async () => {
      while (this.active) {
        const start = Date.now();
        for (const [pageUrl, collector] of book.book) {
          if (this.active) try {
            await collector.collect(book.options);
          } catch (error) {
          }
        }
        const end = Date.now();
        if (this.active) await new Promise(
          f => setTimeout(f, Math.max(0, this.minPeriod - (end - start))));
      }
    })();
  }
  async stop(book) {
    this.active = false;
    await this.promise;
  }
  added(pageUrl) {}
  deleted(pageUrl) {}
};

// TBD: 
const PallarelStorategy = class {
  constructor(minPeriod = 60 * 1000) {
    this.minPeriod = minPeriod;
  }
  async start() {
    
  }
  async stop() {
    
  }
  added(pageUrl) {}
  deleted(pageUrl) {}  
};
