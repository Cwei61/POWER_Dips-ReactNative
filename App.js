import * as React from 'react';
import { Text, View, Button, TouchableOpacity, StyleSheet, TextInput, Alert, Dimensions } from 'react-native';
import Constants from 'expo-constants';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useState } from 'react';
import { AsyncStorage } from 'react-native';
import axios from 'axios';

const GOOGLE_PLACES_API_KEY = 'AIzaSyB6FP1YtOL8FaD-GC10YnhMd_SIXIYfNkE'; // never save your real api key in a snack!

const App = () => {
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalStep = 3;

  const progressBarStyle = () => {

    if (currentStep < totalStep) {
      return {
      position: 'absolute', 
      left: 0, 
      top: 0, 
      width: Dimensions.get('window').width * currentStep / totalStep, 
      height: '100%', 
      backgroundColor: '#def86a', 
      zIndex: -1, 
      borderBottomLeftRadius: 10, 
      borderTopLeftRadius: 10, 
    };
  }

    return {
      position: 'absolute', 
      left: 0, 
      top: 0, 
      width: Dimensions.get('window').width * currentStep / totalStep, 
      //width: 50, 
      height: '100%', 
      backgroundColor: '#def86a', 
      zIndex: -1, 
    };
  }

  return (
    <View style={styles.container}>
      <View style={{
        justifyContent: 'center', 
        alignItems: 'center', 
      }}>
        <View style={ progressBarStyle()}></View>
        <Text style={{
          fontSize: 30, 
        }}>{currentStep} / {totalStep} </Text>
      </View>
      <View style={{padding: 10, flex: 1}}>
        { currentStep == 1 && 
          <View style={styles.step}>
            <Text style={styles.text}>Please choose your location: </Text>
            <GooglePlacesAutocomplete
              style={{
                paddingRight: 10, 
                paddingLeft: 10, 
              }}
              placeholder="Search"
              query={{
                key: GOOGLE_PLACES_API_KEY,
                language: 'zh-TW', // language of the results
                currentLocation: true, 
                components: 'country:tw', 
              }}
              onPress={(data, details = null) => {
                //Alert.alert("Location", JSON.stringify(details.geometry));

                axios.get('https://maps.googleapis.com/maps/api/place/details/json?place_id=' + details.place_id + '&fields=name,geometry%2Crating%2Cformatted_phone_number&key=' + GOOGLE_PLACES_API_KEY)
                  .then((response) => {
                    Alert.alert("GEOMETRY", response.data.result.geometry.location.lat.toString() + ' / ' + response.data.result.geometry.location.lng.toString());

                    _storeData = async () => {
                      try {
                        await AsyncStorage.setItem('currentLocationLat', response.data.result.geometry.location.lat.toString());
                        await AsyncStorage.setItem('currentLocationLng', response.data.result.geometry.location.lng.toString());
                      } catch(error) {
                        console.log('Error while storing current location');
                      }
                    };
                    _storeData();
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              }}
              onFail={(error) => {console.error(error); Alert.alert("Error", error)}}
              requestUrl={{
                url:
                  'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api',
                useOnPlatform: 'web',
              }} // this in only required for use on the web. See https://git.io/JflFv more for details.
            />
          </View>
        }
      </View>
      { currentStep == 2 && 
        <View style={styles.step}>
          <Text>This is the content within step 2!</Text>
        </View>
      }
      { currentStep == totalStep && 
        <View style={styles.step}>
          <Text>This is the content within step 3!</Text>
        </View>
      }
      <View style={{
        justifyContent: 'space-between', 
        flexDirection: 'row', 
        margin: 20, 
      }}>
        { currentStep != 1 ? 
          <TouchableOpacity style={styles.previousButton} 
          onPress={() => {
            if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
            }
          }}>
            <Text style={{color: '#faf2a1'}}>Back</Text>
          </TouchableOpacity> : 
          <View></View>
        }
        { currentStep != totalStep ? 
          <TouchableOpacity style={styles.nextButton}
          onPress={() => {
            if (currentStep < totalStep) {
              setCurrentStep(currentStep + 1);
            }
            _retrieveData = async () => {
              try {
                const lat = await AsyncStorage.getItem('currentLocationLat');
                if (lat == null) {
                  console.log("Lat is null");
                }
                const lng = await AsyncStorage.getItem('currentLocationLng');
                if (lng == null) {
                  console.log("Lng is null");
                }
                Alert.alert('GEOMETRY', lat + ' / ' + lng);
              } catch (error) {
                console.log(error);
              }
            };
            _retrieveData();
          }}>
            <Text>Next</Text>
          </TouchableOpacity> : 
          <TouchableOpacity style={styles.fetchButton}
          onPress={() => { }}>
            <Text>Fetch</Text>
          </TouchableOpacity>
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: Constants.statusBarHeight + 10,
    backgroundColor: '#faf2a1', 
    //backgroundColor: '#ecf0f1',
  },
  text: {
    paddingBottom: 10, 
    paddingRight: 10, 
  }, 
  step: {
    flex: 1, 
  }, 
  nextButton: {
    backgroundColor: '#def86a', 
    paddingTop: 10, 
    paddingBottom: 10, 
    paddingRight: 15, 
    paddingLeft: 15, 
    borderRadius: 10, 
    overflow: 'hidden', 
  }, 
  previousButton: {
    backgroundColor: '#6a8d92', 
    paddingTop: 10, 
    paddingBottom: 10, 
    paddingRight: 15, 
    paddingLeft: 15, 
    borderRadius: 10, 
    overflow: 'hidden', 
  }, 
  fetchButton: {
    backgroundColor: '#def86a', 
    paddingTop: 10, 
    paddingBottom: 10, 
    paddingRight: 15, 
    paddingLeft: 15, 
    borderRadius: 10, 
    overflow: 'hidden', 
  }
});

export default App;
