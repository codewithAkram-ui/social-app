import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const Livepage = () => {
  const navigation = useNavigation();
  const user = auth().currentUser;
  const [liveUsers, setLiveUsers] = useState([]);

  useEffect(() => {
    fetchLiveDetails();
  }, []);

  const fetchLiveDetails = async () => {
    if (user) {
      try {
        const liveSnapshot = await firestore().collection('live').get();
        const liveData = liveSnapshot.docs.map(doc => doc.data());

        const userPromises = liveData.map(async (liveUser) => {
          const userSnapshot = await firestore().collection('users').doc(liveUser.uid).get();
          if (userSnapshot.exists) {
            return { ...liveUser, ...userSnapshot.data() };
          }
        });

        const userDetails = await Promise.all(userPromises);
        setLiveUsers(userDetails.filter(user => user));
      } catch (error) {
        console.error('Error fetching live users:', error);
      }
    }
  };

  const handleProfileClick = (liveUser) => {
    if (!liveUser || !liveUser.liveID) {
      Alert.alert('Error', 'Live ID not found.');
      return;
    }
    navigation.navigate('Live', {
      liveID: liveUser.liveID,
      topic: liveUser.topic, // Pass the topic
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../assets/arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live</Text>
      </View>
      <View style={styles.content}>
        {liveUsers.length > 0 ? (
          liveUsers.map((liveUser, index) => (
            <TouchableOpacity key={index} onPress={() => handleProfileClick(liveUser)} style={styles.profileContainer}>
              <Image
                source={{ uri: liveUser.photoURL || 'https://via.placeholder.com/100' }}
                style={styles.profileImage}
              />
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{liveUser.userName || 'Anonymous'}</Text>
                <View style={styles.topicContainer}>
                  <Text style={styles.profileTopic}>Topic:{liveUser.topic || 'No topic available'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noLiveText}>No live users available</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  backIcon: {
    width: 30,
    height: 30,
    tintColor: '#00bcd4', // Cyan color for the back icon
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00bcd4', // Cyan color for the header title
  },
  content: {
    flex: 1,
  },
  profileContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#000', // Black background for profile container
    padding: 10,
    margin: 5,
    borderRadius: 10,
    borderColor: '#00bcd4', // Cyan border
    borderWidth: 1,
    shadowColor: '#00bcd4', // Cyan shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
    width: 120, // Larger square box width
    height: 170, // Larger square box height
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  profileName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00bcd4', // Cyan color for profile name
    textAlign: 'center',
  },
  profileDetails: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  topicContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Light white background
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
    width: '100%', // Full width of the profile container
  },
  profileTopic: {
    fontSize: 12,
    color: 'white', // Cyan color for profile topic
    textAlign: 'center',
  },
  noLiveText: {
    fontSize: 18,
    color: '#00bcd4', // Cyan color for no live text
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Livepage;