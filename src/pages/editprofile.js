import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Text, ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';

const EditProfile = ({ navigation, route }) => {
  const currentUser = auth().currentUser;
  const user = route.params?.user || {};

  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [email, setEmail] = useState(user.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [birthday, setBirthday] = useState(user.birthday || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [occupation, setOccupation] = useState(user.occupation || '');
  
  const [instagramLink, setInstagramLink] = useState(user.instagramLink || '');
  const [twitterLink, setTwitterLink] = useState(user.twitterLink || '');
  const [websiteLink, setWebsiteLink] = useState(user.websiteLink || '');
  const [facebookLink, setFacebookLink] = useState(user.facebookLink || '');
  const [linkedinLink, setLinkedinLink] = useState(user.linkedinLink || '');
  const [education, setEducation] = useState(user.education || '');
  const [experience, setExperience] = useState(user.experience || '');

 // ... existing code ...

const isValidURL = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;  
  }
};

// ... existing code ...
const handleSave = async () => {
  try {
    const userRef = firestore().collection('users').doc(currentUser.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User does not exist');
    }

    const currentUserData = userDoc.data();

    // Validate URLs
    const validInstagramLink = instagramLink || currentUserData.instagramLink || '';
    const validTwitterLink = twitterLink || currentUserData.twitterLink || '';
    const validWebsiteLink = websiteLink || currentUserData.websiteLink || '';
    const validFacebookLink = facebookLink || currentUserData.facebookLink || '';
    const validLinkedinLink = linkedinLink || currentUserData.linkedinLink || '';

    await userRef.set({
      displayName: displayName || currentUserData.displayName,
      email: email || currentUserData.email,
      phoneNumber: phoneNumber || currentUserData.phoneNumber,
      birthday: birthday || currentUserData.birthday,
      occupation: occupation || currentUserData.occupation,
      photoURL: photoURL || currentUserData.photoURL,
      instagramLink: validInstagramLink,
      twitterLink: validTwitterLink,
      websiteLink: validWebsiteLink,
      facebookLink: validFacebookLink,
      linkedinLink: validLinkedinLink,
      education: education || currentUserData.education,
      experience: experience || currentUserData.experience,
    }, { merge: true });

    if (currentUser) {
      await currentUser.updateProfile({
        displayName: displayName || currentUserData.displayName,
        photoURL: photoURL || currentUserData.photoURL,
      });
    }
    Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
    navigation.goBack();
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};



  const handleChangeProfilePicture = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });

    if (result.didCancel) return;
    const imageUri = result.assets[0].uri;

    const storageRef = storage().ref(`profile_pictures/${currentUser.uid}`);
    await storageRef.putFile(imageUri);
    const downloadURL = await storageRef.getDownloadURL();
    setPhotoURL(downloadURL);
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image source={require('../assets/arrow.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Image source={require('../assets/check-mark.png')} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleChangeProfilePicture}>
        <Image source={{ uri: photoURL || 'https://via.placeholder.com/100' }} style={styles.profileImage} />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Basic Information</Text>
      <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Name" placeholderTextColor="#888888" style={styles.input} />
      <View style={styles.inputContainer}>
      <TextInput value={birthday} onChangeText={setBirthday} placeholder="Birthday" placeholderTextColor="#888888" style={styles.input} />
      </View>
      <View style={styles.inputContainer}>
      <TextInput value={occupation} onChangeText={setOccupation} placeholder="Occupation" placeholderTextColor="#888888" style={styles.input} />
      </View>
      <View style={styles.inputContainer}>
        <Image source={require('../assets/mail.png')} style={styles.inputIcon} />
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#888888" style={styles.input} />
      </View>
      <View style={styles.inputContainer}>
        <Image source={require('../assets/call.png')} style={styles.inputIcon} />
        <TextInput value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Phone Number" placeholderTextColor="#888888" style={styles.input} />
      </View>
      <Text style={styles.sectionTitle}>Social Links</Text>

      <View style={styles.inputContainer}>
        <Image source={require('../assets/social.png')} style={styles.inputIcon} />
        <TextInput value={instagramLink} onChangeText={setInstagramLink} placeholder="Instagram Link" placeholderTextColor="#888888" style={styles.input} />
      </View>
      <View style={styles.inputContainer}>
        <Image source={require('../assets/twitter.png')} style={styles.inputIcon} />
        <TextInput value={twitterLink} onChangeText={setTwitterLink} placeholder="Twitter Link" placeholderTextColor="#888888" style={styles.input} />
      </View>
      <View style={styles.inputContainer}>
        <Image source={require('../assets/internet.png')} style={styles.inputIcon} />
        <TextInput value={websiteLink} onChangeText={setWebsiteLink} placeholder="Website Link" placeholderTextColor="#888888" style={styles.input} />
      </View>
      <View style={styles.inputContainer}>
        <Image source={require('../assets/facebook.png')} style={styles.inputIcon} />
        <TextInput value={facebookLink} onChangeText={setFacebookLink} placeholder="Facebook Link" placeholderTextColor="#888888" style={styles.input} />
      </View>
      <View style={styles.inputContainer}>
        <Image source={require('../assets/linkedin.png')} style={styles.inputIcon} />
        <TextInput value={linkedinLink} onChangeText={setLinkedinLink} placeholder="LinkedIn Link" placeholderTextColor="#888888" style={styles.input} />
      </View>

      <Text style={styles.sectionTitle}>Education & Experience</Text>
      <View style={styles.inputContainer}>
        <Image source={require('../assets/education1.png')} style={styles.inputIcon} />
        <TextInput value={education} onChangeText={setEducation} placeholder="Education" placeholderTextColor="#888888" style={styles.input} />
      </View>
      <View style={styles.inputContainer}>
      <TextInput value={experience} onChangeText={setExperience} placeholder="Experience" placeholderTextColor="#888888" style={styles.descriptionInput}  multiline={true}/>
    </View></ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10, // Reduced padding
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    left: 5,
    zIndex: 1,
    padding: 5, // Reduced padding
    borderRadius: 50,
    elevation: 3,
  },
  descriptionInput: {
    height: 80, // Reduced height
    borderColor: 'cyan',
    borderWidth: 1,
    padding: 8, // Reduced padding
    borderRadius: 20,
    textAlignVertical: 'top',
    marginBottom: 15, // Reduced margin
  },
  saveButton: {
    position: 'absolute',
    right: 5,
    zIndex: 1,
    padding: 5, // Reduced padding
    borderRadius: 50,
    elevation: 3,
  },
  icon: {
    width: 20, // Reduced size
    height: 20, // Reduced size
    tintColor: "cyan"
  },
  profileImage: {
    width: 100, // Reduced size
    height: 100, // Reduced size
    borderRadius: 50, // Adjusted for new size
    alignSelf: 'center',
    marginTop: 30, // Reduced margin
    borderWidth: 2, // Reduced border width
    borderColor: '#00FFFF',
  },
  sectionTitle: {
    fontSize: 18, // Reduced font size
    fontWeight: 'bold',
    color: '#00FFFF',
    marginVertical: 15, // Reduced margin
    textAlign: 'center',
  },
  inputContainer: {
    position: 'relative',
    marginVertical: 8, // Reduced margin
  },
  inputIcon: {
    position: 'absolute',
    left: 10, // Adjusted for new padding
    top: 10, // Adjusted for new padding
    width: 20, // Reduced size
    height: 20, // Reduced size
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 40, // Reduced height
    borderColor: '#00FFFF',
    borderWidth: 2,
    borderRadius: 20, // Adjusted for new size
    paddingLeft: 40, // Adjusted for new icon size
    fontSize: 14, // Reduced font size
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
    marginBottom: 15, // Reduced margin
  },
});


export default EditProfile;