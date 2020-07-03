import * as Constellations from "./modules/constellations.js";
import {RollingStrategy} from "./modules/book.js";
import * as Stardust from "./modules/stardust.js";
import {ready} from "./modules/storage.js";

import "https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js";

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

const newGate = () => {
  const r = {};
  r.wait = new Promise(f => {
    r.open = f;
  });
  return r;
};


// stardust and stardust-page
const l1url = "http://example.org/l1.html";
const l1doc = Stardust.newStardustPage();
store.set(l1url, l1doc);

const s11url = "http://example.org/s11.html";
const s11doc = Stardust.newStardust({
  point: "http://example.com/target1", title: "Target 1",
  names: ["foo", "bar"],
  });  
store.set(s11url, s11doc);
Stardust.addStardustLink(l1doc, s11url, s11doc);

const s12url = "http://example.org/s12.html";
const s12doc = Stardust.newStardust({
  point: "http://example.com/target1", title: "Target 1",
  names: ["bar", "buzz"],
});
store.set(s12url, s12doc);
Stardust.addStardustLink(l1doc, s12url, s12doc);
//console.log(l1doc.documentElement.outerHTML);
  
const l2url = "http://example.org/l2.html";
const l2doc = Stardust.newStardustPage();
store.set(l2url, l2doc);

const s21url = "http://example.org/s21.html";
const s21doc = Stardust.newStardust({
  point: "http://example.com/target2", title: "Target 2",
  names: ["foo", "bar"],
});  
store.set(s21url, s21doc);
Stardust.addStardustLink(l2doc, s21url, s21doc);

const s22url = "http://example.org/s22.html";
const s22doc = Stardust.newStardust({
  point: "http://example.com/target2", title: "Target 2",
  names: ["bar", "buzz"],
});
store.set(s22url, s22doc);
Stardust.addStardustLink(l2doc, s22url, s22doc);
//console.log(l2doc.documentElement.outerHTML);

const expects = [
  {url: s11url, point: "http://example.com/target1", names: ["foo", "bar"]},
  {url: s12url, point: "http://example.com/target1", names: ["bar", "buzz"]},
  {url: s21url, point: "http://example.com/target2", names: ["foo", "bar"]},
  {url: s22url, point: "http://example.com/target2", names: ["bar", "buzz"]},
];


(async () => {
  console.info(
    "[INFO] IPFS node spawn several logs includes WebSocket Errors");
  
  const node = window.ipfsNode = await Ipfs.create({
    repo: `ipfs-${Math.random()}`,
    relay: {enabled: true, hop: {enabled: true, active: true}},
  });
  //console.debug("IPFS version:", (await node.version()).version);
  const myid = (await node.id()).id;
  //console.debug(`Peer ID:`, myid);

  const dbname = `test-constellations-constellations`;
  await ready(indexedDB.deleteDatabase(dbname));
  const strategy = new RollingStrategy(500);
  const constellations = await Constellations.Constellations.start(
    node, {strategy, dbname, fetch: fakeFetch});
  //TBD: peer.connect
  
  const stream = constellations.subscribe({names: ["foo"]});
  
  constellations.addPage(l1url);
  constellations.addPage(l2url);
  
  const reader = stream.getReader();
  for (let i = 0; i < 2; i++) {
    const {value, done} = await reader.read();
    if (done) break;
    const {url, point, names} = value;
    console.log(url, point, names); //TBD: as assert
  }
  reader.releaseLock();
  
  await constellations.stop();
  await ready(indexedDB.deleteDatabase(dbname));
  
  console.log("[finished]");
  if (typeof window.finish === "function" ) window.finish();
})().catch(console.error);
