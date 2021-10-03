import * as React from 'react';
import { Text, View, ScrollView, Button, TouchableOpacity, StyleSheet, TextInput, Alert, Dimensions, Platform, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import Constants from 'expo-constants';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useState } from 'react';
import { AsyncStorage } from 'react-native';
import axios from 'axios';
//import Date from './view/date_choose'
import SelectDropdown from 'react-native-select-dropdown'
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart, BarChart } from "react-native-chart-kit";
import Predict from "./view/predict"
import { LinearGradient } from 'expo-linear-gradient';
import DropDownPicker from 'react-native-dropdown-picker';
import { Component } from 'react';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const GOOGLE_PLACES_API_KEY = 'AIzaSyB6FP1YtOL8FaD-GC10YnhMd_SIXIYfNkE';

const server = 'http://192.168.202.32:5000'

// parameter to call data
var parameter = {
  longitude: 0,
  latitude: 0,
  temporal_avg: '',
  start_date: '',
  end_date: '',
  category: '',
  days: 1,
}

const appTitle = "POWER\r\n DATA\r\n INTERFACE";
var result = []


const App = () => {

  let array = [];
  for(let i = 1; i <= 30; i++) {
    array.push({label: i.toString(), value: i.toString()});
  }
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState(array);
  const [fetchbtnon, setFetchbtn] = useState(true);
  //const [items, setItems] = useState([{label: 'apple', value: 'apple'}]);

  const getData = async () => {
    try {
      if(parameter.end_date < parameter.start_date){
        let tmp = parameter.end_date
        parameter.end_date = parameter.start_date
        parameter.start_date = tmp
      }
      var api_url = ''
      if (parameter.temporal_avg == 'climatology') {
        api_url = 'https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=' + parameter.category + '&community=SB&longitude=' + parameter.longitude + '&latitude=' + parameter.latitude + '&format=json'
        //api_url = 'https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=WS50M_RANGE&community=SB&longitude=0&latitude=0&format=JSON'
      }
      else if (parameter.temporal_avg == 'monthly') {
        api_url = 'https://power.larc.nasa.gov/api/temporal/' + parameter.temporal_avg + '/point?parameters=' + parameter.category + '&community=SB&longitude=' + parameter.longitude + '&latitude=' + parameter.latitude + '&start=' + parameter.start_date + '&end=' + parameter.end_date + '&format=json'
      }
      else {
        api_url = 'https://power.larc.nasa.gov/api/temporal/' + parameter.temporal_avg + '/point?parameters=' + parameter.category + '&community=SB&longitude=' + parameter.longitude + '&latitude=' + parameter.latitude + '&start=' + parameter.start_date + '&end=' + parameter.end_date + '&format=json'
      }
      //api_url = 'https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M&community=SB&longitude=0&latitude=0&format=JSON'
      //alert(api_url)
      const response = await fetch(api_url)
      
      const json_res = await response.json();
      result = JSON.stringify(json_res['messages'])
      let json_data = json_res['properties']['parameter'][parameter.category];

      let data = [[], []]
      data[0] = Object.keys(json_data)

      for (let i = 0; i < data[0].length; i++) {
        data[1][i] = json_data[data[0][i]]
      }

      result = data
      //alert(result)

    } catch (error) {
      
      //result = json_res['messages']//'No data found'
    }
  };
  const predict = async () => {
    try {
      //alert(server+'/api?lat='+parameter.latitude+'&lng='+parameter.longitude+'&days='+parameter.days+'')
      const response = await fetch(server+'/api?lat='+parameter.latitude+'&lng='+parameter.longitude+'&days='+parameter.days+'')
      
      //alert(JSON.stringify(response))
      const json_res = await response.json();
      result = json_res;
    } catch (error) {
      Alert.alert(error.toString());
    }
  };

  const [currentStep, setCurrentStep] = useState(0);
  const totalStep = 5; // 0:menu, 1~4:parm set, 5:result
  const [canPass, setCanPass] = useState(false);
  const [placeOrLatLng, setPlaceOrLatLng] = useState(true);

  const progressBarStyle = () => {

    if (currentStep < totalStep) {
      let step = currentStep;
      if (step >= totalStep) {
        step = currentStep - totalStep;
      }
      return {
        position: 'absolute',
        left: 0,
        top: 0,
        width: Dimensions.get('window').width * step / (totalStep - 1),
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
    "Monthly",
    "Daily",
    "Hourly",
  ];

  const data_category = {
    'CERES SYN1deg All Sky Surface Shortwave Downward Irradiance (kW-hr/m^2/day)': 'ALLSKY_SFC_SW_DWN',
    'CERES SYN1deg Clear Sky Surface Shortwave Downward Irradiance (kW-hr/m^2/day)': 'CLRSKY_SFC_SW_DWN',
    'MERRA-2 Wind Speed at 2 Meters (m/s)': 'WS2M',
    'CERES SYN1deg All Sky Insolation Clearness Index (dimensionless)': 'ALLSKY_KT',
    'CERES SYN1deg All Sky Normalized Insolation Clearness Index (dimensionless)': 'ALLSKY_NKT',
    'CERES SYN1deg All Sky Surface Longwave Downward Irradiance (W/m^2)': 'ALLSKY_SFC_LW_DWN',
    'CERES SYN1deg All Sky Surface PAR Total (W/m^2)': 'ALLSKY_SFC_PAR_TOT',
    'CERES SYN1deg Clear Sky Surface PAR Total (W/m^2)': 'CLRSKY_SFC_PAR_TOT',
    'CERES SYN1deg All Sky Surface UVA Irradiance (W/m^2)': 'ALLSKY_SFC_UVA',
    'CERES SYN1deg All Sky Surface UVB Irradiance (W/m^2)': 'ALLSKY_SFC_UVB',
    'CERES SYN1deg All Sky Surface UV Index (dimensionless': 'ALLSKY_SFC_UV_INDEX',
    'MERRA-2 Temperature at 2 Meters (C)': 'T2M',
    'MERRA-2 Dew/Frost Point at 2 Meters (C)': 'T2MDEW',
    'MERRA-2 Wet Bulb Temperature at 2 Meters (C)': 'T2MWET',
    'MERRA-2 Earth Skin Temperature (C)': 'TS',
    'MERRA-2 Temperature at 2 Meters Range (C)': 'T2M_RANGE',
    'MERRA-2 Temperature at 2 Meters Maximum (C)': 'T2M_MAX',
    'MERRA-2 Temperature at 2 Meters Minimum (C)': 'T2M_MIN',
    'MERRA-2 Specific Humidity at 2 Meters (g/kg)': 'QV2M',
    'MERRA-2 Relative Humidity at 2 Meters (%)': 'RH2M',
    'MERRA-2 Precipitation Corrected (mm)': 'PRECTOTCORR',
    'MERRA-2 Surface Pressure (kPa)': 'PS',
    'MERRA-2 Wind Speed at 10 Meters (m/s)': 'WS10M',
    'MERRA-2 Wind Speed at 10 Meters Maximum (m/s)': 'WS10M_MAX',
    'MERRA-2 Wind Speed at 10 Meters Minimum (m/s)': 'WS10M_MIN',
    'MERRA-2 Wind Speed at 10 Meters Range (m/s)': 'WS10M_RANGE',
    'MERRA-2 Wind Speed at 50 Meters (m/s)': 'WS50M',
    'MERRA-2 Wind Speed at 50 Meters Maximum (m/s)': 'WS50M_MAX',
    'MERRA-2 Wind Speed at 50 Meters Minimum (m/s)': 'WS50M_MIN',
    'MERRA-2 Wind Speed at 50 Meters Range (m/s)': 'WS50M_RANGE',
  }



  //parameter about graph

  const chartConfig = {
    backgroundGradientFrom: "#FCFCFC",
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: "#FCFCFC",
    backgroundGradientToOpacity: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 3, // optional, default 3
    barPercentage: 1,
    useShadowColorFromDataset: false, // optional
    propsForVerticalLabels: {
      width: 10,
      flex: 1,
      flexWrap: 'wrap',
    },
  };

  //parameter for date picker
  function useInput(ID) {
    const [date, setDate] = useState(new Date(1598051730000));
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const onChange = (event, selectedDate) => {
      const currentDate = selectedDate || date;
      setShow(Platform.OS === 'ios');
      setDate(currentDate);
      currentDate = JSON.stringify(currentDate).split('T')[0].substring(1, 20);
      let y = currentDate.split('-')[0], m = currentDate.split('-')[1], d = currentDate.split('-')[2]
      ID == 0 ? parameter.start_date = y + m + d : parameter.end_date = y + m + d;
    };

    const showMode = (currentMode) => {
      setShow(true);
      setMode(currentMode);
    };

    const showDatepicker = () => {
      showMode('date');
    };

    return {
      date,
      showDatepicker,
      show,
      mode,
      onChange
    }

  }
  const startInput = useInput(0);
  const endInput = useInput(1);

  var latitude_s = '', longitude_s = ''

  return (
    <LinearGradient  
      colors = {currentStep == 0 ? ['#9C51B6', '#5946B2'] : ['#e3ebff', '#e3ebff']} 
      locations={[0,0.8]}
      style={{
      flex: 1,
    }}>
    <SafeAreaView style={currentStep == 0 ? styles.firstPageContainer : styles.container}>

      {currentStep > 0 && currentStep != totalStep ?
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={progressBarStyle()}></View>
          <Text style={{
            fontSize: 30,
          }}>{currentStep % totalStep} / {totalStep - 1} </Text>
        </View>
        : <View></View>
      }
      <View style={{ padding: 20, flex: 1 }}>
        {currentStep == 0 ?
        
          <View style = {{
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 80,
          }}>
            <Text style={[styles.title,{paddingBottom:100, 
            fontFamily: Platform.OS === 'android' ? 'sans-serif' : "AmericanTypewriter"}]}> {appTitle} </Text>
            <TouchableOpacity onPress={setCurrentStep.bind(this, currentStep + 1)} 
              style = {styles.roundButtonTop}> 
              <Text style={styles.midText}>History Data</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={setCurrentStep.bind(this, 6)} 
              style = {styles.roundButtonBottom}> 
              <Text style={styles.midTextBlack}>Predict Data</Text>
            </TouchableOpacity>
          </View>
        
          : <View></View>
        }
        {currentStep == 1 ?
          <View style={[styles.step, {}]}>
            <View style={{
              flexDirection: 'row',
              width: '100%', 
              justifyContent: 'space-around', 
            }}>
              <TouchableOpacity style={{
                flex: 1, 
                paddingLeft: 10, 
                paddingRight: 10, 
                paddingTop: 10, 
                backgroundColor: 'transparent', 
                justifyContent: 'center', 
                alignItems: 'center', 
              }}
              onPress={() => {
                setPlaceOrLatLng(true);
              }}>
                <Text style={ placeOrLatLng ? {
                  color: 'black', 
                  fontWeight: 'bold', 
                } : {
                  color: 'grey', 
                }}>
                  Lat and Lng
                </Text>
                <View style={ placeOrLatLng ? {
                  borderBottomColor: 'black', 
                  borderBottomWidth: 2, 
                  margin: 8, 
                  flex: 1, 
                  width: '100%', 
                } : {
                  borderBottomColor: 'grey', 
                  borderBottomWidth: 1, 
                  margin: 8, 
                  flex: 1, 
                  width: '100%', 
                }}/>
              </TouchableOpacity>
              <TouchableOpacity style={{
                flex: 1, 
                paddingLeft: 10, 
                paddingRight: 10, 
                paddingTop: 10, 
                backgroundColor: 'transparent', 
                justifyContent: 'center', 
                alignItems: 'center', 
              }} onPress={() => {
                setPlaceOrLatLng(false);
              }}>
                <Text style={ !placeOrLatLng ? {
                  color: 'black', 
                  fontWeight: 'bold', 
                } : {
                  color: 'grey', 
                }}>
                  Search Places
                </Text>
                <View style={ !placeOrLatLng ? {
                  borderBottomColor: 'black', 
                  borderBottomWidth: 2, 
                  margin: 8, 
                  flex: 1, 
                  width: '100%', 
                } : {
                  borderBottomColor: 'grey', 
                  borderBottomWidth: 1, 
                  margin: 8, 
                  flex: 1, 
                  width: '100%', 
                }}/>
              </TouchableOpacity>
            </View>
            { placeOrLatLng &&
              <View style={{}}>
                <Text style={styles.text}>Choose latitude and longitude</Text>
                <View style={{flexDirection:'row', flexWrap:'wrap'}}>
                  <View style={styles.half_w}>
                    <Text>latitude</Text>
                    <TextInput style={styles.half_w_text_input} 
                              onChangeText={(text)=> {latitude_s = text}}
                              ></TextInput>
                  </View>
                  <View style={styles.half_w}>
                    <Text>longitude</Text>
                    <TextInput style={styles.half_w_text_input} 
                              onChangeText={(text)=> {longitude_s = text}}
                              ></TextInput>
                  </View>
                </View>
              </View>
            }
            { !placeOrLatLng && 
              <View style={styles.half_h}>
                <Text style={styles.text}>Please choose your location: </Text>
                <GooglePlacesAutocomplete
                  style={{
                    paddingRight: 10,
                    paddingLeft: 10,
                    height: 20, 
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
            }
          </View>
          : <View></View>
        }
        {currentStep == 2 ?
          <ScrollView style={[styles.step, {}]}>
            <Text style={styles.text}>Please choose a Temporal Resolution: </Text>
            <SelectDropdown
              dropdownStyle={{width: screenWidth-30}}
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
        {currentStep == totalStep && typeof(result) == "string"?
          <ScrollView>
            <Text style={styles.text}> Sorry, we have no data for you </Text>
            <Text style={styles.text}> { result.substring(2, result.length-2) } </Text>
            <Button onPress={setCurrentStep.bind(this, 0)} title="Back To Menu ->" />
          </ScrollView>
          : <View></View> 
        }
        {currentStep == totalStep  && typeof(result) != "string"?
          <ScrollView>
            <Text style={styles.text}> Result page </Text>
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
        { currentStep == totalStep + 1 ?
          <View style={[styles.step, {}]}>
            <View style={{
              flexDirection: 'row',
              width: '100%', 
              justifyContent: 'space-around', 
            }}>
              <TouchableOpacity style={{
                flex: 1, 
                paddingLeft: 10, 
                paddingRight: 10, 
                paddingTop: 10, 
                backgroundColor: 'transparent', 
                justifyContent: 'center', 
                alignItems: 'center', 
              }}
              onPress={() => {
                setPlaceOrLatLng(true);
              }}>
                <Text style={ placeOrLatLng ? {
                  color: 'black', 
                  fontWeight: 'bold', 
                } : {
                  color: 'grey', 
                }}>
                  Lat and Lng
                </Text>
                <View style={ placeOrLatLng ? {
                  borderBottomColor: 'black', 
                  borderBottomWidth: 2, 
                  margin: 8, 
                  flex: 1, 
                  width: '100%', 
                } : {
                  borderBottomColor: 'grey', 
                  borderBottomWidth: 1, 
                  margin: 8, 
                  flex: 1, 
                  width: '100%', 
                }}/>
              </TouchableOpacity>
              <TouchableOpacity style={{
                flex: 1, 
                paddingLeft: 10, 
                paddingRight: 10, 
                paddingTop: 10, 
                backgroundColor: 'transparent', 
                justifyContent: 'center', 
                alignItems: 'center', 
              }} onPress={() => {
                setPlaceOrLatLng(false);
              }}>
                <Text style={ !placeOrLatLng ? {
                  color: 'black', 
                  fontWeight: 'bold', 
                } : {
                  color: 'grey', 
                }}>
                  Search Places
                </Text>
                <View style={ !placeOrLatLng ? {
                  borderBottomColor: 'black', 
                  borderBottomWidth: 2, 
                  margin: 8, 
                  flex: 1, 
                  width: '100%', 
                } : {
                  borderBottomColor: 'grey', 
                  borderBottomWidth: 1, 
                  margin: 8, 
                  flex: 1, 
                  width: '100%', 
                }}/>
              </TouchableOpacity>
            </View>
            { placeOrLatLng &&
              <View style={{}}>
                <Text style={styles.text}>Choose latitude and longitude</Text>
                <View style={{flexDirection:'row', flexWrap:'wrap'}}>
                  <View style={styles.half_w}>
                    <Text>latitude</Text>
                    <TextInput style={styles.half_w_text_input} 
                              onChangeText={(text)=> {latitude_s = text}}
                              ></TextInput>
                  </View>
                  <View style={styles.half_w}>
                    <Text>longitude</Text>
                    <TextInput style={styles.half_w_text_input} 
                              onChangeText={(text)=> {longitude_s = text}}
                              ></TextInput>
                  </View>
                </View>
              </View>
            }
            { !placeOrLatLng && 
              <View style={styles.half_h}>
                <Text style={styles.text}>Please choose your location: </Text>
                <GooglePlacesAutocomplete
                  style={{
                    paddingRight: 10,
                    paddingLeft: 10,
                    height: 20, 
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
            }
          </View>
          : <View></View>
        }
        { currentStep == totalStep + 2 ?
          <View style={[styles.step, {}]}>
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={(item) => {
                setItems(item);
                parameter.days = parseInt(item);
              }}
            />
          </View>
          : <View></View>
        }
        {currentStep == totalStep + 3 && typeof(result) == "string"?
          <ScrollView>
            <Text style={styles.text}> Sorry, we have no data for you </Text>
            <Text style={styles.text}> { result.substring(2, result.length-2) } </Text>
            <Button onPress={setCurrentStep.bind(this, 0)} title="Back To Menu ->" />
          </ScrollView>
          : <View></View> 
        }
        {currentStep == totalStep + 3  && typeof(result) != "string"?
          <ScrollView>
            <Text style={styles.text}> Result page </Text>
            <Text style={styles.text}>
              {result}
            </Text>
            <Text style={styles.text}>W/m^2</Text>
            <Button style={{
              padding: 10, 
            }} onPress={setCurrentStep.bind(this, 0)} title="Back To Menu" />
          </ScrollView>
          : <View></View>
        }
      </View>
      <View style={{
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingBottom: 20,
        paddingRight: 20,
        paddingLeft: 20,
      }}>
        {currentStep > 0 && currentStep != totalStep && currentStep != totalStep + 3 ?
          <TouchableOpacity style={styles.previousButton}
            onPress={() => {
              if (currentStep > 0) {
                setCurrentStep(currentStep - 1);
                if (currentStep == totalStep + 1) {
                  setCurrentStep(0);
                }
              }
            }}>
            <Text style={{ color: '#faf2a1' }}>Back</Text>
          </TouchableOpacity> :
          <View></View>
        }
        {currentStep > 0 && currentStep != totalStep - 1 && currentStep != totalStep && currentStep != totalStep + 2 && currentStep != totalStep + 3?
          <TouchableOpacity style={canPass ? styles.nextButton : styles.nextButtonDisabled} /*disabled={!canPass}*/
            onPress={() => {
              if (currentStep == 1){
                if(placeOrLatLng == true){
                  try{
                    parameter.latitude = parseFloat(latitude_s)
                    parameter.longitude = parseFloat(longitude_s)
                  }
                  catch(e){
                    alert("Input is invalid\nlat and lng should be numbers")
                    return
                  }
                }
              }
              setCurrentStep(currentStep + 1);
              let _retrieveData = async () => {
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
            {currentStep == totalStep - 1 || currentStep == totalStep + 2 ?
              <TouchableOpacity style={fetchbtnon? styles.fetchButton:styles.nextButtonDisabled} disabled={!fetchbtnon}
                onPress={() => {
                  setFetchbtn(false)
                  if (currentStep == totalStep - 1) {                    
                    getData().then(() => {
                      setCurrentStep(currentStep + 1);
                    })
                  }
                  else if (currentStep == totalStep + 2) {
                    predict().then(() => {
                      setCurrentStep(currentStep + 1);
                    });
                  }
                }}>
                <Text>Fetch</Text>
              </TouchableOpacity> :
              <View></View>
            }
          </View>
        }
      </View>
    
    </SafeAreaView>
    </LinearGradient>
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
  firstPageContainer: {
    flex: 1,
    padding: 10,
    paddingTop: Constants.statusBarHeight + 10,
  },
  text: {
    paddingBottom: 10,
    paddingRight: 10,

  },
  midText: {
    textAlign: "center",
    color: "white",
    fontWeight: 'bold',
    fontSize: 30,
  },
  midTextBlack: {
    textAlign: "center",
    color: "black",
    fontWeight: 'bold',
    fontSize: 30,
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
  },
  bottomButton: {
    justifyContent: 'flex-end'
  },
  chart: {
    borderWidth: 4,
    borderColor: "#20232a",
  },
  dateButton: {
    paddingTop: 80,
  },
  dateStartButton: {
    flex: 1,
    paddingTop: 40,
  },
  half_h: {
    height: 0.5 * (screenHeight-50)
  },
  half_w: {
    flex: 1, 
    flexGrow: 1, 
    flexShrink: 1, 
    padding: 5,
    //width: 0.5 * (screenWidth-50)
  },
  half_w_text_input: {
    backgroundColor: 'white', 
    height: 40
  },
  title: {
    paddingBottom: 10,
    paddingRight: 10,
    textAlign: "center",
    fontSize: 40,
    fontStyle: 'normal',
    fontWeight: 'bold',
    color:'white',
    textShadowOffset:{width:2, height:5},
    textShadowColor:'black',
    textShadowRadius:2,
    letterSpacing:5

  },
  roundButtonTop: {
    width: 200,
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 0, 
    borderTopRightRadius: 100, 
    borderTopLeftRadius: 100, 
    backgroundColor: 'orange',
    borderBottomWidth: 1, 
    borderColor: 'transparent', 
  },
  roundButtonBottom: {
    width: 200,
    height: 100,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 0, 
    borderBottomRightRadius: 100, 
    borderBottomLeftRadius: 100, 
    backgroundColor: '#def86a',
    borderTopWidth: 1, 
    borderColor: 'transparent', 
  },
});

export default App;