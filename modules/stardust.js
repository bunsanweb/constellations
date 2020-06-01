// Stardust structure for constellations
// 
// [stardust]
// body
//   - article[slot~=stardust]
//     - h1
//       - a[rel~=constellation-point].href#url
//          - span[slot~=constellation-point-title].textContent#string
//     - div[slot~=constellation-names].textContent#list
//     - section* (any embedded elements for each applications)
//  
// [stardust-list]
// head
//   - link[rel~=prev].href#url
// body
//   - article[slot~=stardust-page]
//      - ul
//         - li
//            - div[class~=link-to-stardust]
//               - a[rel~=stardust][slot~=stardust-page-link].href#url
//               - span[slot~=constellation-point-title].textContent#string
//               - div[slot~=constellation-names].textContent#list
//

import * as BResource from "./bresource/modules/bresource.js";
import * as Template from "./stardust-ipfs/modules/template.js";
import * as List from "./stardust-ipfs/modules/list.js";


// stardust doc
export const newStardust = (info, options = {}) => {
  const {point, names = [], title} = info;
  const doc = Template.newStardust(options);
  
  const h1 = doc.createElement("h1");
  const a = doc.createElement("a");
  a.rel = "constellation-point";
  a.href = point;
  const span = doc.createElement("span");
  span.slot = "constellation-point-title";
  span.textContent = title || point;
  a.append(span);
  h1.append(a);
  
  const div = doc.createElement("div");
  div.slot = "constellation-names";
  div.textContent = names.join(" ");
  
  const article = doc.querySelector("article[slot~=stardust]");
  article.append(h1, div);
  
  return doc;
};

// stardust-link doc
export const {newStardustPage, setPrevPage} = List;
export const addStardustLink = (pageDoc, url, stardustDoc) => {
  const slotted = [
    stardustDoc.querySelector("a[rel~=constellation-point]"),
    stardustDoc.querySelector("div[slot~=constellation-names]"),
  ];
  return List.addStardustLink(pageDoc, url, slotted);
};

// BResource collector for iterating stardust links from stardust-list url
export const stardustCollector = () => {
  //NOTE: specification of stardust-link document
  //
  // stardust-list document has div[class~=link-to-stardust] for each link
  // - div[class~=link-to-stardust] contains a[rel~=stardust] for stardust url
  // stardust-list document may have link[rel=~prev] for previous stardust-link
  //
  // these are implemented at stardust-ipfs/modules/list.js
  const stardustCollector = BResource.collector([
    {"rel#list": BResource.some(BResource.oneOf("stardust"))}]);
  const prevCollector = BResource.collector([
    {"rel#list": BResource.some(BResource.oneOf("prev"))}]);
  return BResource.paged(stardustCollector, prevCollector);
};

// BResource attributes: attribute locators for starudts-link doc
export const linkPoint =
  ".link-to-stardust{a[rel~=constellation-point]}href#url";
export const linkNames =
  ".link-to-stardust{[slot~=constellation-names]}#list";

// BResource link object for stardust-page url
export const docImpl = options => options.docimpl ? options.docimpl :
  document.implementation;

export const stardustPageLink = async (pageUrl, options = {}) => {
  const doc = docImpl(options).createHTMLDocument("");
  const a = doc.createElement("a");
  a.href = pageUrl;
  doc.body.append(a);
  const docLink = BResource.documentLink(doc, options);
  return await docLink.links;
};
