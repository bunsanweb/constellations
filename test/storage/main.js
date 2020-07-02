//import * as Storage from "./modules/storage.js";
import * as Storage from "http://localhost:10000/storage.js";


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

const sameSet = (a, b) => {
  const s1 = new Set(a), s2 = new Set(b);
  if (s1.size !== s2.size) return false;
  for (const e of s1) if (!s2.has(e)) return false;
  return true;
};

(async () => {
  const dbname = "test-constellations";
  await Storage.ready(indexedDB.deleteDatabase(dbname));
  
  const storage = await Storage.Storage.open({dbname});

  // links
  for (const link of stardusts) {
    await storage.post(link);
  }
  const links = await storage.getAll();
  console.assert(stardusts.every(
    (l, i) => l.url === links[i].url && l.point === links[i].point &&
      sameSet(l.names, links[i].names)), "links1", links);

  // pages
  const pageUrl = "http://example/page.html";
  await storage.putPage(pageUrl);
  const page0 = (await storage.getAllPages())[0];
  console.assert(page0.pageUrl === pageUrl);
  console.assert(page0.lastUrl === undefined);
  const lastUrl = stardusts[0].url;
  await storage.putPage(pageUrl, lastUrl);
  const page1 = (await storage.getAllPages())[0];
  console.assert(page1.pageUrl === pageUrl);
  console.assert(page1.lastUrl === lastUrl);
  await storage.deletePage(pageUrl);
  console.assert((await storage.getAllPages()).length === 0);
  
  // close
  await storage.close();
  await Storage.ready(indexedDB.deleteDatabase(dbname));

  //console.info("[finished]");
  if (typeof window.finish === "function") window.finish();
})().catch(console.error);

