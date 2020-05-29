import * as Aggregator from "./modules/aggregator.js";
import * as Stardust from "./modules/stardust-ipfs/modules/stardust.js";
import * as FetchIFS from "./modules/fetch-ipfs/modules/fetch-ipfs.js";

//import "https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js";

const main = async () => {
  //console.info("[INFO] IPFS node spawn several logs includes WebSocket Errors");
  /*
  const node = window.ipfsNode = await Ipfs.create({
    repo: `ipfs-${Math.random()}`,
    relay: {enabled: true, hop: {enabled: true, active: true}},
  });
  await node.ready;
  console.debug("IPFS version:", (await node.version()).version);
  const myid = (await node.id()).id;
  console.debug(`Peer ID:`, myid);
  */

  //1. setup Publishing stardusts
  //   - stardust urls are on IPFS
  //   - the latest list url is fake with wrapped fetch impl
  
  //2. create Aggregator for the latest list url
  
  //3. do aggregate() and check stardust-arrived event results

  
  
};
main().catch(console.error);
