import React from 'react';
import {
  Button,
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

class App extends React.Component {
  constructor(props) {
    super(props);

    TrackPlayer.registerEventHandler(() => {});

    this.state = {
      newTitle: 'Title',
      newUrl: 'URL',
      newGenre: 'Genre',
      newArtwork: 'Artwork URL',
      addStationVisible: false,
      playPressed: false,
      stations: DefaultStations,
      selectedStation: 0,
    };

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
  }

  addStation() {
    let stations = this.state.stations;
    let newStation = new Station(
      this.genIdFromTitle(),
      this.state.newUrl,
      this.state.newTitle,
      this.state.newGenre,
      this.state.newArtwork,
    );
    stations.push(newStation);
    this.setState({stations: stations});
    AsyncStorage.setItem('stations', JSON.stringify(stations));
  }

  genIdFromTitle() {
    let id = this.state.newTitle;
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
          <ReactNativeModal
            style={{backgroundColor: 'white'}}
            isVisible={this.state.addStationVisible}>
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
                  this.addStation();
                  this.setState({addStationVisible: false});
                }}
              />
              <Button
                title="Cancel"
                accessibilityLabel="Cancel adding a station."
                onPress={() => {
                  this.setState({addStationVisible: false});
                }}
              />
            </View>
          </ReactNativeModal>
          <Button
            title="Add Station"
            accessibilityLabel="Add a station."
            onPress={() => {
              this.setState({
                addStationVisible: true,
                newTitle: 'Title',
                newUrl: 'Url',
                newGenre: 'Genre',
                newArtwork: 'Artwork Url',
              });
            }}
          />
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.black,
  },
});

export default App;
