export class DesignCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.preloadedImages = new Map(); // Armazena as imagens pré-carregadas
  }

  connectedCallback() {
    this.shadowRoot.addEventListener("click", this.handleClick);
    this.shadowRoot.addEventListener("mouseenter", this.handleMouseEnter);
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("click", this.handleClick);
    this.shadowRoot.removeEventListener("mouseenter", this.handleMouseEnter);
  }

  handleMouseEnter() {
    // Preload da imagem em alta resolução
    if (this._design && !this.preloadedImages.has(this._design.image_url)) {
      const preloadImage = new Image();
      preloadImage.src = this._design.image_url;
      this.preloadedImages.set(this._design.image_url, preloadImage);
    }
  }

  handleClick(e) {
    if (e.target.closest(".author")) {
      return;
    }

    // Pega a imagem pré-carregada se existir
    const preloadedImage = this.preloadedImages.get(this._design.image_url);

    this.dispatchEvent(
      new CustomEvent("open-modal", {
        bubbles: true,
        composed: true,
        detail: {
          imageUrl: this._design.image_url,
          author: this._design.author,
          preloadedImage, // Passa a imagem pré-carregada
        },
      })
    );
  }

  static get observedAttributes() {
    return ["image", "author", "category"];
  }

  set design(value) {
    this._design = value;
    this.render();
  }

  get loading() {
    return this.hasAttribute("priority") ? "eager" : "lazy";
  }

  optimizeImageUrl(url, width) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?w=${width}&fm=webp&q=80`;
  }

  render() {
    if (!this._design) return;
    const { image_url, author } = this._design;

    const sizes = [
      { width: 320, screenSize: "320w" },
      { width: 480, screenSize: "480w" },
      { width: 768, screenSize: "768w" },
    ];

    const srcset = sizes
      .map(
        (size) =>
          `${this.optimizeImageUrl(image_url, size.width)} ${
            size.screenSize
          }`
      )
      .join(", ");

    this.shadowRoot.innerHTML = `
          <style>
              :host {
                  display: block;
              }
              .card {
                  overflow: hidden;
                  background: white;
                  transition: opacity 0.3s ease;
                  cursor: pointer;
              }
              .image-container {
                  position: relative;
                  padding-top: 75%; /* 4:3 Aspect Ratio */
                  background: #f5f5f5;
                  overflow: hidden;
                  // aspect-ratio: 4/3;
                  border-radius: 0.5rem;
              }
              .image-container::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(
                    90deg,
                    #f5f5f5 0%,
                    #efefef 50%,
                    #f5f5f5 100%
                  );
                  background-size: 200% 100%;
                  animation: shimmer 1.5s infinite;
              }
              @keyframes shimmer {
                  0% { background-position: -200% 0; }
                  100% { background-position: 200% 0; }
              }
              img {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
              }
              .card:hover {
                  opacity: 0.7;
              }
              .info {
                  padding: 0.6rem;
              }
              .author {
                  font-size: 0.875rem;
                  font-weight: 500;
                  color: currentColor;
                  text-decoration: none;
              }
              .author:hover {
                  color: #3B82F6;
              }
          </style>
          <div class="card">
              <div class="image-container">
                  <picture>
                      <source
                          type="image/webp"
                          srcset="${srcset}"
                          sizes="(max-width: 768px) 100vw, 25vw"
                      >
                      <img
                        src="${this.optimizeImageUrl(image_url, 480)}"
                        srcset="${srcset}"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        width="480"
                        height="360"
                        alt="Design by ${author}"
                        loading="${this.loading}"
                        decoding="async"
                      />
                  </picture>
              </div>
              <div class="info">
                  <a
                      href="https://x.com/${author}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="author">
                      @${author}
                  </a>
              </div>
          </div>
      `;
  }
}

customElements.define("design-card", DesignCard);
