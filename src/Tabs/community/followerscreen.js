import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
const FollowersScreen = () => {
  const [followers, setFollowers] = useState([]);
  const navigation=useNavigation()
  useEffect(() => {
    fetchFollowers();
  }, []);

  const fetchFollowers = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      try {
        
        const followersSnapshot = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('followers')
          .get();

        const followerUIDs = followersSnapshot.docs.map(doc => doc.id);

        // Fetch the profile data of each follower
        const followerProfiles = await Promise.all(
          followerUIDs.map(async uid => {
            const userDoc = await firestore().collection('users').doc(uid).get();
            return { uid, ...userDoc.data() }; // Include UID and user data
          })
        );

        setFollowers(followerProfiles); // Store the follower profile data
      } catch (error) {
        console.error('Error fetching followers:', error);
      }
    }
  };

  const handleRemoveFollower = async (uid) => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      try {
        // Remove the follower from the current user's followers collection
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('followers')
          .doc(uid)
          .delete();

        // Optionally, remove the current user from the follower's following collection
        await firestore()
          .collection('users')
          .doc(uid)
          .collection('following')
          .doc(currentUser.uid)
          .delete();

        // Update the local state after removing the follower
        setFollowers((prevFollowers) => prevFollowers.filter(follower => follower.uid !== uid));

        Alert.alert('Removed', 'You have removed this follower.');
      } catch (error) {
        console.error('Error removing follower:', error);
        Alert.alert('Error', 'Failed to remove the follower.');
      }
    }
  };

  return (
    <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Image
          source={require('../../assets/arrow.png')} // Replace with your image path
          style={styles.backIcon}
        />
      </TouchableOpacity>
      <Text style={styles.title}>Your Followers</Text>
      <FlatList
        data={followers}
        keyExtractor={(item) => item.uid} // Use UID as key
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Image
              source={{ uri: item.photoURL || 'https://via.placeholder.com/100' }}
              style={styles.profileImage}
            />
            {/* Display follower's name */}
            <Text style={styles.userName}>{item.displayName || 'Anonymous'}</Text>

            {/* Remove Follower Button */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFollower(item.uid)}
            >
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A', // Dark background for a sleek look
    padding: 15,
  },
  title: {
    fontSize: 22,
    color: '#00FFFF', // Cyan color for the title
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 15,
  },
  backIcon: {
    width: 25,
    height: 25,
    tintColor: '#00FFFF',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A', // Darker background for each follower item
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  profileImage: {
    width: 40, // Smaller image size
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    color: '#00FFFF', // Cyan color for follower names
    flex: 1,
  },
  removeButton: {
    backgroundColor: '#FF1E1E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  removeText: {
    color: '#FFF',
    fontSize: 14,
  },
});

export default FollowersScreen;
