export class ImageModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
          <style>
              :host {
                  display: none;
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(0, 0, 0, 0.9);
                  z-index: 1000;
                  opacity: 0;
                  transition: opacity 0.3s ease;
              }

              :host(.active) {
                  display: flex;
                  opacity: 1;
              }

              .modal-content {
                  position: relative;
                  margin: auto;
                  max-width: 90vw;
                  max-height: 90vh;
              }

              img {
                  max-width: 100%;
                  max-height: 90vh;
                  object-fit: contain;
                  border-radius: .6rem;
              }

              .close-button {
                  position: absolute;
                  top: -40px;
                  right: 0;
                  background: none;
                  border: none;
                  color: white;
                  font-size: 24px;
                  cursor: pointer;
                  padding: 8px;
              }

              .info {
                  position: absolute;
                  bottom: -40px;
                  left: 0;
                  right: 0;
                  color: white;
                  text-align: center;
                  font-size: 14px;
              }

              .author {
                  color: #fff;
                  text-decoration: none;
                  font-weight: 500;
              }

              .author:hover {
                  text-decoration: underline;
              }
          </style>
          <div class="modal-content">
              <img loading="eager" alt="Design preview">
              <div class="info">
                  <a class="author" target="_blank" rel="noopener noreferrer"></a>
              </div>
          </div>
      `;
  }

  setupEventListeners() {
    this.addEventListener("click", (e) => {
      if (e.target === this) {
        this.close();
      }
    });

    // Adiciona suporte a tecla ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.classList.contains("active")) {
        this.close();
      }
    });
  }

  open(imageUrl, author, preloadedImage) {
    const img = this.shadowRoot.querySelector("img");
    const authorLink = this.shadowRoot.querySelector(".author");

    if (preloadedImage && preloadedImage.complete) {
      img.src = preloadedImage.src;
    } else {
      img.style.opacity = "0";
      img.src = imageUrl;
      img.onload = () => {
        img.style.opacity = "1";
      };
    }

    authorLink.href = `https://x.com/${author}`;
    authorLink.textContent = `@${author}`;

    this.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  close() {
    this.classList.remove("active");
    document.body.style.overflow = ""; // Restaura scroll
  }
}

customElements.define("image-modal", ImageModal);
