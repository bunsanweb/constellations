import path from "path";
import nodeUrl from "url";
import {PeerServer} from "../../tool/peer-server.js";

console.log(`[INFO] add "/ip4/127.0.0.1/tcp/8081/ws" into Addresses.Swarm ` +
            `in "repo-peer-server/config" file ` +
            `to access directly from browser pages`);

const port = "21212";
const repo = path.resolve(
  nodeUrl.fileURLToPath(import.meta.url), "../repo-peer-server"); 

(async () => {
  const server = PeerServer.create(repo, port);
})().catch(console.error);
