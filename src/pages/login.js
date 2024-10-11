import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Googlelogin from '../components/googlelogin';
import PhoneNumberLogin from './phonenumberlogin';

const Login = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Circular Profile Image */}
      <View style={styles.profileImageContainer}>
        <Image
          source={require('../assets/applogo.jpeg')}
          style={styles.profileImage}
        />
      </View>

      <View style={styles.formContainer}>
        {/* Google Login */}
        <View style={styles.socialContainer}>
          <Googlelogin />
        </View>
        
        {/* Phone Number Login */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.phoneButton} onPress={() => navigation.navigate(PhoneNumberLogin)}>
            <Image style={styles.logo1} source={require('../assets/telephone.png')} />
            <Text style={styles.phoneButtonText}>Sign in with mobile number</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ... existing code ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212', // Darker background for a sleek look
  },
  profileImageContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Soft white border for a modern touch
    shadowColor: '#00FFA3', // Neon green glow
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.7,
    shadowRadius: 25,
    elevation: 20, // High elevation for floating effect
    overflow: 'hidden', // Hide any overflow for clean circles
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderColor: 'rgba(0, 255, 163, 0.5)', // Subtle neon glow
    borderWidth: 3,
  },
  formContainer: {
    width: '90%',
    backgroundColor: '#1F1F1F', // Deep grey container for form
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#00FFA3',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 2,
    borderColor: '#00FFA3', // Highlight border with neon effect
  },
  socialContainer: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  phoneButton: {
    width: '100%',
    backgroundColor: 'rgba(0, 255, 255, 0.2)', // Glass-like cyan background color
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00FFFF', // Cyan shadow color
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.5)', // Border to enhance glass effect
    marginBottom: 20,
    transition: 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out',
  },
  phoneButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textShadowColor: '#00FFFF', // Cyan text shadow
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  logo1: {
    width: 32, // Larger icon for better visibility
    height: 32,
  },
});
// ... existing code ...



export default Login;
