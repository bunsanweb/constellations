import Ipfs from "ipfs";
import http from "http";
import {Peer} from "../modules/peer.js";

export const PeerServer = class {
  static async create(repo, port, host = "0.0.0.0") {
    return await (new this(repo, port, host)).start();
  }
  constructor(repo, port, host) {
    this.repo = repo;
    this.port = port;
    this.host = host;
  }
  async start() {
    this.node = await Ipfs.create({
      repo: this.repo,
      relay: {enabled: true, hop: {enabled: true, active: true}},
    });
    console.debug("IPFS version:", (await this.node.version()).version);
    this.id = (await this.node.id()).id;
    console.debug(`Peer ID:`, this.id);
    this.peer = await Peer.create(this.node);
    
    this.server = http.createServer((req, res) => {
      res.writeHead(200, {
        "content-type": "application/json",
        "access-control-allow-origin": "*", 
      });
      res.end(JSON.stringify({id: this.id}));
    });
    const data = await new Promise((f, r) => {
      const cb = (err, data) => err ? r(err) : f(data);
      this.server.listen(this.port, this.host, cb);
    });
    const addr = this.server.address();
    console.debug(`HTTP server:`, `http://${addr.address}:${addr.port}/`);
    return this;
  }
  async stop() {
    try {
      await new Promise((f, r) => {
        const cb = (err, data) => err ? r(err) : f(data);
        this.server.close(cb);
      });
    } catch (error) {
      console.error(error);
    }
    try {
      await this.peer.stop();
    } catch (error) {
      console.error(error);
    }
    await this.node.stop();
  }
};
