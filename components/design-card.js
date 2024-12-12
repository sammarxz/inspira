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

  generateSrcSet(url, format = "") {
    const widths = [320, 480, 640, 800];
    const baseUrl = url.split("?")[0];
    return widths
      .map((width) => {
        const resizedUrl =
          format === "webp"
            ? `${baseUrl}?w=${width}&format=webp`
            : `${baseUrl}?w=${width}`;
        return `${resizedUrl} ${width}w`;
      })
      .join(", ");
  }

  render() {
    if (!this._design) return;
    const { image_url, author, category } = this._design;

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
                  border-radius: 0.5rem;
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
                          srcset="${this.generateSrcSet(image_url, "webp")}"
                          sizes="(max-width: 768px) 100vw, 25vw"
                      >
                      <img
                          src="${image_url}"
                          srcset="${this.generateSrcSet(image_url)}"
                          sizes="(max-width: 768px) 100vw, 25vw"
                          alt="Design by ${author}"
                          loading="lazy"
                          onload="this.style.opacity = 1"
                          style="opacity: 0; transition: opacity 0.3s"
                      >
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
