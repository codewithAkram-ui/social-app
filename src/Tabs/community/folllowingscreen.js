import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
const FollowingScreen = () => {
  const [following, setFollowing] = useState([]);
  const navigation=useNavigation()
  useEffect(() => {
    fetchFollowingUsers();
  }, []);

  const fetchFollowingUsers = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      try {
        // Fetch the UIDs of the users the current user is following
        const followingSnapshot = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('following')
          .get();
        
        const followingUIDs = followingSnapshot.docs.map(doc => doc.id);

        // Fetch the profile data of each followed user
        const userProfiles = await Promise.all(
          followingUIDs.map(async uid => {
            const userDoc = await firestore().collection('users').doc(uid).get();
            return { uid, ...userDoc.data() }; // Include UID and user data
          })
        );
        
        setFollowing(userProfiles); // Store the user profile data
      } catch (error) {
        console.error('Error fetching followed users:', error);
      }
    }
  };

  const handleUnfollow = async (uid) => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      try {
        // Remove the user from the current user's following collection
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('following')
          .doc(uid)
          .delete();

        // Remove the current user from the followed user's followers collection (optional)
        await firestore()
          .collection('users')
          .doc(uid)
          .collection('followers')
          .doc(currentUser.uid)
          .delete();

        // Update the local state after unfollowing
        setFollowing((prevFollowing) => prevFollowing.filter(user => user.uid !== uid));

        Alert.alert('Unfollowed', 'You have unfollowed this user.');
      } catch (error) {
        console.error('Error unfollowing user:', error);
        Alert.alert('Error', 'Failed to unfollow the user.');
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
      <Text style={styles.title}>Users You Follow</Text>
      <FlatList
        data={following}
        keyExtractor={(item) => item.uid} // Use UID as key
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Image
              source={{ uri: item.photoURL || 'https://via.placeholder.com/100' }}
              style={styles.profileImage}
            />
            {/* Display user's name */}
            <Text style={styles.userName}>{item.displayName || 'Anonymous'}</Text>
            
            {/* Unfollow Button */}
            <TouchableOpacity
              style={styles.unfollowButton}
              onPress={() => handleUnfollow(item.uid)}
            >
              <Text style={styles.unfollowText}>Unfollow</Text>
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
    backgroundColor: '#0A0A0A', // Dark background for sleek look
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
    tintColor: '#00FFFF', // Cyan tint for back button icon
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A', // Darker background for each followed user item
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
    color: '#00FFFF', // Cyan color for followed user names
    flex: 1, // Username will take up available space
  },
  unfollowButton: {
    backgroundColor: '#FF1E1E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  unfollowText: {
    color: '#FFF',
    fontSize: 14,
  },
});

export default FollowingScreen;
