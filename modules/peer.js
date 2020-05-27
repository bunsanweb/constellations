import {EventTarget, CustomEvent} from "./event-polyfill.js";
export const topicId = "bunsanweb-constellations";
export const protocolId = "bunsanweb-constellations";

export const PeerEvent = class extends CustomEvent {};

export const Peer = class extends EventTarget {
  static async create(node) {
    return await (new this(node)).start();
  }
  
  constructor(node) {
    super();
    this.node = node;
    this.subscriber = onMessage041.bind(this);
    this.handler = onHandle041.bind(this);
    this.connects = new Set();
  }

  //NOTE: restarting does not work well. incoming is OK, outgoing is not.
  // - bug on libp2p.pubsub or not?
  // - if not, implement swarm.connect heartbeat in Peer
  async start() {
    this.node.libp2p.handle(protocolId, this.handler);
    await this.node.libp2p.pubsub.subscribe(topicId, this.subscriber);
    for (const id of this.connects) {
      try {
        await this.connect(id);
        // NOTE: Error happen: stuck case on restarting
        // - peer.html A and peer.html B connected to peer-server C
        // - A restarted
        // - B restart then stuck at one of this.connect(id)
        //     - /p2p/C/p2p-circuit/p2p/A
        const {stream, protocol} = await this.node.libp2p.dialProtocol(
          `/p2p/${id}`, protocolId);
        //for await (const buf of stream.source) {}
      } catch (error) {
        console.debug(error);
      }
    }
    return this;
  }
  async stop() {
    try {
      await this.node.libp2p.pubsub.unsubscribe(topicId, this.subscriber);
      this.node.libp2p.unhandle(protocolId, this.handler);
    } catch (error) {
      console.debug(error);
    }
  }  
  
  // connect to p2pid
  async connect(id) {
    await connect041(this.node, id);
    this.connects.add(id);
  }

  // publish each link
  async publishLink({url, point, names}) {
    // NOTE: not check multiple sent urls here
    // TBD: check valid message
    const msg = JSON.stringify({
      type: "link", url: String(url), point: String(point),
      names: names.map(e => String(e)),
    });
    const buffer = new TextEncoder().encode(msg);
    await this.node.libp2p.pubsub.publish(topicId, buffer);
  }  
};

//
const onHandle041 = function ({connection, stream, protocol}) {
  const id = connection.remotePeer.toB58String();
  const addr = connection.remoteAddr.toString();
  console.log("dialed", id);
  (async () => {
    await this.connect(id);
    const msg = JSON.stringify({
      type: "reconnect", id,
    });
    const buffer = new TextEncoder().encode(msg);
    await this.node.libp2p.pubsub.publish(topicId, buffer);
    stream.sink({async [Symbol.asyncIterator]() {}});
  })().catch(console.error);
};


// subscriber for pubsub  for js-ipfs >= 0.41
const onMessage041 = function ({from, data, seqno, topicIds, signature, key}) {
  try {
    const msg = JSON.parse(new TextDecoder().decode(data));
    if (msg.type === "link") arriveLink(this, msg);
    if (msg.type === "reconnect") arriveReconnect(this, msg);
  } catch (error) {
    console.warn(`invalid message handling`, error);
  }
};

const arriveReconnect = (peer, msg) => {
  if (msg.id === peer.node.libp2p.peerInfo.id.toB58String()) return;
  (async () => {
    console.log("reconnecting", msg.id);
    await peer.node.swarm.disconnect(`/p2p/${msg.id}`);
    await peer.connect(msg.id);
    console.log("reconnected", msg.id);
  })().catch(console.error);
};

const arriveLink = (peer, msg) => {
  const {url, point, names} = msg;
  const link = {
    url: new URL(url).href, point: new URL(point).href,
    names: names.map(e => String(e)),
  };
  peer.dispatchEvent(new PeerEvent("stardust-arrived", {detail: link}));  
}


const promiseAny = promises => new Promise((f, r) => {
  const ps = [...promises];
  const settled = ps.map(_ => false);
  const errors = ps.map(_ => undefined);;
  ps.forEach((p, i) => p.then(f, e => {
    errors[i] = e;
    settled[i] = true;
    if (settled.every(b => b)) r(errors);
  }));
});

// node.swarm.connect() for js-ipfs >= 0.41 
const connect041 = async (node, id) => {
  const addrs = (await node.swarm.addrs()).map(({id}) => id);
  const addrSet = new Set(addrs);
  //console.log(addrs);
  if (addrSet.has(id)) return;

  /*
  await promiseAny(addrs.map(relay => {
    const relayid = `/p2p/${relay}/p2p-circuit/p2p/${id}`;
    console.log(relayid);
    return node.swarm.connect(relayid);
  })); // always every connect() failed
  */
  
  let relaid = false;
  for (const relay of addrs) {
    try {
      const relayid = `/p2p/${relay}/p2p-circuit/p2p/${id}`;
      await node.swarm.connect(relayid);
      relaid = true;
    } catch (error) {
    }
  }
  if (!relaid) throw Error(`cannot relaid ${id}`);
};
