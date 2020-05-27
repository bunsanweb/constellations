import path from "path";
import nodeUrl from "url";
import {PeerServer} from "../../tool/peer-server.js";

const port = "21212";
const repo = path.resolve(
  nodeUrl.fileURLToPath(import.meta.url), "../repo-peer-server"); 

(async () => {
  const server = PeerServer.create(repo, port);
})().catch(console.error);
