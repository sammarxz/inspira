import { DesignCard } from "../components/design-card.js";
import { CategoryNav } from "../components/category-nav.js";
import { ImageModal } from "../components/modal.js";
import { DataService } from "./data-service.js";

class App {
  constructor() {
    this.gallery = document.getElementById("gallery");
    this.modal = document.querySelector("image-modal");
    this.dataService = new DataService();
    this.page = 1;
    this.loading = false;
    this.hasMore = true;

    this.setupEventListeners();
    this.setupInfiniteScroll();
    this.loadInitialContent();
    this.installServiceWorker();
  }

  installServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./service-worker.js")
          .then((registration) => {
            console.log("Service Worker registrado com sucesso!");
          })
          .catch((error) => {
            console.error("Erro ao registrar Service Worker:", error);
          });
      });
    }
  }

  async updateServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }

        await navigator.serviceWorker.register("./service-worker.js");

        window.location.reload();
      } catch (error) {
        console.error("Erro ao atualizar Service Worker:", error);
      }
    }
  }

  setupInfiniteScroll() {
    if (!this.sentinel) {
      this.sentinel = document.createElement("div");
      this.sentinel.className = "w-full h-4";
      this.gallery.after(this.sentinel);
    }

    const options = {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.loading && this.hasMore) {
          this.loadMoreDesigns();
        }
      });
    }, options);

    this.observer.observe(this.sentinel);
  }

  setupEventListeners() {
    window.addEventListener("hashchange", () => {
      this.handleRouteChange(window.location.hash);
    });

    document.addEventListener("open-modal", (e) => {
      const { imageUrl, author, preloadedImage } = e.detail;
      this.modal.open(imageUrl, author, preloadedImage);
    });

    document
      .querySelector(".js-button-to-top")
      .addEventListener("click", () => {
        window.scrollTo(0, 0);
      });
  }

  getCategoryName(hash) {
    const categories = {
      mobile: "Mobile Designs",
      desktop: "Desktop Designs",
      watch: "Watch Designs",
      vision: "Vision Designs",
      icons: "Icon Designs",
      illustrations: "Illustration Designs",
    };

    const categoryKey = hash.replace("#/", "").toLowerCase();
    return categories[categoryKey] || "App Design Inspiration";
  }

  async handleRouteChange(hash) {
    const category = this.getCategoryFromHash(hash);

    window.scrollTo(0, 0);
    this.setupPageTitle(hash);

    this.gallery.innerHTML = "";
    this.page = 1;
    this.hasMore = true;

    if (this.observer) this.observer.disconnect();
    if (this.sentinel) {
      this.sentinel.remove();
      this.sentinel = null;
    }

    this.setupInfiniteScroll();
    await this.loadDesigns(category);
  }

  setupPageTitle(hash) {
    const newTitle = this.getCategoryName(hash);
    document.title = `${
      document.title.split("-")[0]
    } - ${newTitle} inspiration by @sammarxz`;
  }

  async loadInitialContent() {
    const hash = window.location.hash;
    const category = this.getCategoryFromHash(hash);

    this.setupPageTitle(hash);

    this.page = 1;
    this.hasMore = true;

    this.setupInfiniteScroll();
    await this.loadDesigns(category);
  }

  getCategoryFromHash(hash) {
    return hash.replace("#/", "") || "random";
  }

  async loadDesigns(category) {
    try {
      const designs = await this.dataService.getDesigns(category, this.page);
      this.hasMore = designs.length > 0;
      this.renderDesigns(designs);
    } catch (error) {
      console.error("Error loading designs:", error);
      this.gallery.innerHTML = `
        <div class="col-span-full text-center text-gray-500">
          Erro ao carregar os designs. Tente novamente mais tarde.
        </div>
      `;
    }
  }

  async loadMoreDesigns() {
    if (this.loading || !this.hasMore) return;

    this.loading = true;
    this.showLoadingIndicator();

    try {
      const category = this.getCategoryFromHash(window.location.hash);
      this.page += 1;
      const newDesigns = await this.dataService.getDesigns(category, this.page);

      if (newDesigns.length > 0) {
        this.renderDesigns(newDesigns);
        this.hasMore = true;
      } else {
        this.hasMore = false;
        this.sentinel.remove();
      }
    } catch (error) {
      console.error("Error loading more designs:", error);
      this.hasMore = false;
    } finally {
      this.hideLoadingIndicator();
      this.loading = false;
    }
  }

  showLoadingIndicator() {
    if (!this.loadingIndicator) {
      this.loadingIndicator = document.createElement("div");
      this.loadingIndicator.className =
        "col-span-full py-4 text-center text-gray-500";
      this.loadingIndicator.innerHTML = `
        <svg class="animate-spin h-8 w-8 mx-auto text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      `;
    }
    this.gallery.after(this.loadingIndicator);
  }

  hideLoadingIndicator() {
    if (this.loadingIndicator) {
      this.loadingIndicator.remove();
    }
  }

  async renderDesigns(designs) {
    const aboveFoldDesigns = designs.slice(0, 4);
    const remainingDesigns = designs.slice(4);

    aboveFoldDesigns.forEach((design, index) => {
      const card = document.createElement("design-card");
      card.setAttribute("priority", "true");
      card.design = design;
      this.gallery.appendChild(card);
    });

    if (remainingDesigns.length) {
      setTimeout(() => {
        remainingDesigns.forEach((design, index) => {
          const card = document.createElement("design-card");
          card.design = design;
          this.gallery.appendChild(card);
        });
      }, 100);
    }
  }
}

new App();
