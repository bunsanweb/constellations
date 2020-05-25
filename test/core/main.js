// NOTE: not test sytle example
import * as Core from "./modules/core.js";

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
      const {url, point, nameSet} = value;
      console.log("[subscribe1]", url); // stardust1,2,3
    }
    reader.releaseLock();
  }
  
  //[subscribe 2: receive with specified names from now]
  const subscribe2 = (async () => {
    // WHATWG ReadableStream
    const stream = core.subscribe({names: ["foo"]});
    //console.log(stream[Symbol.asyncIterator]); // Maybe not yet supported
    
    const reader = stream.getReader();
    for (let i = 0; i < 3; i++) {
      const {value, done} = await reader.read();
      if (done) break;
      const {url, point, nameSet} = value;
      console.log("[subscribe2]", url); // stardust5,6,8
    }
    reader.releaseLock();
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
    
    const reader = stream.getReader();
    for (let i = 0; i < 4; i++) {
      const {value, done} = await reader.read();
      if (done) break;
      const {url, point, nameSet} = value;
      console.log("[subscribe2]", url); // stardust1,2,5,6
    }
    reader.releaseLock();
  }
  
})().catch(console.error);

