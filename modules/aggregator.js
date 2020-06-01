import * as Stardust from "./stardust.js";


export const AggregateEvent = class extends CustomEvent {};


// NOTE: Aggregator check each starudst-page url
//       - cache stardust urls already acquired
//       - NOTE: aggregator is not manage scheduling
export const Aggregator = class extends EventTarget {
  constructor(pageUrl) {
    super();
    this.pageUrl = pageUrl;
    this.cache = new Set();
  }
  
  async aggregate(options = {}) {
    const link = await Stardust.stardustPageLink(this.pageUrl, options);
    const collector = Stardust.stardustCollector();
    const ordered = [];
    for await (const stardust of collector(link)) {
      const url = stardust.uri;
      if (this.cache.has(url)) break; // stop, reached to the last end
      //TBD: locator of constellations metadata of stardusts
      const point = stardust.attribute(Stardust.linkPoint)[0].href; 
      const names = stardust.attribute(Stardust.linkNames)[0];
      
      // TBD: check same point/names values in the stardust document
      //const entity = await stardust.entity();
      // ...
      ordered.unshift({url, point, names}); // reversed order
      this.cache.add(url);
    }
    for (const detail of ordered) {
      this.dispatchEvent(new AggregateEvent("stardust-arrived", {detail}));
    }
  }
};
