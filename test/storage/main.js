import * as Storage from "./modules/storage.js";
//import * as Storage from "http://localhost:10000/storage.js";


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
  for (const link of stardusts) {
    await storage.post(link);
  }
  const links = await storage.getAll();
  console.assert(stardusts.every(
    (l, i) => l.url === links[i].url && l.point === links[i].point &&
      sameSet(l.names, links[i].names)), "links1", links);

  await storage.close();
  await Storage.ready(indexedDB.deleteDatabase(dbname));

  //console.info("[finished]");
  if (typeof window.finish === "function") window.finish();
})().catch(console.error);

