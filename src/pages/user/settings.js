import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';

const Settings = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with Back Button and Title */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Settings Options */}
      <TouchableOpacity style={styles.option}>
        <Image source={require('../../assets/insurance-policy.png')} style={styles.icon} />
        <Text style={styles.optionText}>Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Image source={require('../../assets/agreement.png')} style={styles.icon} />
        <Text style={styles.optionText}>Terms of Service</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Image source={require('../../assets/notification.png')} style={styles.icon} />
        <Text style={styles.optionText}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option}>
        <Image source={require('../../assets/languages.png')} style={styles.icon} />
        <Text style={styles.optionText}>Language</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000', // Black background
    padding: 20,
  },
  header: {
    flexDirection: 'row', // Arrange items in a row
    alignItems: 'center', // Align items vertically centered
    marginBottom: 30, // Add margin below the header
  },
  backButton: {
    marginRight: 10, // Space between back icon and title
  },
  backIcon: {
    width: 30,
    height: 30,
    tintColor: '#00FFFF', // Cyan tint for the back icon
  },
  title: {
    color: '#00FFFF', // Cyan title
    fontSize: 32,
    fontWeight: 'bold',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333', // A subtle divider
    marginBottom: 10,
  },
  icon: {
    width: 24, // Adjust image size
    height: 24,
    marginRight: 15,
    tintColor: "red",
  },
  optionText: {
    color: '#00FFFF',
    fontSize: 18,
  },
});

export default Settings;
