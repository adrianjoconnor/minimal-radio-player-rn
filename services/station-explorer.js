const host = 'https://de1.api.radio-browser.info';

class StationExplorer {
  constructor() {
    this.countries = [];
    this.languages = [];
    this.states = [];
    this.tags = [];
    this.countriesReady = false;
    this.languagesReady = false;
    this.statesReady = false;
    this.tagsReady = false;
    this.prepCategories().then(() => {});
  }

  async prepCategories() {
    let that = this;
    let countriesPromise = this.fetchCountries().then(countries => {
      that.countries = countries;
      this.countriesReady = true;
    });
    let languagesPromise = this.fetchLanguages().then(languages => {
      that.languages = languages;
      this.languagesReady = true;
    });
    let statesPromise = this.fetchStates().then(states => {
      that.states = states;
      this.statesReady = true;
    });
    let tagsPromise = this.fetchTags().then(tags => {
      that.tags = tags;
      this.tagsReady = true;
    });
    await countriesPromise;
    await languagesPromise;
    await statesPromise;
    await tagsPromise;
    return Promise.resolve();
  }

  async fetchCountries() {
    let response = await fetch(host + '/json/countries');
    if (response.status === 200) {
      return response.json();
    }
  }

  async fetchLanguages() {
    let response = await fetch(host + '/json/languages');
    if (response.status === 200) {
      return response.json();
    }
  }

  async fetchStates() {
    let response = await fetch(host + '/json/states');
    if (response.status === 200) {
      return response.json();
    }
  }

  async fetchTags() {
    let response = await fetch(host + '/json/tags');
    if (response.status === 200) {
      return response.json();
    }
  }

  areCategoriesReady() {
    return (
      this.countriesReady &&
      this.languagesReady &&
      this.statesReady &&
      this.tagsReady
    );
  }

  getCountries() {
    return this.countries;
  }

  async getStationsInCountry(country) {
    let response = await fetch(
      host + '/json/stations/bycountryexact/' + country,
    );
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error(
        'Error in call to get stations by country in ' + country + '.',
      );
    }
  }

  getLanguages() {
    return this.languages;
  }

  async getStationsByLanguage(language) {
    let response = await fetch(
      host + '/json/stations/bylanguageexact/' + language,
    );
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error(
        'Error in call to get stations by language in ' + language + '.',
      );
    }
  }

  getStates() {
    return this.states;
  }

  async getStationsByStateInCountry(country, state) {
    let response = await fetch(host + '/json/stations/search\n' + country, {
      body: {
        country: country,
        state: state,
      },
      method: 'POST',
    });
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error(
        'Error in call to get stations in state: ' +
          state +
          ', ' +
          country +
          '.',
      );
    }
  }

  getTags() {
    return this.tags;
  }

  async getStationsByTag(tag) {
    let response = await fetch(host + '/json/stations/bytag/' + tag);
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error(
        'Error in call to get stations by tag. Tag: ' + tag + '.',
      );
    }
  }

  async searchStationsByName(name) {
    let response = await fetch(host + '/json/stations/byname/' + name);
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error(
        'Error in call to search stations by name with search term: ' +
          name +
          '.',
      );
    }
  }
}

export default StationExplorer;
