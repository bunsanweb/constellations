import * as Peer from "./modules/peer.js";

import "https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js";

const main = async () => {
  console.info("[INFO] IPFS node spawn several logs includes WebSocket Errors");
  
  const node = window.ipfsNode = await Ipfs.create({
    repo: `ipfs-${Math.random()}`,
    relay: {enabled: true, hop: {enabled: true, active: true}},
  });
  await node.ready;
  console.debug("IPFS version:", (await node.version()).version);
  const myid = (await node.id()).id;
  console.debug(`Peer ID:`, myid);
  document.querySelector("#id").textContent = myid;

  const peer = await Peer.Peer.create(node);
  // "stardust-arrived" event 
  const log = document.querySelector("#log");
  peer.addEventListener("stardust-arrived", ev => {
    const {url, point, names} = ev.detail;
    log.textContent =
      `[stardust-arrived] ${url} ${point} ${names.join(",")}\n` +
      log.textContent;
  });
  
  // swarm.connect
  /*
  document.querySelector("#connect").addEventListener("click", ev => {
    const id = document.querySelector("#swarm").value.trim();
    (async () => {
      await peer.connect(id);
      log.textContent = `[swarm.conected] ${id}\n` + log.textContent;
    })().catch(console.error);
  });
  */
  // swarm.connect to peer-server
  {
    const res = await fetch("http://localhost:21212/");
    const {id} = await res.json();
    console.log("Peer-server", id);
    await peer.connect(id);
    log.textContent = `[swarm.conected] ${id}\n` + log.textContent;
    document.querySelector("#publish").disabled = false;
    document.querySelector("#restart").disabled = false;
  }
  
  // Publish Link
  let index = 0;
  document.querySelector("#publish").addEventListener("click", ev => {
    const url = `http://example.com/${myid}/${index++}`;
    const point = document.querySelector("#point").value;
    const names = document.querySelector("#names").value.trim().split(/\s+/);
    (async () => {
      await peer.publishLink({url, point, names});
      log.textContent = `[publish] ${url} ${point} ${names.join(",")}\n` +
        log.textContent;
    })().catch(console.error);
  });

  // restart
  document.querySelector("#restart").addEventListener("click", ev => {
    document.querySelector("#publish").disabled = true;
    document.querySelector("#restart").disabled = true;
    (async () => {
      await peer.stop();
      await node.stop();
      await node.start();
      await peer.start();
      //WORKAROUND: recovering pubsub after restarted twice and more. why?
      await peer.stop();
      await node.stop();
      await node.start();
      await peer.start();
      document.querySelector("#publish").disabled = false;
      document.querySelector("#restart").disabled = false;
    })().catch(console.error);
  });
};
main().catch(console.error);
