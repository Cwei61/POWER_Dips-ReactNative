import React, { Component } from 'react';
import { View } from 'react-native';

class Predict extends Component {

  state = {
    currentStep: 0,
    totalStep: 3,
  };

  render() {
    return (
      <View style={styles.container}>
        {currentStep > 0 && currentStep < totalStep ?
          <View style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={progressBarStyle()}></View>
            <Text style={{
              fontSize: 30,
            }}>{currentStep} / {totalStep - 1} </Text>
          </View>
          : <View></View>
        }
        <View style={{ padding: 10, flex: 1 }}>
          {currentStep == 0 ?
            <ScrollView>
              <Text style={styles.text}> Menu </Text>
              <Button onPress={setCurrentStep.bind(this, currentStep + 1)} title="Start" />
            </ScrollView>
            : <View></View>
          }
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
                      parameter.latitude = response.data.result.geometry.location.lat
                      parameter.longitude = response.data.result.geometry.location.lng
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
              <Text style={styles.text}>Please choose a Temporal Resolution: </Text>
              <SelectDropdown
                data={period_selection}
                onSelect={(selectedItem, index) => {
                  parameter.temporal_avg = selectedItem.toLowerCase();
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                  return selectedItem
                }}
                rowTextForSelection={(item, index) => {
                  return item
                }}
              />
            </ScrollView>
            : <View></View>
          }
          {currentStep == 3 ?
            <SafeAreaView style={styles.dateStartButton}>


              {Platform.OS === 'android' ?
                <Button style={styles.dateButton} title="Select Start Date: " onPress={startInput.showDatepicker} /> :
                <Text style={{
                  textAlign: "center",
                  color: "blue",
                  fontWeight: "bold",
                  fontSize: 20,
                }}>
                  Select Start Date: </Text>
              }
              {(Platform.OS === 'ios' || startInput.show) &&
                <DateTimePicker
                  testID="dateTimePickerStart"
                  value={startInput.date}
                  mode={startInput.mode}
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={startInput.onChange}
                />
              }

              <View style={styles.dateButton}>
                {Platform.OS === 'android' ?
                  <Button title="Select End Date: " onPress={endInput.showDatepicker} /> :
                  <Text style={{
                    textAlign: "center",
                    color: "blue",
                    fontWeight: "bold",
                    fontSize: 20,
                  }}>
                    Select End Date: </Text>
                }
                {(Platform.OS === 'ios' || endInput.show) &&
                  <DateTimePicker
                    testID="dateTimePickerEnd"
                    value={endInput.date}
                    mode={endInput.mode}
                    is24Hour={true}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={endInput.onChange}
                  />
                }
              </View>
            </SafeAreaView>
            : <View></View>
          }
          {currentStep == 4 ?
            <ScrollView style={[styles.step, {}]}>
              <Text style={styles.text}>Select Parameters: </Text>
              <SelectDropdown
                data={Object.keys(data_category)}
                onSelect={(selectedItem, index) => {
                  parameter.category = data_category[selectedItem]
                }}
                buttonTextAfterSelection={(selectedItem, index) => {
                  return selectedItem
                }}
                rowTextForSelection={(item, index) => {
                  return item
                }}
              />
            </ScrollView>
            : <View></View>
          }
          {currentStep == totalStep && result == 'No data found'?
            <ScrollView>
              <Text style={styles.text}> Sorry, we can't get this data for you. Try other parameters.</Text>
              <Button onPress={setCurrentStep.bind(this, 0)} title="Back To Menu ->" />
            </ScrollView>
            : <View></View> 
          }        
          {currentStep == totalStep  && result != 'No data found'?
            <ScrollView>
              <Text style={styles.text}> Result page</Text>
              <ScrollView horizontal={true} >
                <LineChart style={styles.chart}
                  data={
                    {
                      labels: result[0],
                      datasets: [
                        {
                          data: result[1],
                          color: (opacity = 1) => `rgba(30,144,255,${opacity})`, // optional
                          strokeWidth: 2 // optional
                        }
                      ],
                      legend: ["Solar Power KW/m^2"] // optional

                    }
                  }
                  width={screenWidth}
                  height={250}
                  chartConfig={chartConfig}
                />
              </ScrollView>
              <Button onPress={setCurrentStep.bind(this, 0)} title="Back To Menu ->" />
            </ScrollView>
            : <View></View>
          }
        </View>
        <View style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          margin: 20,
        }}>
          {currentStep > 0 && currentStep < totalStep ?
            <TouchableOpacity style={styles.previousButton}
              onPress={() => {
                if (currentStep > 0) {
                  setCurrentStep(currentStep - 1);
                }
              }}>
              <Text style={{ color: '#faf2a1' }}>Back</Text>
            </TouchableOpacity> :
            <View></View>
          }
          {currentStep > 0 && currentStep < totalStep - 1 ?
            <TouchableOpacity style={canPass ? styles.nextButton : styles.nextButtonDisabled} /*disabled={!canPass}*/
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
                    //Alert.alert('GEOMETRY', lat + ' / ' + lng);
                  } catch (error) {
                    console.log(error);
                  }
                }
                _retrieveData();
              }}>
              <Text>Next</Text>
            </TouchableOpacity>
            :
            <View>
              {currentStep == totalStep - 1 ?
                <TouchableOpacity style={styles.fetchButton}
                  onPress={() => {
                    getData().then(() => {
                      setCurrentStep(currentStep + 1)
                    })
                  }}>
                  <Text>Fetch</Text>
                </TouchableOpacity> :
                <View></View>
              }
            </View>
          }
        </View>
      </View>
    );
  }
}