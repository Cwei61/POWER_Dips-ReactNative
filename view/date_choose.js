import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';

class Date extends React.Component {
    render() {
      return <div>
        <Text>Choose the time period: </Text>
        <Text>From: </Text>
        <CalendarPicker />
        <Text>To: </Text>
        <CalendarPicker />
      </div>;
    }
}

export default Date