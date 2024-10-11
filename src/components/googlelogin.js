import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image,Text} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const Googlelogin = () => {
  const navigation = useNavigation();

  
  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;
  
      const userDocRef = firestore().collection('users').doc(user.uid);
      await userDocRef.set({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        joinedCommunities: user.joinedCommunities || null,
        occupation: user.occupation || null,
        phonenumber: user.phoneNumber || null,
        birthday: user.birthday || null,
        instagramLink: user.instagramLink || null,
        twitterLink: user.twitterLink || null,
        websiteLink: user.websiteLink || null,
        facebookLink: user.facebookLink || null,
        linkedinLink: user.linkedinLink || null,
        education: user.education || null,
        experience: user.experience || null,
      });
  
      // Navigate to MainTabs with the UID
      navigation.navigate('MainTabs', { 
       
        params: { 
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        }
      });
    } catch (error) {
      if (error.code) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            Alert.alert('Sign in cancelled');
            break;
          case statusCodes.IN_PROGRESS:
            Alert.alert('Sign in already in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Play services not available or outdated');
            break;
          default:
            Alert.alert('An error occurred: ' + error.message);
        }
      } else {
        Alert.alert('An error occurred: ' + error.message);
      }
      console.error('Sign in error:', error); 
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={signIn}>
        <Image style={styles.logo} source={require('../assets/google.png')} />
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textShadowColor: '#00FFFF', // Cyan text shadow
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  logo: {
    width: 24,
    height: 24,
  },
});

export default Googlelogin;
