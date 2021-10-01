import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';

const getData = async () => {
  try {
    const response = await fetch(
      'https://power.larc.nasa.gov/api/temporal/hourly/point?parameters=T2M&community=SB&longitude=0&latitude=0&start=20170101&end=20170102&format=json'
    );
    const json = await response.json()['properties']['parameter']['T2M'];
    let data = []
    data[0] = Object.keys(json)
    for (let i=0; i<time.length; i++){
      data[1][i] = data[time[i]]
    }
    console.log(data)
    return data;
  } catch (error) {
    console.error(error);
  }
};


export default function App() {
  return (
    <SafeAreaView style={{flex: 1}}>
      <ProgressSteps>
        <ProgressStep label="First Step" >
            <View style={{ alignItems: 'center' }}>
                <Text>Choose your location: </Text>
            </View>
        </ProgressStep>
        <ProgressStep label="Second Step">
            <View style={{ alignItems: 'center' }}>
                <Text>Choose the time period: </Text>
            </View>
        </ProgressStep>
        <ProgressStep label="Third Step" onSubmit = {()=> {alert("finish")}} >
            <View style={{ alignItems: 'center' }}>
                <Text>How to lose</Text>
            </View>
        </ProgressStep>
      </ProgressSteps>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
