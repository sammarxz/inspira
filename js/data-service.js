export class DataService {
  constructor() {
    this.cache = new Map();
    this.dataUrl = "./data/designs.json";
    this.allDesigns = null;
    this.itemsPerPage = 20;
  }

  async getDesigns(category, page = 1) {
    try {
      if (!this.allDesigns) {
        this.allDesigns = await this.fetchDesigns();
      }

      let designs = [...this.allDesigns];
      if (category !== "random") {
        designs = designs.filter(
          (d) => d.category.toLowerCase() === category.toLowerCase()
        );
      }

      if (category === "random" && page === 1) {
        designs = this.shuffleArray(designs);
      }

      const start = (page - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;

      return designs.slice(start, end);
    } catch (error) {
      console.error("Error fetching designs:", error);
      throw error;
    }
  }

  async fetchDesigns() {
    const response = await fetch(this.dataUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const designs = await response.json();
    return designs;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
