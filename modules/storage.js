
// IndexedDB storage for storing link objcets in Core
// Design
// - stores each link to the Storage (via stardust-arrival event from the core)
//     - link: {url: string, point: string, names: [string]}
// - core loads link object set from the Storage
// - store other data
//     - book/aggregator state: pageUrl/cached stardustUrl
//     - peer state: swarm.connect ids
//
// NOTE:
// - not using IDBObserver (implemented on chrome only)
//     - use other standard notification method between contexts in a runtime

// Utility: Promise interface for IndexedDB transaction and request
export const complete = tx => new Promise((f, r) => {
  if (tx.state === "finished") {
    if (tx.error) r(tx.error);
    else f();
  } else {
    tx.addEventListener("complete", ev => f());
    tx.addEventListener("abort", ev => r(tx.error));
  }
});
export const ready = req => new Promise((f, r) => {
  if (req.readyState === "done") {
    if (req.error) r(req.error);
    else f(req.result);
  } else {
    req.addEventListener("success", ev => f(req.result));
    req.addEventListener("error", ev => r(req.error));
  }
});

// IndexedDB functions for stored links

export const indexedDB = (opts = {}) => opts.indexedDB ?
  opts.indexedDB : window.indexedDB;
export const dbname = (opts = {}) => opts.dbname ?
  opts.dbname : "constellations";
export const dbversion = 1;

export const initVersion1 = ev => {
  const {oldVersion, newVersion} = ev;
  //console.log("IndexedDB oldVersion, newVersion:", oldVersion, newVersion);
  if (oldVersion >= 1) return;
  const db = ev.target.result;
  const links = db.createObjectStore("links", {
    keyPath: "index", autoIncrement: true});
  links.createIndex("url", "url", {unique: true});
  links.createIndex("point", "point", {unique: false});
  links.createIndex("names", "names", {unique: false, multientry: true});
};

const open = async (opts = {}) => {
  //console.log(indexedDB(opts), dbname(opts));
  const req = indexedDB(opts).open(dbname(opts), dbversion);
  req.addEventListener("upgradeneeded", ev => {
    initVersion1(ev);
  });
  return await ready(req); // returns db
};
const close = async db => {
  db.close();
};
const post = async (db, link) => {
  const tx = db.transaction(["links"], "readwrite");
  const links = tx.objectStore("links");
  const req = links.add(link);
  return await Promise.all([ready(req), complete(tx)]);
};
const getAll = async db => {
  const tx = db.transaction(["links"], "readonly");
  const links = tx.objectStore("links");
  const req = links.getAll();
  return await ready(req);
};

// interface of Storage
export const Storage = class {
  static async open(opts = {}) {
    const storage = new this();
    storage.db = await open(opts);
    return storage;
  }
  async close() {
    await close(this.db);
    this.db = null;
  }
  async post(link) {
    await post(this.db, link);
    return this;
  }
  async getAll() {
    return (await getAll(this.db)).map(
      ({url, point, names}) => ({url, point, names}));
  }
};
