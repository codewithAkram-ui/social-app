import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import Learnskills from './learnskills';

const Knownskills = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.container} 
      onPress={() => navigation.navigate(Learnskills)}
    >
      <Text style={styles.text}>
        knownskills
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default Knownskills


