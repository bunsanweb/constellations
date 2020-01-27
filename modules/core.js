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
    const link = {url, point, nameSet};
    this.links.push(link);
    this.dispatchEvent(
      new ConstellationsEvent("stardust-arrival", {detail: link}));
  }

  // Reader for Raw URL and metadata
  subscribe({point, names = []} = {}, from = undefined) {
    let listener;
    return new ReadableStream({
      start: controller => {
        if (from) {
          const idx = this.links.findIndex(link => link.url === from);
          if (idx >= 0) {
            for (let i = idx; i < this.links; i++) {
              controller.enqueue(this.links[i]);
            }
          }
        }
        listener = ev => {
          if (point && ev.detail.point !== point) return;
          if (names.some(n => !ev.detail.nameSet.has(n))) return;
          controller.enqueue(ev.detail);
        };
        this.addEventListener("stardust-arrived", listener);
      },
      cancel: reason => {
        this.removeEventListener("stardust-arrived", listener);
      },
    });
  }
};


// TBD: client API: wrap Stardust url with BResource link
