import React from 'react';
import {
  Button,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import AsyncStorage from '@react-native-community/async-storage';
import {Picker} from '@react-native-community/picker';
import ReactNativeModal from 'react-native-modal';

import DefaultStations from './const/default-stations';

import TrackPlayer from 'react-native-track-player';
import Station from './obj/station';
import StationExplorer from './services/station-explorer';
import Categories from './services/station-categories';

class App extends React.Component {
  constructor(props) {
    super(props);

    TrackPlayer.registerEventHandler(() => {});
    this.stationExplorer = new StationExplorer();

    let defaultStationIds = [];
    for (let defaultStation of DefaultStations) {
      defaultStationIds.push(defaultStation.id);
    }

    this.state = {
      categoriesReady: false,
      newTitle: 'Title',
      newUrl: 'URL',
      newGenre: 'Genre',
      newArtwork: 'Artwork URL',
      editTitle: 'Title',
      editUrl: 'URL',
      editGenre: 'Genre',
      editArtwork: 'Artwork URL',
      addStationVisible: false,
      directoryStationSelectVisible: false,
      advancedAddStationVisible: false,
      editStationsVisible: false,
      stationEditorVisible: false,
      stationEditorIndex: 0,
      playPressed: false,
      stations: DefaultStations,
      stationIdsList: defaultStationIds,
      selectedStation: 0,
      countries: [],
      countryItems: [],
      languages: [],
      languageItems: [],
      states: [],
      stateItems: [],
      tags: [],
      tagItems: [],
      directoryStations: [],
      selectedCountryAdd: 'Select Country...',
      selectedLanguageAdd: 'Select Country...',
      selectedStateAdd: 'Select State...',
      selectedTagAdd: 'Select Tag/Genre...',
      directorySearchTerms: '',
    };

    let that = this;
    this.stationExplorer.prepCategories().then(() => {
      that.state.countries = that.stationExplorer.getCountries();
      that.state.countryItems = that.state.countries.map(
        (country, curCountry) => {
          return (
            <Picker.Item
              label={country.name + ' (' + country.stationcount + ')'}
              value={curCountry}
              key={country.name}
            />
          );
        },
      );
      that.state.languages = that.stationExplorer.getLanguages();
      that.state.languageItems = that.state.languages.map(
        (language, curLanguage) => {
          return (
            <Picker.Item
              label={language.name + ' (' + language.stationcount + ')'}
              value={curLanguage}
              key={language.name}
            />
          );
        },
      );
      that.state.states = that.stationExplorer.getStates();
      that.state.stateItems = that.state.states.map((state, curState) => {
        return (
          <Picker.Item
            label={
              state.name +
              ', ' +
              state.country +
              ' (' +
              state.stationcount +
              ')'
            }
            value={curState}
            key={state.name}
          />
        );
      });
      that.state.tags = that.stationExplorer.getTags();
      that.state.tagItems = that.state.tags.map((tag, curTag) => {
        return (
          <Picker.Item
            label={tag.name + ' (' + tag.stationcount + ')'}
            value={curTag}
            key={tag.name}
          />
        );
      });
      that.state.categoriesReady = true;
    });

    const start = async () => {
      // Set up the player
      await TrackPlayer.setupPlayer();

      let startStation = DefaultStations[0];

      // Add a track to the queue
      await TrackPlayer.add({
        id: startStation.id,
        url: startStation.url,
        title: startStation.title,
        genre: startStation.genre,
        artwork: startStation.artwork,
      });
    };
    start();
  }

  async componentDidMount() {
    AsyncStorage.getItem('stations').then(async stations => {
      if (stations === null) {
        await AsyncStorage.setItem('stations', JSON.stringify(DefaultStations));
      } else {
        this.setState({stations: JSON.parse(stations)});
      }
    });

    AsyncStorage.getItem('selStation').then(async selectedStation => {
      if (selectedStation === null) {
        await AsyncStorage.setItem('selStation', '0');
      } else {
        this.setState({selectedStation: Number.parseInt(selectedStation)});
      }
    });
  }

  async changeStation(stationIndex) {
    let newStation = this.state.stations[stationIndex];
    this.setState({
      selectedStation: stationIndex,
      playPressed: true,
    });
    await TrackPlayer.stop();
    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: newStation.id,
      url: newStation.url,
      title: newStation.title,
      genre: newStation.genre,
      artwork: newStation.artwork,
    });
    TrackPlayer.play();
    await AsyncStorage.setItem('selStation', stationIndex.toString());
  }

  showStationsForAdd(category, param) {
    switch (category) {
      case Categories.COUNTRY:
        this.stationExplorer
          .getStationsInCountry(this.state.countries[param].name)
          .then(response => this.displayDirectoryStations(response));
        break;
      case Categories.LANGUAGE:
        this.stationExplorer
          .getStationsByLanguage(this.state.languages[param].name)
          .then(response => this.displayDirectoryStations(response));
        break;
      case Categories.STATE:
        this.stationExplorer
          .getStationsByStateInCountry(
            this.state.states[param].name,
            this.state.states[param].country,
          )
          .then(response => this.displayDirectoryStations(response));
        break;
      case Categories.TAG:
        this.stationExplorer
          .getStationsByTag(this.state.tags[param].name)
          .then(response => this.displayDirectoryStations(response));
        break;
      case Categories.NAME:
        this.stationExplorer
          .searchStationsByName(param)
          .then(response => this.displayDirectoryStations(response));
        break;
      default:
        throw new Error(
          'Attempted to show stations for unrecognised category - failed.',
        );
    }
  }

  displayDirectoryStations(directoryStations) {
    this.setState({
      directoryStations: directoryStations,
      directoryStationSelectVisible: true,
    });
  }

  addStationManual() {
    let stations = this.state.stations;
    let newStation = new Station(
      this.genIdFromTitle(this.state.newTitle),
      this.state.newUrl,
      this.state.newTitle,
      this.state.newGenre,
      this.state.newArtwork,
    );
    stations.push(newStation);
    let newIdsList = this.getStationIds(stations);
    this.setState({
      stations: stations,
      stationIdsList: newIdsList,
      newTitle: 'Title',
      newUrl: 'URL',
      newGenre: 'Genre',
      newArtwork: 'Artwork URL',
    });
    AsyncStorage.setItem('stations', JSON.stringify(stations));
  }

  addStationDirectory(index) {
    let stations = this.state.stations;
    let dirStation = this.state.directoryStations[index];
    if (this.state.stationIdsList.indexOf(dirStation.stationuuid) !== -1) {
      return;
    }
    let genre = '';
    if (dirStation.tags !== null && dirStation.tags !== '') {
      if (dirStation.tags.indexOf(',') === -1) {
        genre = dirStation.tags;
      } else {
        genre = dirStation.tags.split(',')[0];
      }
    }
    let newStation = new Station(
      dirStation.stationuuid,
      dirStation.url_resolved,
      dirStation.name,
      genre,
      dirStation.favicon,
    );
    stations.push(newStation);
    let newIdsList = this.getStationIds(stations);
    this.setState({
      stations: stations,
      stationIdsList: newIdsList,
    });
    AsyncStorage.setItem('stations', JSON.stringify(stations));
  }

  saveEditedStation() {
    let stations = this.state.stations;
    let newStation = new Station(
      this.genIdFromTitle(this.state.editTitle),
      this.state.editUrl,
      this.state.editTitle,
      this.state.editGenre,
      this.state.editArtwork,
    );
    stations[this.state.stationEditorIndex] = newStation;
    let newIdsList = this.getStationIds(stations);
    this.setState({stations: stations, stationIdsList: newIdsList});
    AsyncStorage.setItem('stations', JSON.stringify(stations));
  }

  getStationIds(stations) {
    let idsList = [];
    for (let station of stations) {
      idsList.push(station.id);
    }
    return idsList;
  }

  editStation(stationIndex) {
    let station = this.state.stations[stationIndex];
    this.setState({
      stationEditorVisible: true,
      stationEditorIndex: stationIndex,
      editTitle: station.title,
      editUrl: station.url,
      editGenre: station.genre,
      editArtwork: station.artwork,
    });
  }

  deleteStation(stationIndex) {
    let stations = this.state.stations;
    stations.splice(stationIndex, 1);
    let newIdsList = this.getStationIds(stations);
    this.setState({stations: stations, stationIdsList: newIdsList});
    AsyncStorage.setItem('stations', JSON.stringify(stations));
  }

  genIdFromTitle(title) {
    let id = title;
    id = id.trim();
    id = id.toLowerCase();
    id = id.replace(' ', '-');
    for (let station of this.state.stations) {
      if (station.id === id) {
        id = this.getAvailableId(id);
      }
    }
    return id;
  }

  getAvailableId(id) {
    let idFound = true;
    let suffix = 0;
    while (idFound) {
      idFound = false;
      for (let station of this.state.stations) {
        if (id + '-' + suffix === station.id) {
          idFound = true;
          suffix++;
        }
      }
    }
    return id + '-' + suffix;
  }

  render() {
    let selectedStation = this.state.stations[this.state.selectedStation];
    let stationItems = this.state.stations.map((station, curStation) => {
      return (
        <Picker.Item
          label={station.title}
          value={curStation}
          key={station.id}
        />
      );
    });

    return (
      <>
        <SafeAreaView style={styles}>
          <Button
            onPress={() => {
              this.setState({playPressed: !this.state.playPressed});
              if (this.state.playPressed) {
                TrackPlayer.stop();
              } else {
                TrackPlayer.play();
              }
            }}
            title={this.state.playPressed ? 'Stop' : 'Play'}
            color="black"
            accessibilityLabel="Play or stop the station"
          />
          <Picker
            selectedValue={this.state.selectedStation}
            onValueChange={value => this.changeStation(value)}>
            {stationItems}
          </Picker>
          <Image
            source={{uri: selectedStation.artwork}}
            style={{width: 400, height: 400}}
          />
          <Button
            title="Add Station"
            accessibilityLabel="Add a station."
            onPress={() => {
              this.setState({
                addStationVisible: true,
                advancedAddStationVisible: false,
                newTitle: 'Title',
                newUrl: 'Url',
                newGenre: 'Genre',
                newArtwork: 'Artwork Url',
                directorySearchTerms: '',
              });
            }}
          />
          <Button
            title="Edit Stations"
            accessibilityLabel="Edit or delete stations."
            onPress={() => {
              this.setState({editStationsVisible: true});
            }}
          />

          <ReactNativeModal
            style={{backgroundColor: 'white'}}
            isVisible={this.state.addStationVisible}>
            <Picker
              selectedValue={this.state.selectedCountryAdd}
              onValueChange={value =>
                this.showStationsForAdd(Categories.COUNTRY, value)
              }>
              {this.state.countryItems}
            </Picker>
            <Picker
              selectedValue={this.state.selectedLanguageAdd}
              onValueChange={value =>
                this.showStationsForAdd(Categories.LANGUAGE, value)
              }>
              {this.state.languageItems}
            </Picker>
            <Picker
              selectedValue={this.state.selectedStateAdd}
              onValueChange={value =>
                this.showStationsForAdd(Categories.STATE, value)
              }>
              {this.state.stateItems}
            </Picker>
            <Picker
              selectedValue={this.state.selectedTagAdd}
              onValueChange={value =>
                this.showStationsForAdd(Categories.TAG, value)
              }>
              {this.state.tagItems}
            </Picker>
            <Text>Search:</Text>
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1}}
              onChangeText={text => {
                this.setState({directorySearchTerms: text});
              }}
              value={this.state.directorySearchTerms}
            />
            <Button
              title="Search"
              accessibilityLabel="Search for stations"
              onPress={() => {
                this.showStationsForAdd(
                  Categories.NAME,
                  this.state.directorySearchTerms,
                );
              }}
            />
            <Button
              title="Advanced Options/Manual"
              accessibilityLabel="Show advanced add options"
              onPress={() => {
                this.setState({
                  advancedAddStationVisible: true,
                });
              }}
            />
            <Button
              title="Cancel"
              accessibilityLabel="Cancel adding stations"
              onPress={() => {
                this.setState({
                  addStationVisible: false,
                });
              }}
            />

            <ReactNativeModal
              style={{backgroundColor: 'white'}}
              isVisible={this.state.directoryStationSelectVisible}>
              <View style={{flex: 1}}>
                <Text>Press Stations to Add...</Text>
                <FlatList
                  data={this.state.directoryStations}
                  renderItem={({item, index}) => (
                    <Text
                      onPress={() => this.addStationDirectory(index)}
                      style={{
                        color:
                          this.state.stationIdsList.indexOf(item.stationuuid) >
                          -1
                            ? 'green'
                            : 'red',
                      }}>
                      {item.name}
                    </Text>
                  )}
                />
                <Button
                  title="Done"
                  accessibilityLabel="Finish adding stations."
                  onPress={() => {
                    this.setState({
                      directoryStationSelectVisible: false,
                    });
                  }}
                />
              </View>
            </ReactNativeModal>

            <ReactNativeModal
              style={{backgroundColor: 'white'}}
              isVisible={this.state.advancedAddStationVisible}>
              <View style={{flex: 1}}>
                <Text>Add Station</Text>
                <TextInput
                  style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                  onChangeText={text => {
                    this.setState({newTitle: text});
                  }}
                  value={this.state.newTitle}
                />
                <TextInput
                  style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                  onChangeText={text => {
                    this.setState({newUrl: text});
                  }}
                  value={this.state.newUrl}
                />
                <TextInput
                  style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                  onChangeText={text => {
                    this.setState({newGenre: text});
                  }}
                  value={this.state.newGenre}
                />
                <TextInput
                  style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                  onChangeText={text => {
                    this.setState({newArtwork: text});
                  }}
                  value={this.state.newArtwork}
                />
                <Button
                  title="Add"
                  accessibilityLabel="Add this station."
                  onPress={() => {
                    this.addStationManual();
                    this.setState({advancedAddStationVisible: false});
                  }}
                />
                <Button
                  title="Cancel"
                  accessibilityLabel="Cancel adding a station."
                  onPress={() => {
                    this.setState({advancedAddStationVisible: false});
                  }}
                />
              </View>
            </ReactNativeModal>
          </ReactNativeModal>

          <ReactNativeModal
            style={{backgroundColor: 'white'}}
            isVisible={this.state.editStationsVisible}>
            <View style={{flex: 1}}>
              <Text>Edit Stations</Text>
              <FlatList
                data={this.state.stations}
                renderItem={({item, index}) => (
                  <Text onPress={() => this.editStation(index)}>
                    {item.title}
                  </Text>
                )}
              />
              <Button
                title="Done"
                accessibilityLabel="Finish editing stations."
                onPress={() => {
                  this.setState({
                    editStationsVisible: false,
                  });
                }}
              />
            </View>
          </ReactNativeModal>

          <ReactNativeModal
            style={{backgroundColor: 'white'}}
            isVisible={this.state.stationEditorVisible}>
            <View style={{flex: 1}}>
              <Text>{'Edit ' + this.state.editTitle}</Text>
              <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                onChangeText={text => {
                  this.setState({editTitle: text});
                }}
                value={this.state.editTitle}
              />
              <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                onChangeText={text => {
                  this.setState({editUrl: text});
                }}
                value={this.state.editUrl}
              />
              <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                onChangeText={text => {
                  this.setState({editGenre: text});
                }}
                value={this.state.editGenre}
              />
              <TextInput
                style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                onChangeText={text => {
                  this.setState({editArtwork: text});
                }}
                value={this.state.editArtwork}
              />
              <Button
                title="Done"
                accessibilityLabel="Save this station."
                onPress={() => {
                  this.saveEditedStation();
                  this.setState({stationEditorVisible: false});
                }}
              />
              <Button
                title="Cancel"
                accessibilityLabel="Cancel editing a station."
                onPress={() => {
                  this.setState({
                    stationEditorVisible: false,
                  });
                }}
              />
              <Button
                title="Delete"
                accessibilityLabel="Delete a station."
                onPress={() => {
                  this.deleteStation(this.state.stationEditorIndex);
                  this.setState({
                    stationEditorVisible: false,
                  });
                }}
              />
            </View>
          </ReactNativeModal>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  SafeAreaView: {
    backgroundColor: Colors.black,
  },
});

export default App;
