// # NOTE: Rough Design of Constellations
//
// Constellations peer consists 5 parts:
//
// - Core: Manage Stardust links to serve clients
// - Collector: Collect Stardust links from Stardust list URLs
// - Network: Propagate Stardust links to other constellation peers
// - Storage: Storing Stardust link urls to Web Storage(IndexedDB)
//
// Constellations Peer Core (as Core)
//
// - clients receives Stardust link as BResource Link
// - clients get Stardust links from ReadableStream (Web Stream's, not node.js's)
// - clients get ReadableStream with conditions as BResource's condition
// - Core manages Stardust link url lists to post to ReadableStream
// - Core judges a url already arrived
// - Core sends events of Stardust link arrival
// - Core interact with other Cores on window with standard BroadcastChannel API?
// 
// Constellations Peer Collector (as Book/Collector)
//
// - Collector collects Stardust link from registered Stardust-list urls
// - Collector schedules accessing Stardust-list url
// - Collector stores last Stardust link url of each Stardust-list url
// - Collector send newer Stardust links to Core 
//
// Constellations Peer Network (as Peer)
//
// - Network subscribes IPFS pubsub and connects other peers
// - Network publishes arrival Stardust link url on Core (via Core events)
// - Network publishes added Stardust-list url
// - Network sends subscribed Stardust link url to Core
// - Network sends subscribed Stardust-list url to Collector
//
// Constelations Peer Storage
//
// - Storage stores Stardust urls and these metadata in Core
// - Core loads initial state from Storage
// - Storage use IndexedDB, stores Stardust url and metadata with Stardust url as key
// - Storage acquires items from Core events (same as Network)
// 
//
//  Clinets => Core <=>|
//                     |=> Strage
//                     |<= Book <= Collectors
//                     |<= Peer
//
//
// # NOTE: Requirements of Constellations Peer
//
// - Constellations Peer runs with browser Web APIs
// - Constellations Peer uses a passed single IPFS node
// - Constellations Peer is a single instance for multiple client programs
//     - Core client facade with BroadcastChannel?
// - Constellations Peer store persistent states 
//
//
// # NOTE: metadata in Stardust/Stardust-list for Constellations
//
// - Constellations system uses some metadata (e.g. tag-set as constellation-names)
// - These metadata embedded in Stardust and Stardust-list (copied from linked Stardust)
// - Constellations Core provides API with these metadata values
//     - Client acquires filtered Stardust links with matched metadata values
//
