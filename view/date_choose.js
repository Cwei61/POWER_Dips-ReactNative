import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';

class Date extends React.Component { 
    render() {
      return <View>
        <Text>Choose the time period: </Text>
        <Text>From: </Text>
        <CalendarPicker />
        <Text>To: </Text>
        <CalendarPicker />
      </View>;
    }
}

export default Date