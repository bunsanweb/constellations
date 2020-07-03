// Constellations Peer Core: manage stardust links and these metadata

// TBD: ConstellationsEvent detail
export const ConstellationsEvent = class extends CustomEvent {};

// Core manages link only (does not touches Stardust document) 
export const Core = class extends EventTarget {
  constructor() {
    super();
    this.urls = new Set();
    this.links = []; // TBD: 
  }
  
  publish(url, point, names) {
    if (this.urls.has(url)) return;
    const nameSet = new Set(names);
    const link = {url, point, names};
    this.links.push(link);
    this.urls.add(url);
    this.dispatchEvent(
      new ConstellationsEvent("stardust-arrived", {detail: link}));
  }

  // Reader for Raw URL and metadata
  subscribe({point, names = []} = {}, from = undefined) {
    const enqueue = (controller, link) => {
      if (point && link.point !== point) return;
      const nameSet = new Set(link.names);
      if (names.some(n => !nameSet.has(n))) return;
      controller.enqueue(link);
    };
    
    let listener;
    return new ReadableStream({
      start: controller => {
        if (from) {
          const idx = this.links.findIndex(link => link.url === from);
          if (idx >= 0) {
            for (let i = idx; i < this.links.length; i++) {
              enqueue(controller, this.links[i]);
            }
          }
        }
        listener = ev => enqueue(controller, ev.detail);
        this.addEventListener("stardust-arrived", listener);
      },
      cancel: reason => {
        this.removeEventListener("stardust-arrived", listener);
      },
    });
  }

  // TBD: reversed from now to past
};

// TBD: client API: wrap Stardust url with BResource link 
