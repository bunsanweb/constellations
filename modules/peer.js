
export const topicId = "bunsanweb-constellations";
export const PeerEvent = class extends CustomEvent {};

export const Peer = class extends EventTarget {
  static async create(node) {
    return await (new this(node)).start();
  }
  
  constructor(node) {
    super();
    this.node = node;
    this.handler = onMessage041.bind(this);
    this.connects = new Set();
  }

  //NOTE: restarting does not work well. incoming is OK, outgoing is not.
  // - bug on libp2p.pubsub or not?
  // - if not, implement swarm.connect heartbeat in Peer
  async start() {
    await this.node.libp2p.pubsub.subscribe(topicId, this.handler);
    for (const id of this.connects) {
      try {
        await this.connect(id);
      } catch (error) {
        console.debug(error);
      }
    }
    return this;
  }
  async stop() {
    try {
      await this.node.libp2p.pubsub.unsubscribe(topicId, this.handler);
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

// handler for pubsub  for js-ipfs >= 0.41
const onMessage041 = function ({from, data, seqno, topicIds, signature, key}) {
  try {
    const msg = JSON.parse(new TextDecoder().decode(data));
    if (msg.type === "link") arriveLink(this, msg);
  } catch (error) {
    console.warn(`invalid message handling`, error);
  }
};

const arriveLink = (peer, msg) => {
  const {url, point, names} = msg;
  const link = {
    url: new URL(url).href, point: new URL(point).href,
    names: names.map(e => String(e)),
  };
  peer.dispatchEvent(new PeerEvent("stardust-arrived", {detail: link}));  
}


// node.swarm.connect() for js-ipfs >= 0.41 
const connect041 = async (node, id) => {
  const addrs = new Set((await node.swarm.addrs()).map(({id}) => id));
  //console.log(addrs);
  if (addrs.has(id)) return;

  let relaid = false;
  for (const relay of addrs) {
    const relayid = `/p2p/${relay}/p2p-circuit/p2p/${id}`;
    //console.log("relayid", relayid);
    try {
      await node.swarm.connect(relayid);
      relaid = true;
      break;
    } catch (error) {
      //console.log(error);
    }
  }
  if (!relaid) throw Error(`could not relay to ${id}`);
};
