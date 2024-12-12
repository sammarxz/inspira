export class CategoryNav extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.isMenuOpen = false;
  }

  connectedCallback() {
    this.categories = [
      "Mobile",
      "Desktop",
      "Watch",
      "Vision",
      "Icons",
      "Illustrations",
    ];
    this.render();
    this.addEventListeners();
    this.updateActiveLink();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .sidebar {
          display: flex;
          align-items: center;
          position: sticky;
          top: 0;
          background: #fff;
          height: 52px;
          width: 100%;
          border-top: 1px solid #ececec;
          border-bottom: 1px solid #ececec;
          z-index: 999;
        }

        .sidebar-content {
          display: flex;
          gap: 16px;
          padding: 0 16px;
          margin: 0 auto;
          overflow-x: auto;
        }

        .sidebar-content a {
          color: currentColor;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          white-space: nowrap;
          font-size: .8rem;
        }

        .sidebar-content a:hover {
          background: #f3f4f6;
        }

        .sidebar-content a.active {
          background: #e5e7eb;
        }
      </style>

      <sidebar class="sidebar">
        <div class="sidebar-content">
          <a href="#/" class="" data-link>
            Random
          </a>
          ${this.categories
            .map(
              (cat) => `
            <a href="#/${cat.toLowerCase()}" class="" data-link>
              ${cat}
            </a>
          `
            )
            .join("")}
        </div>
      </sidebar>
    `;
  }

  addEventListeners() {
    this.shadowRoot.querySelectorAll("[data-link]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const href = link.getAttribute("href");
        window.history.pushState({}, "", href);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
        this.updateActiveLink();
      });
    });

    window.addEventListener("hashchange", () => this.updateActiveLink());
  }

  updateActiveLink() {
    const currentHash = window.location.hash || "#/";
    this.shadowRoot.querySelectorAll("[data-link]").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === currentHash) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
}

customElements.define("category-nav", CategoryNav);
