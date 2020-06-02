// Book: scheduling aggregators
import {Aggregator} from "./aggregator.js";

export const BookEvent = class extends CustomEvent {};
export const Book = class extends EventTarget {
  constructor(options) {
    super();
    this.options = options;
    this.book = new Map();
    this.listener = ({detail}) => {
      this.dispatchEvent(new BookEvent("stardust-arrived", {detail}));
    };
  }
  
  async start(storategy) {
    this.storategy = storategy;
    await storategy.start(this);
  }
  async stop() {
    await this.storategy.stop(this);
    this.storategy = null;
  }
  
  add(pageUrl) {
    const aggregator = new Aggregator(pageUrl);
    aggregator.addEventListener("stardust-arrived", this.listener);
    
    this.book.set(pageUrl, aggregator);
    if (this.storategy) this.storategy.added(pageUrl);
  }
  delete(pageUrl) {
    if (!this.book.has(pageUrl)) return;
    const aggregator = this.book.get(pageUrl);
    aggregator.removeEventListener("stardust-arrived", this.listener);
    this.book.delete(pageUrl);
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
        for (const [pageUrl, aggregator] of book.book) {
          if (this.active) try {
            await aggregator.aggregate(book.options);
          } catch (error) {
          }
        }
        const end = Date.now();
        if (this.active) await new Promise(
          f => setTimeout(f, Math.max(0, this.minPeriod - (end - start))));
      }
    });
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
