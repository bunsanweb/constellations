import * as Peer from "./modules/peer.js";

import "https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js";

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

const newGate = () => {
  const r = {};
  r.wait = new Promise(f => {
    r.open = f;
  });
  return r;
};

const main = async () => {
  console.info(
    "[INFO] IPFS node spawn several logs includes WebSocket Errors");

  const node = window.ipfsNode = await Ipfs.create({
    repo: `ipfs-${Math.random()}`,
    relay: {enabled: true, hop: {enabled: true, active: true}},
  });
  //console.debug("IPFS version:", (await node.version()).version);
  const myid = (await node.id()).id;
  //console.debug(`Peer ID:`, myid);

  // setup peer
  const peer = await Peer.Peer.create(node);

  // subscribe
  const received = new Map(), gate = newGate();
  peer.addEventListener("stardust-arrived", ev => {
    const {url, point, names} = ev.detail;
    //console.debug(url, point, names);
    received.set(url, {url, point, names});
    if (received.size === stardusts.length) gate.open();
  });
  
  // swarm.connect to peer-server
  {
    try {
      const res = await fetch("http://localhost:21212/");
      const {id} = await res.json();
      //console.debug("Peer-server", id);
      await peer.connect(id);
    } catch (error) {
      console.assert(false, "[INFO] you should run test/peer/peer-server.js");
      throw error;
    }
  }
  
  // publish
  for (const {url, point, names} of stardusts) {
    await peer.publishLink({url, point, names});
  }

  // check received
  await gate.wait;
  console.assert(stardusts.every(
    ({url, point, names}) => received.has(url)), received);
  //console.debug("[finished]");
  if (typeof window.finish === "function") window.finish();
};
main().catch(console.error);

  
