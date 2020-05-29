// NOTE: not test sytle example
//import * as Core from "./modules/core.js";
import * as Core from "http://localhost:10000/core.js";

const core = new Core.Core();
//console.log(core);

// constellations core manages stardust url (not Stardust document)
const stardusts = [
  {url: "http://examole.com/stardust1.html",
   point: "http://example.net/target1",
   names: ["foo", "bar"]},
  {url: "http://examole.com/stardust2.html",
   point: "http://example.net/target1",
   names: ["foo"]},
  {url: "http://examole.com/stardust3.html",
   point: "http://example.net/target2",
   names: ["bar"]},
  {url: "http://examole.com/stardust4.html",
   point: "http://example.net/target2",
   names: ["foo", "bar", "buzz"]},
];
const stardusts2 = [
  {url: "http://examole.com/stardust5.html",
   point: "http://example.net/target1",
   names: ["foo", "bar"]},
  {url: "http://examole.com/stardust6.html",
   point: "http://example.net/target1",
   names: ["foo"]},
  {url: "http://examole.com/stardust7.html",
   point: "http://example.net/target2",
   names: ["bar"]},
  {url: "http://examole.com/stardust8.html",
   point: "http://example.net/target2",
   names: ["foo", "bar", "buzz"]},
];

const sameSet = (a, b) => {
  const s1 = new Set(a), s2 = new Set(b);
  if (s1.size !== s2.size) return false;
  for (const e of s1) if (!s2.has(e)) return false;
  return true;
};

(async () => {
  //[publish 0]
  {
    // core.publish(url, point, namses)
    for (const {url, point, names} of stardusts) {
      core.publish(url, point, names);
    }
  }
  
  //[subscribe 1: receive from specified stardust url]
  {
    // WHATWG ReadableStream
    const stream = core.subscribe({}, stardusts[0].url);
    // subscribe all from stardust[0].url
    //console.log(stream[Symbol.asyncIterator]); // Maybe not yet supported

    const reader = stream.getReader();
    for (let i = 0; i < 4; i++) {
      const {value, done} = await reader.read();
      if (done) break;
      const {url, point, names} = value;
      //console.log("[subscribe1]", url); // stardust1,2,3,4
      console.assert(url === stardusts[i].url, `url ${i}`);
      console.assert(point === stardusts[i].point, `point ${i}`);
      console.assert(sameSet(names, stardusts[i].names), `names ${i}`);
    }
    reader.releaseLock();
    await stream.cancel();
  }
  
  //[subscribe 2: receive with specified names from now]
  const subscribe2 = (async () => {
    // WHATWG ReadableStream
    const stream = core.subscribe({names: ["foo"]});
    //console.log(stream[Symbol.asyncIterator]); // Maybe not yet supported

    const expects = stardusts2.filter(s => s.names.includes("foo"));
    const reader = stream.getReader();
    for (let i = 0; i < 3; i++) {
      const {value, done} = await reader.read();
      if (done) break;
      const {url, point, names} = value;
      //console.log("[subscribe2]", url); // stardust5,6,8
      console.assert(url === expects[i].url, `url ${i}`);
      console.assert(point === expects[i].point, `point ${i}`);
      console.assert(sameSet(names, expects[i].names), `names ${i}`);
    }
    reader.releaseLock();
    await stream.cancel();
  })();

  //[publish 1]
  {
    for (const {url, point, names} of stardusts2) {
      core.publish(url, point, names);
    }    
  }
  await subscribe2;

  //[subscribe 3: receive with specified target from specified stardust url]
  {
    const stream = core.subscribe(
      {point: stardusts[0].point}, stardusts[0].url);
    
    const expects = [...stardusts, ...stardusts2].filter(
      s => s.point === stardusts[0].point);
    const reader = stream.getReader();
    for (let i = 0; i < 4; i++) {
      const {value, done} = await reader.read();
      if (done) break;
      const {url, point, names} = value;
      //console.log("[subscribe2]", url); // stardust1,2,5,6
      console.assert(url === expects[i].url, `url ${i}`);
      console.assert(point === expects[i].point, `point ${i}`);
      console.assert(sameSet(names, expects[i].names), `names ${i}`);
    }
    reader.releaseLock();
    await stream.cancel();
  }
  //console.info("[finished]");
  if (typeof window.finish === "function") window.finish();
})().catch(console.error);

