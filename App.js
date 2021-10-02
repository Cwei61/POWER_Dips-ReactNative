import * as React from 'react';
import { Text, View, ScrollView, Button, TouchableOpacity, StyleSheet, TextInput, Alert, Dimensions, Platform, SafeAreaView } from 'react-native';
import Constants from 'expo-constants';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useState } from 'react';
import { AsyncStorage } from 'react-native';
import axios from 'axios';
//import Date from './view/date_choose'
import SelectDropdown from 'react-native-select-dropdown'
import DateTimePicker from '@react-native-community/datetimepicker';
//import { Select, Option } from 'react-native-select-list';


const GOOGLE_PLACES_API_KEY = 'AIzaSyB6FP1YtOL8FaD-GC10YnhMd_SIXIYfNkE';

// parameter to call data
const parameter = {
  longitude: '',
  latitude: '',
  temporal_avg: '',
  start_date: '',
  end_date: '',
}

const getData = async () => {
  try {
    const response = await fetch(
      'https://power.larc.nasa.gov/api/temporal/hourly/point?parameters=T2M&community=SB&longitude=0&latitude=0&start=20170101&end=20170102&format=json'
    );
    const json = await response.json()['properties']['parameter']['T2M'];
    let data = []
    data[0] = Object.keys(json)
    for (let i = 0; i < time.length; i++) {
      data[1][i] = data[time[i]]
    }
    console.log(data)
    return data;
  } catch (error) {
    console.error(error);
  }
};

const App = () => {

  const [currentStep, setCurrentStep] = useState(1);
  const totalStep = 4;
  const [canPass, setCanPass] = useState(false);

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
    else {
      return {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#def86a',
        zIndex: -1,
        borderRadius: 10,
      };
    }
  };

  const period_selection = [
    "Climatology",
    "Monthly & Annual",
    "Daily",
    "Hourly",
  ];
  const [start_date, setStartDate] = useState(new Date(1598051730000));
  const [end_date, setEndDate] = useState(new Date(1598051730000));
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);


  const onStartChange = (event, selectedDate) => {
    var currentStartDate = selectedDate || start_date;
    setShow(Platform.OS === 'ios');
    setStartDate(currentStartDate);
    console.log(currentStartDate);
  };

  const onEndChange = (event, selectedDate) => {
    var currentEndDate = selectedDate || end_date;
    setShow(Platform.OS === 'ios');
    setEndDate(currentEndDate);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };


  return (
    <View style={styles.container}>
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={progressBarStyle()}></View>
        <Text style={{
          fontSize: 30,
        }}>{currentStep} / {totalStep} </Text>
      </View>
      <View style={{ padding: 10, flex: 1 }}>
        {currentStep == 1 ?
          <View style={styles.step}>
            <Text style={styles.text}>Please choose your location: </Text>
            <GooglePlacesAutocomplete
              style={{
                paddingRight: 10,
                paddingLeft: 10,
              }}
              placeholder="Search location"
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
                    //Alert.alert("GEOMETRY", response.data.result.geometry.location.lat.toString() + ' / ' + response.data.result.geometry.location.lng.toString());

                    _storeData = async () => {
                      try {
                        await AsyncStorage.setItem('currentLocationLat', response.data.result.geometry.location.lat.toString());
                        await AsyncStorage.setItem('currentLocationLng', response.data.result.geometry.location.lng.toString());
                      } catch (error) {
                        console.log('Error while storing current location');
                      }
                    };
                    _storeData();
                    setCanPass(true);
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              }}
              onFail={(error) => { console.error(error); Alert.alert("Error", error) }}
              requestUrl={{
                url:
                  'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api',
                useOnPlatform: 'web',
              }} // this in only required for use on the web. See https://git.io/JflFv more for details.
            />
          </View>
          : <View></View>
        }
        {currentStep == 2 ?
          <ScrollView style={[styles.step, {}]}>
            <Text style={styles.text}>Please choose a Temporal Average: </Text>
            <SelectDropdown
              data={period_selection}
              onSelect={(selectedItem, index) => {
                console.log(selectedItem, index)
              }}
              buttonTextAfterSelection={(selectedItem, index) => {
                // text represented after item is selected
                // if data array is an array of objects then return selectedItem.property to render after item is selected
                return selectedItem
              }}
              rowTextForSelection={(item, index) => {
                // text represented for each item in dropdown
                // if data array is an array of objects then return item.property to represent item in dropdown
                return item
              }}
            />
          </ScrollView>
          : <View></View>
        }
        {currentStep == 3 ?
          <SafeAreaView style={[styles.step, {}]}>
            {Platform.OS === 'android' ?
              <Button title="Select Start Date: " onPress={showDatepicker} /> :
              <Text style={{
                textAlign: "center",
                color: "blue",
                fontWeight: "bold",
                fontSize: 20,
              }}>
                Select Start Date: </Text>
            }
            {(Platform.OS === 'ios' || show) &&
              <DateTimePicker
                testID="dateTimePicker"
                value={start_date}
                mode={mode}
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onStartChange}
              />
            }

            {/*{Platform.OS === 'android' ?
              <Button title="Select End Date: " onPress={showDatepicker} /> :
              <Text style={{
                textAlign: "center",
                color: "blue",
                fontWeight: "bold",
                fontSize: 20,
              }}>
                Select End Date: </Text>
            }
            {(Platform.OS === 'ios' || show) &&
              <DateTimePicker
                testID="dateTimePicker"
                value={end_date}
                mode={mode}
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onEndChange}
              />
            }*/}
          </SafeAreaView>
          : <View></View>
        }
        {currentStep == totalStep ?
          <View style={styles.step}>
            <Text>This is the content within step 3!</Text>
          </View>
          : <View></View>
        }
      </View>
      <View style={{
        justifyContent: 'space-between',
        flexDirection: 'row',
        margin: 20,
      }}>
        {currentStep != 1 ?
          <TouchableOpacity style={styles.previousButton}
            onPress={() => {
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
              }
            }}>
            <Text style={{ color: '#faf2a1' }}>Back</Text>
          </TouchableOpacity> :
          <View></View>
        }
        {currentStep != totalStep ?
          <TouchableOpacity style={canPass ? styles.nextButton : styles.nextButtonDisabled} /*disabled={!canPass}*/
            onPress={() => {
              //setCanPass(false);
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
                  //Alert.alert('GEOMETRY', lat + ' / ' + lng);
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
    backgroundColor: '#e3ebff'
    //backgroundColor: '#faf2a1', 
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
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 20,
    paddingLeft: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  nextButtonDisabled: {
    backgroundColor: '#bed84a',
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 20,
    paddingLeft: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  previousButton: {
    backgroundColor: '#6a8d92',
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 20,
    paddingLeft: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  fetchButton: {
    backgroundColor: '#def86a',
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 20,
    paddingLeft: 20,
    borderRadius: 10,
    overflow: 'hidden',
  }
});

export default App;
