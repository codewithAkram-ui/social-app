import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import auth from "@react-native-firebase/auth"; 
import PhoneInput from 'react-native-phone-input';
import firestore from '@react-native-firebase/firestore';

const PhoneNumberLogin = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const phoneInputRef = useRef(null);

  const sendOtp = async () => {
    try {
      const phoneNumberWithCountryCode = phoneInputRef.current?.getValue();
      if (!phoneNumberWithCountryCode || !phoneInputRef.current?.isValidNumber()) {
        Alert.alert('Error', 'Invalid phone number.');
        return;
      }
      const confirmation = await auth().signInWithPhoneNumber(phoneNumberWithCountryCode);
      setVerificationId(confirmation.verificationId);
      setOtpSent(true);
      Alert.alert('OTP Sent', 'Please check your phone for the OTP.');
    } catch (error) {
      console.error('Phone sign-in error:', error);
      Alert.alert('Error', error.message);
    }
  };

  const verifyOtp = async () => {
    setLoading(true); // Start loading
    try {
      const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await auth().signInWithCredential(credential);
  
      // User is now logged in
      const { uid, phoneNumber } = userCredential.user;
  
      // Check if the user already exists in Firestore
      const userDoc = await firestore().collection('users').doc(uid).get();
  
      if (!userDoc.exists) {
        // If user does not exist, save initial details
        await firestore().collection('users').doc(uid).set({
          uid: uid, // Save UID
          phoneNumber: phoneNumber, // Save phone number
          createdAt: firestore.FieldValue.serverTimestamp(), // Save timestamp
        });
      } else {
        // Only update the fields that are defined and have values
        const updatedUserData = {};
  
        if (typeof joinedCommunities !== 'undefined') updatedUserData.joinedCommunities = joinedCommunities;
        if (typeof birthday !== 'undefined') updatedUserData.birthday = birthday;
        if (typeof phoneNumber !== 'undefined') updatedUserData.phoneNumber = phoneNumber;
        if (typeof displayName !== 'undefined') updatedUserData.displayName = displayName;
        if (typeof email !== 'undefined') updatedUserData.email = email;
        if (typeof photoURL !== 'undefined') updatedUserData.photoURL = photoURL;
        if (typeof instagramLink !== 'undefined') updatedUserData.instagramLink = instagramLink;
        if (typeof twitterLink !== 'undefined') updatedUserData.twitterLink = twitterLink;
        if (typeof websiteLink !== 'undefined') updatedUserData.websiteLink = websiteLink;
        if (typeof facebookLink !== 'undefined') updatedUserData.facebookLink = facebookLink;
        if (typeof LinkedinLink !== 'undefined') updatedUserData.LinkedinLink = LinkedinLink;
        if (typeof education !== 'undefined') updatedUserData.education = education;
        if (typeof experience !== 'undefined') updatedUserData.experience = experience;
        if (typeof occupation !== 'undefined') updatedUserData.occupation = occupation;
  
        // Update Firestore with the available data
        await firestore().collection('users').doc(uid).set(updatedUserData, { merge: true });
      }
  
      setLoading(false); // Stop loading
      Alert.alert('OTP Verified', 'You are now logged in, and your details have been saved.');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error during OTP verification:', error);
      setLoading(false); // Stop loading on error
      Alert.alert('Error', 'Invalid OTP.');
    }
  };
  

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('../assets/applogo1.png')} />
      <View style={styles.formContainer}>
        <View style={styles.phoneContainer}>
          <PhoneInput
            ref={phoneInputRef}
            style={styles.phoneInput}
            initialCountry="in"
            onChangePhoneNumber={setPhoneNumber}
            textStyle={{ color: '#333' }}
            pickerBackgroundColor="#f9f9f9"
            pickerItemStyle={{ backgroundColor: '#f9f9f9', color: '#333' }}
          />
          <TouchableOpacity style={styles.getOtpButton} onPress={sendOtp}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.getOtpButtonText}>Get OTP</Text>
            )}
          </TouchableOpacity>
        </View>
        {otpSent && (
          <TextInput
            style={styles.otpInput}
            placeholder="Enter OTP"
            placeholderTextColor="#999"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
          />
        )}
        {otpSent && (
          <TouchableOpacity style={styles.button} onPress={verifyOtp} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.registerText}>Login with Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0E0E0E', // Deep dark background for contrast
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 40,
    borderRadius: 60,
    resizeMode: 'contain',
    boxShadow: '0px 0px 40px 10px #4f46e5', // Glowing shadow for the logo
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent for glassmorphism
    borderRadius: 25,
    padding: 30,
    backdropFilter: 'blur(10px)', // Blur effect for glassmorphism
    borderColor: 'rgba(255, 255, 255, 0.2)', 
    borderWidth: 1,
    shadowColor: '#4f46e5', // Soft glow shadow for depth
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 12,
    marginBottom: 20,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  phoneInput: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Transparent input background
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#E5E7EB', // Light text for dark background
    borderColor: '#4f46e5', // Border matching the button color for cohesion
    borderWidth: 1,
    marginRight: 10,
    backdropFilter: 'blur(10px)', // Extra blur for modernity
    transition: 'all 0.3s ease-in-out', // Smooth transition on focus
  },
  otpInput: {
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#E5E7EB',
    borderColor: '#4f46e5',
    borderWidth: 1,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 8,
  },
  getOtpButton: {
    backgroundColor: 'linear-gradient(90deg, #4f46e5, #3b82f6)', // Gradient for a modern feel
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
    transform: [{ scale: 1 }],
    transition: 'transform 0.3s ease-in-out', // Smooth hover effect
  },
  getOtpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  button: {
    height: 50,
    backgroundColor: 'linear-gradient(90deg, #10b981, #00c08b)', // Fresh gradient for call to action
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 6,
    transform: [{ scale: 1 }],
    transition: 'transform 0.3s ease-in-out',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.25,
    textTransform: 'uppercase',
  },
  registerText: {
    color: '#3b82f6',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default PhoneNumberLogin;
