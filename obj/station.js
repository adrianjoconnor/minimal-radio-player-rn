class Station {
  constructor(id, url, title, genre, artwork) {
    this.id = id;
    this.url = url;
    this.title = title;
    this.genre = genre;
    this.artwork = artwork;
  }

  getData() {
    return {
      id: this.id,
      url: this.url,
      title: this.title,
      genre: this.genre,
      artwork: this.artwork,
    };
  }
}

export default Station;
