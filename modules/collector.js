import * as Stardust from "./stardust.js";

export const CollectEvent = class extends CustomEvent {};

// NOTE: Collector check each starudst-page url
//       - cache stardust urls already acquired
//       - NOTE: collectors do not manage scheduling
export const Collector = class extends EventTarget {
  constructor(pageUrl, lastUrl) {
    super();
    this.pageUrl = pageUrl;
    this.lastUrl = lastUrl;
  }
  
  async collect(options = {}) {
    const link = await Stardust.stardustPageLink(this.pageUrl, options);
    const collector = Stardust.stardustCollector();
    const ordered = [];
    let lastUrl = null;
    for await (const stardust of collector(link)) {
      const url = stardust.uri;
      if (url === this.lastUrl) break; // stop, reached to the last end
      //TBD: locator of constellations metadata of stardusts
      const point = stardust.attribute(Stardust.linkPoint)[0].href; 
      const names = stardust.attribute(Stardust.linkNames)[0];
      
      // TBD: check same point/names values in the stardust document
      //const entity = await stardust.entity();
      // ...
      ordered.unshift({url, point, names}); // reversed order
      if (!lastUrl) lastUrl = url;
    }
    for (const detail of ordered) {
      this.dispatchEvent(new CollectEvent("stardust-arrived", {detail}));
    }
    if (lastUrl) {
      this.lastUrl = lastUrl;
      const detail = {pageUrl: this.pageUrl, lastUrl};
      this.dispatchEvent(new CollectEvent("collected", {detail}));
    }
  }
};
