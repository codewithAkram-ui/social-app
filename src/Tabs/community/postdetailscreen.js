import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Button, Alert, TouchableOpacity,Linking } from 'react-native';
import { format } from 'date-fns';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Postdetailscreen = ({ route,navigation }) => {
  const { post} = route.params; // Getting post data from route
  const [userProfile, setUserProfile] = useState({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false); // Track if current user is already a friend
  const [requestSent, setRequestSent] = useState(false);  
  const [followerCount, setFollowerCount] = useState(0); // Track the number of followers
  const [friendCount, setFriendCount] = useState(0); // Track the number of friends
  const currentUser = auth().currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userDoc = await firestore().collection('users').doc(post.uid).get();
      setUserProfile(userDoc.data());

      // Check if current user is already friends with the post author
      const friendDoc = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('friends')
        .doc(post.uid)
        .get();

      if (friendDoc.exists) {
        setIsFriend(true);
      } else {
        // Check if a friend request has already been sent
        const requestDoc = await firestore()
          .collection('users')
          .doc(post.uid)
          .collection('friendRequests')
          .doc(currentUser.uid)
          .get();

        if (requestDoc.exists) {
          setRequestSent(true);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleSendFriendRequest = async () => {
    try {
      if (requestSent) {
        Alert.alert('Request Already Sent', `You have already sent a friend request to ${userProfile.displayName}.`);
        return;
      }

      // Add friend request to the post author's friendRequests sub-collection
      await firestore()
        .collection('users')
        .doc(post.uid)
        .collection('friendRequests')
        .doc(currentUser.uid)
        .set({
          senderId: currentUser.uid,
          senderName: currentUser.displayName || 'Anonymous', // Current user's name
          senderPhotoURL: currentUser.photoURL || '', // Current user's profile picture
          requestedAt: firestore.FieldValue.serverTimestamp(),
        });

      setRequestSent(true);
      Alert.alert('Friend Request Sent', `You have sent a friend request to ${userProfile.displayName}.`);

    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Unable to send friend request. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userDoc = await firestore().collection('users').doc(post.uid).get();
      setUserProfile(userDoc.data());

      // Check if current user is already following the post author
      const followingDoc = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('following')
        .doc(post.uid)
        .get();

      if (followingDoc.exists) {
        setIsFollowing(true);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle Follow Action
  const handleFollow = async () => {
    try {
      if (isFollowing) {
        // Unfollow the user
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('following')
          .doc(post.uid)
          .delete();

        // Remove the current user from the post author's followers
        await firestore()
          .collection('users')
          .doc(post.uid)
          .collection('followers')
          .doc(currentUser.uid)
          .delete();

        setIsFollowing(false);
        Alert.alert('Unfollowed', `You have unfollowed ${userProfile.displayName}`);
      } else {
        // Follow the user
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('following')
          .doc(post.uid)
          .set({
            followedAt: firestore.FieldValue.serverTimestamp(),
          });

        // Add the current user to the post author's followers
        await firestore()
          .collection('users')
          .doc(post.uid)
          .collection('followers')
          .doc(currentUser.uid)
          .set({
            followedAt: firestore.FieldValue.serverTimestamp(),
          });

        setIsFollowing(true);
        Alert.alert('Followed', `You are now following ${userProfile.displayName}`);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      Alert.alert('Error', 'Unable to follow/unfollow user. Please try again later.');
    }
  };


  useEffect(() => {
    const fetchUserProfile = async () => {
      const userDoc = await firestore().collection('users').doc(post.uid).get();
      setUserProfile(userDoc.data());

      // Fetch the number of followers
      const followersSnapshot = await firestore()
        .collection('users')
        .doc(post.uid)
        .collection('followers')
        .get();
      setFollowerCount(followersSnapshot.size);

      // Fetch the number of friends
      const friendsSnapshot = await firestore()
        .collection('users')
        .doc(post.uid)
        .collection('friends')
        .get();
      setFriendCount(friendsSnapshot.size);

      // Check if current user is already friends with the post author
      const friendDoc = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('friends')
        .doc(post.uid)
        .get();
        if (friendDoc.exists) {
          setIsFriend(true);
        } else {
          // Check if a friend request has already been sent
          const requestDoc = await firestore()
            .collection('users')
            .doc(post.uid)
            .collection('friendRequests')
            .doc(currentUser.uid)
            .get();
  
          if (requestDoc.exists) {
            setRequestSent(true);
          }
        }
      };
  
      fetchUserProfile();
    }, []);
  

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.appTitle}>Ski.io</Text>
      </View>

      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <Image source={{ uri: userProfile.photoURL}} style={styles.profileImage} />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{userProfile.displayName}</Text>
          <Text style={styles.jobTitle}>{userProfile.occupation}</Text>
          <Text style={styles.followerCount}>{followerCount} followers | {friendCount} friends</Text>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.contactSection}>
        <Text style={styles.contactText}>{userProfile.email}</Text>
        <Text style={styles.contactText}>{userProfile.phoneNumber}</Text>
        <Text style={styles.contactText}>Chennai, India</Text>
      </View>

      {/* Follow and Message Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
          <Text style={styles.buttonText}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
        </TouchableOpacity>
        {isFriend ? (
   <View style={styles.friendStatusButton}>
   <Text style={styles.friendStatusButtonText}>You are friend</Text>
 </View>
) : requestSent ? (
  <View style={styles.friendRequestSentButton}>
    <Text style={styles.friendRequestSentButtonText}>Friend Request Sent</Text>
  </View>
) : (
  <TouchableOpacity
    style={styles.sendFriendRequestButton}
    onPress={handleSendFriendRequest}
  >
    <Text style={styles.sendFriendRequestButtonText}>Send Friend Request</Text>
  </TouchableOpacity>
)}
      </View>

      {/* About Me Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About me</Text>
        <Text style={styles.aboutText}>{userProfile.birthday}</Text>
        <Text style={styles.aboutText}>{userProfile.education}</Text>
        <Text style={styles.aboutText}>{userProfile.experience}</Text>
      </View>

      {/* Social Networks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Social Networks</Text>
        <View style={styles.socialIcons}>
          <TouchableOpacity onPress={() => userProfile.instagramLink && Linking.openURL(userProfile.instagramLink)}>
            <Image source={require('../../assets/social.png')} style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => userProfile.facebookLink && Linking.openURL(userProfile.facebookLink)}>
            <Image source={require('../../assets/facebook.png')} style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => userProfile.linkedinLink && Linking.openURL(userProfile.linkedinLink)}>
            <Image source={require('../../assets/linkedin.png')} style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => userProfile.websiteLink && Linking.openURL(userProfile.websiteLink)}>
            <Image source={require('../../assets/internet.png')} style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => userProfile.twitterLink && Linking.openURL(userProfile.twitterLink)}>
            <Image source={require('../../assets/twitter.png')} style={styles.socialIcon} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Education */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Post Details</Text>
        <Text style={styles.postTitle}>Title: {post.title}</Text>
        <Text style={styles.postDescription}>Description: {post.description}</Text>
        <Text style={styles.postInfo}>
          Skill: {post.skillCategory} | Difficulty: {post.difficultyLevel}
        </Text>
        <Text style={styles.postInfo}>
          Created on: {format(new Date(post.createdAt.seconds * 1000), 'MMM d, yyyy')}
        </Text>
        <Text style={styles.postLocation}>Location: {post.location}</Text>
        <Text style={styles.postGoals}>Goals: {post.goals}</Text>
        <Text style={styles.postResources}>Resources: {post.resources}</Text>
        <Text style={styles.postTimeSpent}>Time Spent: {post.timeSpent}</Text>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Darker background for better contrast
  },
  header: {
    backgroundColor: '#1f1f1f', // Slightly lighter than the container
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row', // Add this line
    justifyContent: 'space-between', // Add this line
  },
  backIcon: {
    width: 24, // Set the width of the back icon
    height: 24, // Set the height of the back icon
    marginRight: 10, // Add some margin to the right of the icon
  },
  appTitle: {
    color: '#00FFFF', // Cyan color for the title
    fontSize: 28, // Larger font size
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium', // Custom font
    flex: 1, // Add this line
    textAlign: 'center', // Add this line
    marginRight:50,
  },
  friendStatusButton: {
    backgroundColor: 'grey', // Cyan background color
    paddingVertical: 10, // Padding for better touch area
    paddingHorizontal: 20, // Padding for better touch area
    borderRadius: 25, // Rounded corners
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5, // Elevation for Android shadow
    alignItems: 'center', // Center the text
    justifyContent: 'center', // Center the text
  },
  friendStatusButtonText: {
    color: 'black', // Black text color
    fontWeight: 'bold',
    fontSize: 16, // Slightly larger font size
    textAlign: 'center', // Center the text
  },

  sendFriendRequestButton: {
    backgroundColor: '#00FFFF', // Green background for the button
    paddingVertical: 10, // More padding for better touch area
    paddingHorizontal: 20,
    borderRadius: 25, // Rounded corners
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5, // Elevation for Android shadow
  },
  sendFriendRequestButtonText: {
    color: 'black', // White text color
    fontWeight: 'bold',
    fontSize: 16, // Slightly larger font size
    textAlign: 'center', // Center the text
  },
  friendRequestSentButton: {
    backgroundColor: 'grey', // Orange background to indicate a pending state
    paddingVertical: 10, // More padding for better touch area
    paddingHorizontal: 10,
    borderRadius: 25, // Rounded corners
    shadowColor: '#000', // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5, // Elevation for Android shadow
  },
  friendRequestSentButtonText: {
    color: 'black', // White text color
    fontWeight: 'bold',
    fontSize: 16, // Slightly larger font size
    textAlign: 'center', // Center the text
  },
  profileSection: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center', // Center items vertically
  },
  profileImage: {
    width: 90, // Larger profile image
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#00FFFF',
  },
  profileInfo: {
    marginLeft: 15,
  },
  name: {
    color: '#FFF',
    fontSize: 22, // Slightly larger font size
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium', // Custom font
  },
  jobTitle: {
    color: '#AAA',
    fontSize: 16, // Slightly larger font size
  },
  followerCount: {
    color: '#FFF',
    fontSize: 14, // Slightly larger font size
  },
  contactSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  contactText: {
    color: '#FFF',
    marginBottom: 5,
    fontSize: 16, // Slightly larger font size
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 20,
  },
  followButton: {
    backgroundColor: '#00FFFF',
    paddingVertical: 12, // More padding for better touch area
    paddingHorizontal: 35,
    borderRadius: 25, // Rounded corners
  },
  messageButton: {
    backgroundColor: '#FFF',
    paddingVertical: 12, // More padding for better touch area
    paddingHorizontal: 35,
    borderRadius: 25, // Rounded corners
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16, // Slightly larger font size
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#00FFFF', // Cyan color for section titles
    fontSize: 20, // Larger font size
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium', // Custom font
  },
  aboutText: {
    color: '#FFF',
    marginTop: 5,
    fontSize: 16, // Slightly larger font size
  },


  section: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5, // Elevation for Android shadow
  },
  sectionTitle: {
    color: '#00FFFF', // Cyan color for section titles
    fontSize: 24, // Larger font size
    fontWeight: 'bold',
    fontFamily: 'sans-serif-medium', // Custom font
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 5,
  },
  postTitle: {
    color: '#FFF',
    fontSize: 20, // Larger font size
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postDescription: {
    color: '#AAA',
    fontSize: 16, // Slightly larger font size
    marginBottom: 10,
  },
  postInfo: {
    color: '#FFF',
    fontSize: 16, // Slightly larger font size
    marginBottom: 5,
  },
  postLocation: {
    color: '#FFF',
    fontSize: 16, // Slightly larger font size
    marginBottom: 5,
  },
  postGoals: {
    color: '#FFF',
    fontSize: 16, // Slightly larger font size
    marginBottom: 5,
  },
  postResources: {
    color: '#FFF',
    fontSize: 16, // Slightly larger font size
    marginBottom: 5,
  },
  postTimeSpent: {
    color: '#FFF',
    fontSize: 16, // Slightly larger font size
    marginBottom: 5,
  },
  socialIcons: {
    flexDirection: 'row',
    marginTop: 10,
    
  },
  socialIcon: {
    width: 35, // Larger social icons
    height: 35,
    marginRight: 35, // More space between icons
  },

});

export default Postdetailscreen;
