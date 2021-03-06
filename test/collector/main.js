//import * as Collector from "./modules/collector.js";
//import * as Stardust from "./modules/stardust.js";
import * as Collector from "http://localhost:10000/collector.js";
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
  // stardust and stardust-page
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
  
  // aggregator
  const expects = [
    {url: s1url, point: "http://example.com/target1", names: ["foo", "bar"]},
    {url: s2url, point: "http://example.com/target1", names: ["bar", "buzz"]},
  ];
  let index = 0;
  const collector = new Collector.Collector(l1url);
  collector.addEventListener("stardust-arrived", ev => {
    const {url, point, names} = ev.detail;
    //console.log(url, point, names);
    console.assert(url === expects[index].url, `uri ${index}`);
    console.assert(point === expects[index].point, `point ${index}`);
    console.assert(eqSet(names, expects[index].names), `names ${index}`);
    index++;
  });
  
  await collector.collect({fetch: fakeFetch});

  //console.log("[finished]");
  if (typeof window.finish === "function" ) window.finish();
})().catch(console.error);
