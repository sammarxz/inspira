// components/virtual-scroller.js
export class VirtualScroller extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.itemHeight = 400;
    this.buffer = 5;
    this.items = [];
    this.visibleItems = new Set();
  }

  connectedCallback() {
    this.setupScroller();
    this.setupObserver();
  }

  setupScroller() {
    this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    height: 100%;
                }
                .viewport {
                    height: 100%;
                    overflow-y: auto;
                }
                .content {
                    position: relative;
                }
                .item-container {
                    position: absolute;
                    width: 100%;
                    will-change: transform;
                }
            </style>
            <div class="viewport">
                <div class="content"></div>
            </div>
        `;

    this.viewport = this.shadowRoot.querySelector(".viewport");
    this.content = this.shadowRoot.querySelector(".content");

    this.viewport.addEventListener("scroll", this.onScroll.bind(this));
  }

  setupObserver() {
    const options = {
      root: this.viewport,
      rootMargin: "100px 0px",
      threshold: 0,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const itemId = entry.target.dataset.itemId;
        if (entry.isIntersecting) {
          this.visibleItems.add(itemId);
        } else {
          this.visibleItems.delete(itemId);
        }
      });
    }, options);
  }

  set designs(value) {
    this.items = value;
    this.render();
  }

  render() {
    const totalHeight = this.items.length * this.itemHeight;
    this.content.style.height = `${totalHeight}px`;
    this.onScroll();
  }

  onScroll() {
    const scrollTop = this.viewport.scrollTop;
    const viewportHeight = this.viewport.clientHeight;

    const startIndex = Math.floor(scrollTop / this.itemHeight) - this.buffer;
    const endIndex =
      Math.ceil((scrollTop + viewportHeight) / this.itemHeight) + this.buffer;

    this.renderVisibleItems(
      Math.max(0, startIndex),
      Math.min(this.items.length, endIndex)
    );
  }

  renderVisibleItems(startIndex, endIndex) {
    const currentItems = Array.from(this.content.children);
    currentItems.forEach((child) => {
      const index = parseInt(child.dataset.index);
      if (index < startIndex || index >= endIndex) {
        this.content.removeChild(child);
        this.observer.unobserve(child);
      }
    });

    for (let i = startIndex; i < endIndex; i++) {
      if (!this.items[i]) continue;
      if (!this.content.querySelector(`[data-index="${i}"]`)) {
        const container = document.createElement("div");
        container.className = "item-container";
        container.dataset.index = i;
        container.style.transform = `translateY(${i * this.itemHeight}px)`;

        const card = document.createElement("design-card");
        card.design = this.items[i];
        container.appendChild(card);

        this.content.appendChild(container);
        this.observer.observe(container);
      }
    }
  }
}

customElements.define("virtual-scroller", VirtualScroller);
