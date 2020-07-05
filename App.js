import React from 'react';
import {Button, Image, SafeAreaView, StyleSheet} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import AsyncStorage from '@react-native-community/async-storage';
import {Picker} from '@react-native-community/picker';

import DefaultStations from './const/default-stations';

import TrackPlayer from 'react-native-track-player';

class App extends React.Component {
  constructor(props) {
    super(props);

    TrackPlayer.registerEventHandler(() => {});

    this.state = {
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
