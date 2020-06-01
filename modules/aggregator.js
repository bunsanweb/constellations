import * as BResource from "./modules/bresource/modules/bresource.js";
import * as Stardust from "./modules/stardust.js";


export const AggregateEvent = class extends CustomEvent {};


// NOTE: Aggregator check each starudst-list url
//       - cache stardust urls already acquired
//       - NOTE: aggregator is not manage scheduling
export const Aggregator = class extends EventTarget {
  constructor(listUrl) {
    this.listUrl = listUrl;
    this.cache = new Set();
  }
  
  async aggregate(options = {}) {
    const link = await listLink(this.listUrl, options);
    const collector = Stardust.stardustCollector();
    for await (const stardust of collector(link)) {
      const url = stardust.uri;
      if (this.cache.has(url)) break; // stop, reached to the last end
      //TBD: locator of constellations metadata of stardusts
      const point = stardust.attribute(Stardust.linkPoint); 
      const names = stardust.attribute(Stardust.linkNames);
        
      // TBD: check same point/names values in the stardust document
      //const entity = await stardust.entity();
      //const pointInDoc = entity.doc.querySelector(
      //  "[slot~=constellations-point]").href;
      //const namesInDoc = entity.doc.querySelector(
      //  "[slot~=constellations-names]").textContent;
      
      this.dispatchEvent(
        new AggregateEvent("stardust-arrived", {detail: {url, point, names}}));
    }
  }
};

const listLink = async (linkUrl, options) => {
  const doc = document.implementation.createHTMLDocument("");
  const a = doc.createElement("a");
  a.href = this.listUrl;
  doc.body.append(a);
  const docLink = BResource.documentLink(doc, options);
  const link = (await docLink.links())[0];
  return link;
};
