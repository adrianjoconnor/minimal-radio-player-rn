import React from 'react';
import {SafeAreaView, StyleSheet, Button} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import TrackPlayer from 'react-native-track-player';

const App: () => React$Node = () => {
  const start = async () => {
    // Set up the player
    await TrackPlayer.setupPlayer();

    // Add a track to the queue
    await TrackPlayer.add({
      id: 'dhr-1', // Must be a string, required
      url: 'https://deephouseradio.radioca.st/;', // Load media from the network
      title: 'DHR',
      artist: 'DHR',
      album: 'DHR',
      genre: 'Deep House',
      date: '2014-05-20T07:00:00+00:00',
      artwork:
        'https://static.wixstatic.com/media/da966a_f481c5b94e8c4747ad03b3a14a4c7d9d~mv2.jpg/v1/fit/w_2500,h_1330,al_c/da966a_f481c5b94e8c4747ad03b3a14a4c7d9d~mv2.jpg',
    });
  };
  start();
  return (
    <>
      <SafeAreaView style={styles}>
        <Button
          onPress={() => {
            TrackPlayer.play();
          }}
          title="Play"
          color="black"
          accessibilityLabel="Play the station"
        />
        <Button
          onPress={() => {
            TrackPlayer.stop();
          }}
          title="Stop"
          color="black"
          accessibilityLabel="Stop the station playing"
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.black,
  },
});

export default App;
