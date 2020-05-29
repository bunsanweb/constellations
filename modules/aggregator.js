import * as BResource from "./modules/bresource/modules/bresource.js";

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
    const collector = stardustCollector();
    for await (const stardust of collector(link)) {
      const url = stardust.uri;
      if (this.cache.has(url)) break; // stop, reached to the last end
      //TBD: locator of constellations metadata of stardusts
      const point = stardust.attribute(
        "[class~=lint-tostardust]{a[slot~=constellations-point]}href#url"
      ).href; 
      const names = stardust.attribute(
        "[class~=lint-tostardust]{a[slot~=constellations-names]}#list");
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

const stardustCollector = () => {
  //NOTE: specification of stardust-link document
  //
  // stardust-list document has div[class~=link-to-stardust] for each link
  // - div[class~=link-to-stardust] contains a[rel~=stardust] for stardust url
  // stardust-list document may have link[rel=~prev] for previous stardust-link
  //
  // these are implemented at stardust-ipfs/modules/list.js
  const stardustCollector = BResource.collector(["a[rel~=stardust]"]);
  const prevCollector = BResource.collector(["link[rel=~prev]"]);
  return BResource.paged(stardustCollector, prevCollector);
};
