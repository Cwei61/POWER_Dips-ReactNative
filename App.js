import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';

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
