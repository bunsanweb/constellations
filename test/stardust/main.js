//import * as Stardust from "./modules/stardust.js";
import * as Stardust from "http://localhost:10000/stardust.js";

const store = new Map();
const fakeFetch = async function fetch(req) {
  if (typeof req === "string") req = new Request(req);
  const url = req.url;
  if (!store.has(url)) return new Response("", {
    status: 404, statusText: "Not Found"});

  const text = store.get(url).documentElement.outerHTML;
  const blob = new Blob([text], {type: "text/html;charset=utf-8"});
  const init = {
    headers: {"content-length": blob.size},
  };
  return new Response(blob, init);
};

const eqSet = (a, b) => {
  if (a.length !== b.length) return false;
  const bs = new Set(b);
  return a.every(e => bs.has(e));
}

(async () => {
  // 0. stardust and stardust-page
  const l1url = "http://example.org/l1.html";
  const l1doc = Stardust.newStardustPage();
  store.set(l1url, l1doc);

  const s1url = "http://example.org/s1.html";
  const s1doc = Stardust.newStardust({
    point: "http://example.com/target1", title: "Target 1",
    names: ["foo", "bar"],
  });  
  store.set(s1url, s1doc);
  Stardust.addStardustLink(l1doc, s1url, s1doc);
  
  const s2url = "http://example.org/s2.html";
  const s2doc = Stardust.newStardust({
    point: "http://example.com/target1", title: "Target 1",
    names: ["bar", "buzz"],
  });
  store.set(s2url, s2doc);
  Stardust.addStardustLink(l1doc, s2url, s2doc);
  //console.log(l1doc.documentElement.outerHTML);
  
  // 1. iterate
  const expects = [
    {uri: s2url, point: "http://example.com/target1", names: ["bar", "buzz"]},
    {uri: s1url, point: "http://example.com/target1", names: ["foo", "bar"]},
  ];

  const collector = Stardust.stardustCollector();
  const pageLink1 = await Stardust.stardustPageLink(l1url, {fetch: fakeFetch});
  let index1 = 0;
  for await (const stardust of collector(pageLink1)) {
    const point = stardust.attribute(Stardust.linkPoint)[0].href;
    const names = stardust.attribute(Stardust.linkNames)[0];
    //console.log(stardust.uri, point, names);
    console.assert(stardust.uri === expects[index1].uri, `uri ${index1}`);
    console.assert(point === expects[index1].point, `point ${index1}`);
    console.assert(eqSet(names, expects[index1].names), `names ${index1}`);
    index1++;
  }
  console.assert(index1 === 2, "index1");
  
  // 2. paged
  const l2url = "http://example.org/l2.html";
  const l2doc = Stardust.newStardustPage();
  Stardust.setPrevPage(l2doc, l1url);
  store.set(l2url, l2doc);

  const s3url = "http://example.org/s3.html";
  const s3doc = Stardust.newStardust({
    point: "http://example.com/target2", title: "Target 2",
    names: ["foo", "bar"],
  });  
  store.set(s3url, s3doc);
  Stardust.addStardustLink(l2doc, s3url, s3doc);
  
  const s4url = "http://example.org/s4.html";
  const s4doc = Stardust.newStardust({
    point: "http://example.com/target2", title: "Target 2",
    names: ["bar", "buzz"],
  });
  store.set(s4url, s4doc);
  Stardust.addStardustLink(l2doc, s4url, s4doc);
  //console.log(l2doc.documentElement.outerHTML);

  // 3. iterate
  const expects2 = [
    {uri: s4url, point: "http://example.com/target2", names: ["bar", "buzz"]},
    {uri: s3url, point: "http://example.com/target2", names: ["foo", "bar"]},
    {uri: s2url, point: "http://example.com/target1", names: ["bar", "buzz"]},
    {uri: s1url, point: "http://example.com/target1", names: ["foo", "bar"]},
  ];
  const pageLink2 = await Stardust.stardustPageLink(l2url, {fetch: fakeFetch});
  let index2 = 0;
  for await (const stardust of collector(pageLink2)) {
    const point = stardust.attribute(Stardust.linkPoint)[0].href;
    const names = stardust.attribute(Stardust.linkNames)[0];
    //console.log(stardust.uri, point, names);
    console.assert(stardust.uri === expects2[index2].uri, `uri ${index2}`);
    console.assert(point === expects2[index2].point, `point ${index2}`);
    console.assert(eqSet(names, expects2[index2].names), `names ${index2}`);
    index2++;
  }
  console.assert(index2 === 4, "index2");
  
  if (typeof window.finish === "function" ) window.finish();
})().catch(console.error);
